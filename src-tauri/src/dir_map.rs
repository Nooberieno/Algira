use std::fs;
use std::path::Path;
use serde::Serialize;

#[derive(Serialize)]
pub struct FileItem{
    path: String,
    name: String,
}

#[tauri::command]
pub async fn index_directory(dir_path: &str) -> Result<Vec<FileItem>, String>{
    let mut files = Vec::new();
    index_directory_recursive(Path::new(dir_path), &mut files)?;
    Ok(files.into())
}

fn index_directory_recursive(dir: &Path, files: &mut Vec<FileItem>) -> Result<(), String>{
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())?{
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.file_name()
            .and_then(|n| n.to_str())
            .map(|s| s == ".git")
            .unwrap_or(false)
        {
            continue;
        }

        if path.is_dir(){
            index_directory_recursive(&path, files)?;
        }else{
            files.push(FileItem{
                path: path.to_string_lossy().into_owned(),
                name: path.file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("")
                        .to_string()   
            });
        }

    }
    Ok(())
}