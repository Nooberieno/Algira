import { open, save } from "@tauri-apps/plugin-dialog"

export const open_file_dialog = async() => {
    const file_path = await open({
        multiple: false,
        title: "Open file",
        directory: false
    })
    return file_path
}

export const save_file_dialog = async() => {
    const file_path = save({
        title: "Save as"
    })
    return file_path
}

export const open_dir_dialog = async() => {
    const dir_path = await open({
        multiple: false,
        directory: true,
        title: "Open folder"
    })
    return dir_path
}