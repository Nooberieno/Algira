// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use portable_pty::{native_pty_system, PtySize};
use std::{io::BufReader, sync::Arc};
use tauri::async_runtime::Mutex as AsyncMutex;

mod terminal;
use terminal::TermState;

mod dir_map;

mod lsp;

pub fn run() {
    let pty_sys = native_pty_system();

    let pty_pair = pty_sys
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .unwrap();

    let reader = pty_pair.master.try_clone_reader().unwrap();
    let writer = pty_pair.master.take_writer().unwrap();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_persisted_scope::init())

        .manage(TermState {
            pty_pair: Arc::new(AsyncMutex::new(pty_pair)),
            writer: Arc::new(AsyncMutex::new(writer)),
            reader: Arc::new(AsyncMutex::new(BufReader::new(reader))),
        })
        .invoke_handler(tauri::generate_handler![
            terminal::create_shell_process,
            terminal::pty_write,
            terminal::pty_read,
            terminal::pty_resize,
            dir_map::index_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
