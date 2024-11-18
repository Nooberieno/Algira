import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export const read_file = async (file_path: string) => {
    try {
        const content = await readTextFile(file_path)
        return content;
    }catch (error) {
        console.error("Error reading file: ", error)
        return null;
    }
}

export const write_file = async(file_path: string, contents: string) => {
    try{
        await writeTextFile(file_path, contents)
    }catch (error){
        console.error("Error writing to file")
    }
}