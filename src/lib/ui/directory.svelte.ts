import { writable, get } from "svelte/store";
import { path } from "@tauri-apps/api";

import { load_directory } from "$lib/utils/filesystem.svelte";

export const working_directory = writable<string>()

export interface FileEntry {
    name: string,
    path: string,
    children?: FileEntry[],
    is_collapsed: boolean,
    is_directory: boolean
}

export async function toggle_directory(entry: FileEntry){
    if(!entry.is_directory) return

    entry.is_collapsed = !entry.is_collapsed

    if(!entry.is_collapsed && (!entry.children || entry.children.length === 0)){
        entry.children = await load_directory(entry.path)
    }
}

export async function get_working_directory_name(){
    const name = await path.basename(get(working_directory))
    return name
}