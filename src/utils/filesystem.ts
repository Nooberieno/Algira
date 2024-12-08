import { readTextFile, writeTextFile, readDir } from "@tauri-apps/plugin-fs";
import { writable } from "svelte/store";

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

export const load_dir_structure = async(dir: string) => {
    try{
        let files = await readDir(dir)
        return files
    } catch (error){
        console.error("Error reading directory structure:", error)
    }
}


export const current_file_path = writable<string|null>(null)