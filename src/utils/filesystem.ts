import { readTextFile } from "@tauri-apps/plugin-fs";

export const read_file = async (file_path: string) => {
    try {
        const content = await readTextFile(file_path)
        return content;
    }catch (error) {
        console.error("Error reading file: ", error)
        return null;
    }
}