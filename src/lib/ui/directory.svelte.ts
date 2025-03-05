import { writable } from "svelte/store";

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