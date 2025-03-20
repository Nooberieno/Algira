use std::sync::Arc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::{
    sync::Mutex,
    time::Duration
};
use tauri::Emitter;

mod rcp;
mod server_handler;
use server_handler::{InboundMessage, LspClient, LspError, RealLspClient};

#[derive(Clone, Serialize, Deserialize)]
pub struct LspState{
    pub client: Arc<Mutex<RealLspClient>>
}

pub async fn start_lsp() -> Result<LspState, LspError>{
    let client = server_handler::start_lsp().await?;
    let state = LspState{
        client: Arc::new(Mutex::new(client)),
    };
    Ok(state)
}

pub fn start_lsp_listener(app_handle: tauri::AppHandle, state: LspState){
    let client = state.client.clone();

    tauri::async_runtime::spawn(async move {
        let mut client = client.lock().await;

        loop {
            match client.recv_response().await{
                Ok(Some((msg, _))) => {
                    let payload = match &msg{
                        InboundMessage::Message(resp) => json!({"id": resp.id, "result": resp.result}),
                        InboundMessage::Notification(notif) => json!({"method": notif.method, "params": notif.params}),
                        InboundMessage::Error(err) => json!({"code": err.code, "message": err.message}),
                        InboundMessage::ProcessingError(err) => json!({ "error": err.to_string() }),
                    };
                    if let Err(err) = app_handle.emit("lsp-message", payload) {
                        eprintln!("Failed to emit LSP message: {}", err);
                    }
                }
                Err(err) => {
                    eprintln!("LSP Response Error: {:?}", err);
                }
                _ => {
                    tokio::time::sleep(Duration::from_millis(100)).await;
                }
            }
        }
    });
}

#[tauri::command]
pub async fn send_request(
    method: String,
    params: Value,
    state: LspState
) -> Result<(), String>{
    let mut client = state.client.lock().await;
    client.send_request(&method, params).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn send_notification(
    method: String,
    params: Value,
    state: LspState
) -> Result<(), String>{
    let mut client = state.client.lock().await;
    client.send_notification(&method, params).await.map_err(|e| e.to_string())?;
    Ok(())
}