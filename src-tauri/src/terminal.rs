use portable_pty::{CommandBuilder, PtyPair, PtySize, native_pty_system};
use std::{
    collections::HashMap, io::{BufReader, Read, Write}, sync::Arc
};
use tauri::{async_runtime::Mutex as AsyncMutex, AppHandle, Emitter, State};

pub struct TermState {
    pub pty_pair: Arc<AsyncMutex<HashMap<String, PtyPair>>>,
    pub writer: Arc<AsyncMutex<HashMap<String, Box<dyn Write + Send>>>>,
}

#[tauri::command]
pub async fn create_shell_process(id: String, dir: Option<String>, state: State<'_, TermState>, app: AppHandle) -> Result<(), String> {
    println!("Creating shell process for terminal with id {}", id);
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
    let cmd = {
        #[cfg(not(target_os = "windows"))]
        {
            let mut cmd = CommandBuilder::new("bash");
            cmd.env("TERM", "xterm-256color");
            match dir {
                Some(dir) => {
                    cmd.cwd(dir);
                },
                None => ()
            };
            cmd
        }
        #[cfg(target_os = "windows")]
        {
            let mut cmd = CommandBuilder::new("powershell.exe");
            cmd.env("TERM", "cygwin");
            match dir {
                Some(dir) => {
                    cmd.cwd(dir);
                },
                None => ()
            };
            cmd
        }
    };

    let mut child = pty_pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| e.to_string())?;

    let id_clone = id.clone();
    let app_clone = app.clone();
    let pty_pair_arc = state.pty_pair.clone();
    let writer_arc = state.writer.clone();
    tokio::task::spawn_blocking(move || {
        match child.wait() {
            Ok(status) => {
                if !status.success() {
                    eprintln!("Shell process exited with status: {}", status);
                }
                tauri::async_runtime::spawn(drop_pty_resources(id_clone, writer_arc, pty_pair_arc, app_clone));
            }
            Err(e) => eprintln!("Error waiting for shell process: {}", e),
        }
    });

    let id_clone = id.clone();
    tokio::task::spawn_blocking( move || {
        let mut reader = BufReader::new(reader);
        loop {
            let mut buf = [0; 1024];
            match reader.read(&mut buf){
                Ok(n) if n > 0 => {
                    let output = String::from_utf8_lossy(&buf[..n]).to_string();
                    app.emit("terminal-data", serde_json::json!({"id": id_clone, "data": output})).unwrap();
                },
                _ => {
                    break;
                }
            }
        }
    });
    state.pty_pair.lock().await.insert(id.clone(), pty_pair);
    state.writer.lock().await.insert(id.clone(), writer);
    Ok(())
}

#[tauri::command]
pub async fn pty_write(id: String, data: &str, state: State<'_, TermState>) -> Result<(), ()> {
    write!(state.writer.lock().await.get_mut(&id).ok_or(())?, "{}", data).map_err(|_| ())
}

#[tauri::command]
pub async fn pty_resize(id: String, rows: u16, cols: u16, state: State<'_, TermState>) -> Result<(), ()> {
    state
        .pty_pair
        .lock()
        .await
        .get(&id)
        .ok_or(())?
        .master
        .resize(PtySize {
            rows,
            cols,
            ..Default::default()
        })
        .map_err(|_| ())
}


async fn drop_pty_resources(id: String, writer_arc: Arc<AsyncMutex<HashMap<String, Box<dyn Write + Send >>>>, pty_pair_arc: Arc<AsyncMutex<HashMap<String, PtyPair>>> , app: AppHandle){
    if let Some(pty_pair) = pty_pair_arc.lock().await.remove(&id){
        drop(pty_pair);
    }
    writer_arc.lock().await.remove(&id);
    app.emit("terminal-exit", serde_json::json!({"id": id})).unwrap();
}

#[tauri::command]
pub async fn close_terminal(id: String, state: State<'_, TermState>, app: AppHandle) -> Result<(), ()>{
    Ok(drop_pty_resources(id, state.writer.clone(), state.pty_pair.clone(), app).await)
}