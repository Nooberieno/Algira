use std::{
    collections::HashMap,
    env,
    fmt::{self, Display, Formatter},
    path::PathBuf,
    process::{self, Stdio},
    sync::atomic::AtomicUsize,
    time::{Duration, Instant},
};

use serde_json::{json, Value};
use tokio::{
    io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader, BufWriter},
    process::{ChildStdin, Command},
    sync::mpsc::{self, error::TryRecvError},
};

use super::rcp;

static ID: AtomicUsize = AtomicUsize::new(1);
const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

#[derive(Debug)]
pub enum LspError {
    RequestTimeout(Duration),
    ServerError(String),
    ProtocolError(String),
    IoError(std::io::Error),
    JsonError(serde_json::Error),
    ChannelError(tokio::sync::mpsc::error::SendError<OutboundMessage>),
}

impl std::error::Error for LspError {}

impl Display for LspError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            LspError::RequestTimeout(duration) => {
                write!(f, "LSP request timed out after {:?}", duration)
            }
            LspError::ServerError(msg) => write!(f, "LSP server error: {}", msg),
            LspError::ProtocolError(msg) => write!(f, "LSP protocol error: {}", msg),
            LspError::IoError(err) => write!(f, "IO error: {}", err),
            LspError::JsonError(err) => write!(f, "JSON error: {}", err),
            LspError::ChannelError(err) => write!(f, "Channel error: {}", err),
        }
    }
}

impl From<std::io::Error> for LspError {
    fn from(err: std::io::Error) -> Self {
        LspError::IoError(err)
    }
}

impl From<serde_json::Error> for LspError {
    fn from(err: serde_json::Error) -> Self {
        LspError::JsonError(err)
    }
}

impl From<tokio::sync::mpsc::error::SendError<OutboundMessage>> for LspError {
    fn from(err: tokio::sync::mpsc::error::SendError<OutboundMessage>) -> Self {
        LspError::ChannelError(err)
    }
}

#[derive(Debug)]
pub struct NotificationRequest {
    method: String,
    params: Value,
}

impl Display for NotificationRequest {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let truncated_params = if self.params.to_string().len() > 100 {
            format!("{}...", &self.params.to_string()[..100])
        } else {
            self.params.to_string()
        };

        write!(
            f,
            "Request {{ method: {}, params: {} }}",
            self.method, truncated_params
        )
    }
}

#[derive(Debug)]
pub struct Request {
    id: i64,
    method: String,
    params: Value,
    timestamp: Instant,
}

impl Request {
    pub fn new(method: &str, params: Value) -> Request {
        Request {
            id: next_id() as i64,
            method: method.to_string(),
            params,
            timestamp: Instant::now(),
        }
    }
}

impl Display for Request {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let truncated_params = if self.params.to_string().len() > 100 {
            format!("{}...", &self.params.to_string()[..100])
        } else {
            self.params.to_string()
        };

        write!(
            f,
            "Request {{ id: {}, method: {}, params: {} }}",
            self.id, self.method, truncated_params
        )
    }
}

#[derive(Debug, Clone)]
pub struct ResponseMessage {
    pub id: i64,
    pub result: Value,
}

#[derive(Debug)]
#[allow(unused)]
pub struct Notification {
    method: String,
    params: Value,
}

#[derive(Debug)]
#[allow(unused)]
pub struct ResponseError {
    code: i64,
    message: String,
    data: Option<Value>,
}

#[derive(Debug)]
pub enum OutboundMessage {
    Request(Request),
    Notification(NotificationRequest),
}

impl Display for OutboundMessage {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            OutboundMessage::Request(req) => write!(f, "Request({})", req),
            OutboundMessage::Notification(req) => write!(f, "Notification({})", req),
        }
    }
}

#[derive(Debug)]
pub enum InboundMessage {
    Message(ResponseMessage),
    Notification(Notification),
    Error(ResponseError),
    ProcessingError(LspError),
}

pub async fn start_lsp() -> Result<RealLspClient, LspError> {
    let mut child = Command::new("rust-analyzer")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    let stdin = child.stdin.take().unwrap();
    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();

    let (request_tx, mut request_rx) = mpsc::channel::<OutboundMessage>(32);
    let (response_tx, response_rx) = mpsc::channel::<InboundMessage>(32);

    // Sends requests from the editor into LSP's stdin
    let rtx = response_tx.clone();
    tokio::spawn(async move {
        let mut stdin = BufWriter::new(stdin);
        while let Some(message) = request_rx.recv().await {
            match message {
                OutboundMessage::Request(req) => {
                    if let Err(err) = lsp_send_request(&mut stdin, &req).await {
                        rtx.send(InboundMessage::ProcessingError(err))
                            .await
                            .unwrap();
                    }
                }
                OutboundMessage::Notification(req) => {
                    if let Err(err) = lsp_send_notification(&mut stdin, &req).await {
                        rtx.send(InboundMessage::ProcessingError(err))
                            .await
                            .unwrap();
                    }
                }
            }
        }
    });

    // Sends responses from LSP's stdout to the editor
    let rtx = response_tx.clone();
    tokio::spawn(async move {
        let mut reader = BufReader::new(stdout);

        loop {
            let mut line = String::new();
            let read = match reader.read_line(&mut line).await {
                Ok(n) => n,
                Err(err) => {
                    rtx.send(InboundMessage::ProcessingError(LspError::IoError(err)))
                        .await
                        .unwrap();
                    continue;
                }
            };

            if read > 0 && line.starts_with("Content-Length: ") {
                let len = match line
                    .trim_start_matches("Content-Length: ")
                    .trim()
                    .parse::<usize>()
                {
                    Ok(len) => len,
                    Err(_) => {
                        rtx.send(InboundMessage::ProcessingError(LspError::ProtocolError(
                            "Invalid Content-Length".to_string(),
                        )))
                        .await
                        .unwrap();
                        continue;
                    }
                };

                reader.read_line(&mut line).await.unwrap(); // empty line

                let mut body = vec![0; len];
                if let Err(err) = reader.read_exact(&mut body).await {
                    rtx.send(InboundMessage::ProcessingError(LspError::IoError(err)))
                        .await
                        .unwrap();
                    continue;
                };

                let body = String::from_utf8_lossy(&body);
                let res = match serde_json::from_str::<serde_json::Value>(&body) {
                    Ok(res) => res,
                    Err(err) => {
                        rtx.send(InboundMessage::ProcessingError(LspError::JsonError(err)))
                            .await
                            .unwrap();
                        continue;
                    }
                };

                if let Some(error) = res.get("error") {
                    let code = error["code"].as_i64().unwrap();
                    let message = error["message"].as_str().unwrap().to_string();
                    let data = error.get("data").cloned();

                    rtx.send(InboundMessage::Error(ResponseError {
                        code,
                        message,
                        data: Some(data.expect("no data")),
                    }))
                    .await
                    .unwrap();

                    continue;
                }

                // if there's an id, it's a response
                if let Some(id) = res.get("id") {
                    let id = id.as_i64().unwrap();
                    let result = res["result"].clone();

                    rtx.send(InboundMessage::Message(ResponseMessage { id, result }))
                        .await
                        .unwrap();
                } else {
                    // if there's no id, it's a notification
                    let method = res["method"].as_str().unwrap().to_string();
                    let params = res["params"].clone();
                    rtx.send(InboundMessage::Notification(Notification {
                        method,
                        params,
                    }))
                    .await
                    .unwrap();
                }
            }
        }
    });

    // Sends errors from LSP's stderr to the editor
    let rtx = response_tx.clone();
    tokio::spawn(async move {
        let mut reader = BufReader::new(stderr);
        let mut line = String::new();
        while let Ok(read) = reader.read_line(&mut line).await {
            if read > 0 {
                match rtx
                    .send(InboundMessage::ProcessingError(LspError::ServerError(
                        line.clone(),
                    )))
                    .await
                {
                    Ok(_) => (),
                    Err(_err) => {
                    }
                }
            }
        }
    });

    Ok(RealLspClient {
        request_tx,
        response_rx,
        pending_responses: HashMap::new(),
    })
}

#[async_trait::async_trait]
pub trait LspClient: Send {
    async fn initialize(&mut self) -> Result<(), LspError>;
    async fn send_request(&mut self, method: &str, params: Value) -> Result<i64, LspError>;
    async fn send_notification(&mut self, method: &str, params: Value) -> Result<(), LspError>;
    async fn recv_response(&mut self)
        -> Result<Option<(InboundMessage, Option<String>)>, LspError>;
}

pub struct RealLspClient {
    request_tx: mpsc::Sender<OutboundMessage>,
    response_rx: mpsc::Receiver<InboundMessage>,
    pending_responses: HashMap<i64, (String, Instant)>,
}

#[async_trait::async_trait]
impl LspClient for RealLspClient {
    async fn send_request(&mut self, method: &str, params: Value) -> Result<i64, LspError> {
        let req = Request::new(method, params);
        let id = req.id;
        let timestamp = req.timestamp;

        self.pending_responses
            .insert(id, (method.to_string(), timestamp));
        self.request_tx.send(OutboundMessage::Request(req)).await?;

        Ok(id)
    }

    async fn send_notification(&mut self, method: &str, params: Value) -> Result<(), LspError> {
        self.request_tx
            .send(OutboundMessage::Notification(NotificationRequest {
                method: method.to_string(),
                params,
            }))
            .await?;
        Ok(())
    }

    async fn recv_response(
        &mut self,
    ) -> Result<Option<(InboundMessage, Option<String>)>, LspError> {
        // Check for timeouts
        let now = Instant::now();
        let timed_out: Vec<_> = self
            .pending_responses
            .iter()
            .filter(|(_, (_, timestamp))| now.duration_since(*timestamp) > REQUEST_TIMEOUT)
            .map(|(&id, _)| id)
            .collect();

        for id in timed_out {
            if let Some((method, timestamp)) = self.pending_responses.remove(&id) {
                return Ok(Some((
                    InboundMessage::ProcessingError(LspError::RequestTimeout(
                        now.duration_since(timestamp),
                    )),
                    Some(method),
                )));
            }
        }

        match self.response_rx.try_recv() {
            Ok(msg) => {
                if let InboundMessage::Message(msg) = &msg {
                    if let Some((method, _)) = self.pending_responses.remove(&msg.id) {
                        return Ok(Some((InboundMessage::Message(msg.clone()), Some(method))));
                    }
                }
                Ok(Some((msg, None)))
            }
            Err(TryRecvError::Empty) => Ok(None),
            Err(err) => Err(LspError::ProtocolError(err.to_string())),
        }
    }

    async fn initialize(&mut self) -> Result<(), LspError> {
        // Get the current working directory
        let workspace_path = env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .canonicalize()
            .unwrap_or_else(|_| PathBuf::from("."));

        // Convert to URI format (file:///path/to/workspace)
        let workspace_uri = format!("file://{}", workspace_path.display()).replace("\\", "/"); // Handle Windows paths if needed

        self.send_request(
            "initialize",
            json!({
                "processId": process::id(),
                "clientInfo": {
                    "name": "red",
                    "version": "0.1.0",
                },
                "rootUri": workspace_uri,
                "workspaceFolders": [{
                    "uri": workspace_uri,
                    "name": "red"
                }],
                "capabilities": {
                    "textDocument": {
                        "completion": {
                            "completionItem": {
                                "snippetSupport": true,
                            }
                        },
                        "definition": {
                            "dynamicRegistration": true,
                            "linkSupport": false,
                        },
                        "synchronization": {
                            "dynamicRegistration": true,
                            "willSave": true,
                            "willSaveWaitUntil": true,
                            "didSave": true,
                        },
                        "hover": {
                            "dynamicRegistration": true,
                            "contentFormat": ["plaintext"],
                        },
                        "formatting": {
                            "dynamicRegistration": true,
                        },
                        "documentSymbol": {
                            "dynamicRegistration": true,
                            "symbolKind": {
                                "valueSet": [
                                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                                    17, 18, 19, 20, 21, 22, 23, 24, 25, 26
                                ]
                            },
                            "hierarchicalDocumentSymbolSupport": true
                        },
                        "codeAction": {
                            "dynamicRegistration": true,
                            "codeActionLiteralSupport": {
                                "codeActionKind": {
                                    "valueSet": [
                                        "quickfix",
                                        "refactor",
                                        "refactor.extract",
                                        "refactor.inline",
                                        "refactor.rewrite",
                                        "source",
                                        "source.organizeImports"
                                    ]
                                }
                            }
                        },
                        "signatureHelp": {
                            "dynamicRegistration": true,
                            "signatureInformation": {
                                "documentationFormat": ["plaintext", "markdown"],
                                "parameterInformation": {
                                    "labelOffsetSupport": true
                                },
                                "activeParameterSupport": true
                            }
                        },
                        "documentHighlight": {
                            "dynamicRegistration": true
                        },
                        "documentLink": {
                            "dynamicRegistration": true,
                            "tooltipSupport": true
                        },
                        "colorProvider": {
                            "dynamicRegistration": true
                        },
                        "foldingRange": {
                            "dynamicRegistration": true,
                            "lineFoldingOnly": true
                        },
                        "semanticTokens": {
                            "dynamicRegistration": true,
                            "requests": {
                                "full": true
                            },
                            "tokenTypes": [
                                "namespace", "type", "class", "enum", "interface",
                                "struct", "typeParameter", "parameter", "variable",
                                "property", "enumMember", "event", "function",
                                "method", "macro", "keyword", "modifier", "comment",
                                "string", "number", "regexp", "operator"
                            ],
                            "tokenModifiers": [
                                "declaration", "definition", "readonly", "static",
                                "deprecated", "abstract", "async", "modification",
                                "documentation", "defaultLibrary"
                            ],
                            "formats": ["relative"]
                        },
                        "inlayHint": {
                            "dynamicRegistration": true,
                            "resolveSupport": {
                                "properties": ["tooltip", "textEdits", "label.tooltip", "label.location", "label.command"]
                            }
                        }
                    }
                },
                "workspace": {
                    "symbol": {
                        "dynamicRegistration": true,
                        "symbolKind": {
                            "valueSet": [
                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                                17, 18, 19, 20, 21, 22, 23, 24, 25, 26
                            ]
                        }
                    },
                    "workspaceEdit": {
                        "documentChanges": true,
                        "resourceOperations": ["create", "rename", "delete"]
                    }
                }
            }),
        )
        .await?;

        // TODO: do we need to do anything with response?
        _ = self.recv_response().await;

        self.send_notification("initialized", json!({})).await?;

        Ok(())
    }
}

pub async fn lsp_send_request(
    stdin: &mut BufWriter<ChildStdin>,
    req: &Request,
) -> Result<i64, LspError> {
    let id = req.id;
    let req = json!({
        "id": req.id,
        "jsonrpc": "2.0",
        "method": req.method,
        "params": req.params,
    });
    let body = serde_json::to_string(&req)?;
    let req = format!("Content-Length: {}\r\n\r\n{}", body.len(), body);
    stdin.write_all(req.as_bytes()).await?;
    stdin.flush().await?;

    Ok(id)
}

pub async fn lsp_send_notification(
    stdin: &mut BufWriter<ChildStdin>,
    req: &NotificationRequest,
) -> Result<(), LspError> {
    let req = json!({
        "jsonrpc": "2.0",
        "method": req.method,
        "params": req.params,
    });
    let req = rcp::encode_message(req);
    stdin.write_all(req.as_bytes()).await?;

    Ok(())
}

pub fn next_id() -> usize {
    ID.fetch_add(1, std::sync::atomic::Ordering::SeqCst)
}

#[cfg(test)]
mod test {
    use super::*;

    #[tokio::test]
    async fn test_start_lsp() {
        let mut client = start_lsp().await.unwrap();
        client.initialize().await.unwrap();
    }
}