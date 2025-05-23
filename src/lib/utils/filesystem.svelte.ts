import type { EditorView } from "codemirror";
import type { FileEntry } from "$lib/ui/directory.svelte";

import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile, readDir } from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { get } from "svelte/store";

import { active_id, tabs, set_active_tab, update_tab_info, create_tab_from_file } from "../ui/tabs.svelte";
import { get_language_from_file_extension, language_handler } from "./lang.svelte";
import { working_directory } from "$lib/ui/directory.svelte";
import { content_to_doc, editor_views } from "../ui/editors.svelte";
import { update_workspaces, notify_document_opened } from "../lsp/notifications.svelte"
import { current_platform } from "$lib/keybindings/keymap.svelte";

export const open_new_file = async() => {
    console.log("Opening file")
    const file_path = await open({
        multiple: false,
        title: "Open file",
        directory: false,
    })
    if(!file_path) return false
    let tab = tabs.find((t) => file_path === t.path)
    if (tab){
        set_active_tab(tab.id)
        return true
    }
    tab = tabs.find((t) => get(active_id) === t.id)
    const filename = await path.basename(file_path)
    if(tab){
        if(filename !== tab.title){
            const text = await readTextFile(file_path)
            const view = editor_views.get(tab.id)
            if(view){
                update_tab_info(tab, filename, file_path)
                language_handler(tab.id, tab.language)
                console.log(tab.language)
                content_to_doc(view, text)
                
                if(tab.language){
                    await notify_document_opened(
                        tab.language,
                        file_path,
                        text,
                        tab
                    )
                }
            }
        }
    }else{
        create_tab_from_file(file_path)
    }
}

export const save_text_file = async(view: EditorView) => {
    console.log("Saving file")
    const tab = tabs.find((t) => t.id === get(active_id))
    if(!tab) return false
    if(tab.path){
        await writeTextFile(tab.path, view.state.doc.toString())
        return true
    }else{
        const file_path = await save({
            title: "Save as"
        })
        if(file_path){
            update_tab_info(tab, await path.basename(file_path), file_path)
            language_handler(tab.id, tab.language)
            console.log(tab.language)
            const text = view.state.doc.toString()
            await writeTextFile(file_path, text)
            if(tab.language){
                await notify_document_opened(
                    tab.language,
                    file_path,
                    text,
                    tab
                )
            }
            return true
        }
    }
    return false
}

export const open_new_working_directory = async() => {
    console.log("Opening new working directory")
    const dir = await open({
        directory: true,
        multiple: false,
        title: "Open folder"
    })
    if(!dir) return false
    const current_dir = get(working_directory)
    working_directory.update(() => dir)
    try{
        const added = [{
            uri: file_path_to_uri(dir),
            name: await path.basename(dir)
        }]

        const removed = current_dir ? [{
            uri: file_path_to_uri(current_dir),
            name: await path.basename(current_dir)
        }] : []
        await update_workspaces(added, removed)
        return true
    } catch(error){
        console.error("Failed to update workspace")
        return false
    }
}

export async function load_directory(directory_path: string, recursive: boolean = false){
    try{
        const entries = await readDir(directory_path)
        const items: FileEntry[] = []
        for(const entry of entries){
            const item_path = await path.join(directory_path, entry.name)
            const item: FileEntry = ({
                name: entry.name,
                path: item_path,
                is_directory: entry.isDirectory,
                is_collapsed: true,
                children: entry.isDirectory? [] : undefined
            })
            if(recursive && entry.isDirectory){
                item.children = await load_directory(item_path, true)
            }
            items.push(item)
        }
        return items.sort((a, b) => {
            if(a.is_directory === b.is_directory) return a.name.localeCompare(b.name)
            return a.is_directory ? -1: 1
        })
    } catch(error){
        console.error("Error loading directory: ", 
            error,
            directory_path
        )
        return []
    }
}

export async function extract_tab_info(file_path: string){
    const filename = await path.basename(file_path)
    const content = await readTextFile(file_path)
    const language = get_language_from_file_extension(file_path)

    return {
        filename,
        content,
        language
    }
}

export function file_path_to_uri(file_path: string): string{
    let path = file_path.replace(/\\/g, "/")
    if(!path.startsWith("/")) path = "/" + path
    return `file://${encodeURI(path)}`
}

export function uri_to_file_path(uri: string): string{
    let path = uri.replace(/^file:\/\//, "")
                    .replace(/%3A/g, ":")
                    .replace(/%5C/g, "\\")
                    .replace(/%20/g, " ")
    if(current_platform === "win"){
        path = path.replace(/^\//, "").replace(/\//g, "\\").replace(/^([a-zA-Z]:)/, (_, drive) => drive.toUpperCase())
    }
    return path
}