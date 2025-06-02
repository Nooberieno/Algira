// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::collections::HashMap;
use std::sync::Arc;
use tauri::async_runtime::Mutex as AsyncMutex;
use tauri::Manager;

mod terminal;
use terminal::TermState;

mod dir_map;

mod lsp;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match lsp::start_lsp(HashMap::new(), &[]).await {
                    Ok(state) => {
                        println!("LSP started succesfully");
                        handle.manage(state.clone());
                        lsp::start_lsp_listener(handle, state);
                    }
                    Err(err) => {
                        eprintln!("Failed to start LSP: {}", err);
                    }
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_persisted_scope::init())

        .manage(TermState {
            pty_pair: Arc::new(AsyncMutex::new(HashMap::new())),
            writer: Arc::new(AsyncMutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            terminal::create_shell_process,
            terminal::pty_write,
            terminal::pty_resize,
            terminal::close_terminal,
            dir_map::index_directory,
            lsp::send_notification,
            lsp::send_request,
            lsp::start_language_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
