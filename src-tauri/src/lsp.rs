use std::{collections::HashMap, sync::Arc, process};
use serde_json::{json, Value};
use tokio::{
    sync::Mutex,
    time::Duration
};
use tauri::{Emitter, State};

mod rcp;
mod server_handler;
use server_handler::{InboundMessage, LspClient, LspError, RealLspClient};

#[derive(Clone)]
pub struct LspState{
    pub clients: Arc<Mutex<HashMap<String, Arc<Mutex<RealLspClient>>>>>
}

pub async fn start_lsp(servers: HashMap<String, String>) -> Result<LspState, LspError> {
    let mut clients = HashMap::new();

    for (language, command) in servers {
        let client = server_handler::start_lsp(&command).await?;
        clients.insert(language, Arc::new(Mutex::new(client)));
    }

    Ok(LspState {
        clients: Arc::new(Mutex::new(clients)),
    })
}


pub fn start_lsp_listener(app_handle: tauri::AppHandle, state: LspState) {
    let clients = state.clients.clone();

    tauri::async_runtime::spawn(async move {
        loop {
            let clients = clients.lock().await;
            for (language, client) in clients.iter() {
                let mut client = client.lock().await;
                match client.recv_response().await {
                    Ok(Some((msg, _))) => {
                        let payload = match &msg {
                            InboundMessage::Message(resp) => json!({"language": language, "id": resp.id, "result": resp.result}),
                            InboundMessage::Notification(notif) => json!({"language": language, "method": notif.method, "params": notif.params}),
                            InboundMessage::Error(err) => json!({"language": language, "code": err.code, "message": err.message}),
                            InboundMessage::ProcessingError(err) => json!({"language": language, "error": err.to_string()}),
                        };
                        if let Err(err) = app_handle.emit("lsp-message", payload) {
                            eprintln!("Failed to emit LSP message: {}", err);
                        }
                    }
                    Err(err) => {
                        eprintln!("LSP Response Error for {}: {:?}", language, err);
                    }
                    _ => {}
                }
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    });
}

#[tauri::command]
pub async fn send_request(
    language: String, // Add language parameter
    method: String,
    params: Value,
    state: State<'_, LspState>,
) -> Result<(), String> {
    let clients = state.clients.lock().await;
    if let Some(client) = clients.get(&language) {
        let mut client = client.lock().await;
        client.send_request(&method, params).await.map_err(|e| e.to_string())?;
    } else {
        return Err(format!("No LSP server found for language: {}", language));
    }
    Ok(())
}

#[tauri::command]
pub async fn send_notification(
    language: String,
    method: String,
    params: Value,
    state: State<'_, LspState>,
) -> Result<(), String> {
    let clients = state.clients.lock().await;
    if let Some(client) = clients.get(&language) {
        let mut client = client.lock().await;
        client.send_notification(&method, params).await.map_err(|e| e.to_string())?;
    } else {
        return Err(format!("No LSP server found for language: {}", language));
    }
    Ok(())
}

#[tauri::command]
pub async fn start_language_server(
    language: String,
    command: String,
    state: State<'_, LspState>
) -> Result<u32, String>{
    let mut clients = state.clients.lock().await;
    if clients.contains_key(&language){
        return Err(format!("LSP server for {} is already running", language));
    }

    let client = server_handler::start_lsp(&command).await.map_err(|e| e.to_string())?;
    clients.insert(language, Arc::new(Mutex::new(client)));
    Ok(process::id().into())
}