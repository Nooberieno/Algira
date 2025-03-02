use portable_pty::{ CommandBuilder, PtyPair, PtySize };
use std::{
    io::{BufRead, BufReader, Read, Write},
    process::exit,
    sync::Arc,
    thread::{self},
};
use tauri::{async_runtime::Mutex as AsyncMutex, State};

pub struct TermState {
    pub pty_pair: Arc<AsyncMutex<PtyPair>>,
    pub writer: Arc<AsyncMutex<Box<dyn Write + Send>>>,
    pub reader: Arc<AsyncMutex<BufReader<Box<dyn Read + Send>>>>,
}

#[tauri::command]
pub async fn create_shell_process(state: State<'_, TermState>) -> Result<(), String>{
    let mut cmd = CommandBuilder::new("bash");
    cmd.env("PTY", "xterm-256-color");

    let mut child = state.pty_pair.lock().await.slave.spawn_command(cmd).map_err(|e| e.to_string())?;

    thread::spawn(move || {
        let status = child.wait().unwrap();
        exit(status.exit_code() as i32);
    });
    Ok(())
}

#[tauri::command]
pub async fn pty_write(data: &str, state: State<'_, TermState>) -> Result<(), ()>{
    write!(state.writer.lock().await, "{}", data).map_err(|_| ())
}

#[tauri::command]
pub async fn pty_read(state: State<'_, TermState>) -> Result<Option<String>, ()>{
    let mut reader = state.reader.lock().await;
    let data =  {
        let data = reader.fill_buf().map_err(|_| ())?;

        if data.len() > 0{
            std::str::from_utf8(data).map(|v| Some(v.to_string())).map_err(|_| ())?
        }else{
            None
        }
    };
    if let Some(data) = &data {
        reader.consume(data.len());
    };
    Ok(data)
}

#[tauri::command]
pub async fn pty_resize(rows: u16, cols: u16, state: State<'_, TermState>) -> Result<(), ()>{
    state.pty_pair.lock().await.master.resize(PtySize { rows, cols, ..Default::default()}).map_err(|_| ())
}