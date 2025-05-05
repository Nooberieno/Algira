import { writable, get } from "svelte/store";
import { tick } from "svelte";

import Editor from "../../components/Editor.svelte";

import { active_extensions } from "../utils/cm-extensions.svelte";
import { get_language_from_file_extension, check_language, language_handler } from "$lib/utils/lang.svelte";
import { extract_tab_info } from "$lib/utils/filesystem.svelte";
import { content_to_doc, editor_views } from "./editors.svelte";
import { notify_document_opened } from "$lib/lsp/notifications.svelte";

export interface Tab {
    id: string,
    title: string,
    path?: string,
    language?: string,
    document_version?: number,
    element: any
}

export const tabs: Tab[] = $state([])

let untitled_count: number = $state(0)

export const active_id = writable<string>("")

export function set_active_tab(tab_id: string) {
    active_id.update(() => tab_id);
}

export function close_tab(tab_id: string) {
    const index = tabs.findIndex((t) => t.id === tab_id);
    if (index === -1) return tabs;
    tabs.splice(index, 1);
    delete active_extensions[tab_id]

    if (tabs.length > 0) {
        active_id.set(tabs[Math.min(index, tabs.length - 1)].id);
    } else {
        active_id.set("");
    }
}

export function create_new_tab(tab_element: any) {
    const new_tab = {
        id: crypto.randomUUID(),
        title: `Untitled-${untitled_count}`,
        element: tab_element,
        document_version: 0
    };
    untitled_count++
    tabs.push(new_tab)
    active_id.set(new_tab.id);
}

export function tab_switcher(){
    if(tabs.length === 1) return false
    else if(get(active_id) === tabs[tabs.length - 1].id){
        set_active_tab(tabs[0].id)
        return true
    }else{
        const tab = tabs.find((t) => t.id === get(active_id))
        if(tab){
            const index = tabs.indexOf(tab)
            set_active_tab(tabs[index + 1].id)
            return true
        }
        return false
    }
}

export function update_tab_info(tab: Tab, title: string, path: string = "", language: string | undefined = undefined){
    tab.title = title
    if((!tab.path || tab.path !== path) && path){
        tab.path = path
    }
    if(language && check_language(language)) tab.language = language
    else if(tab.path){
        tab.language = get_language_from_file_extension(tab.path)
    }
}

export async function create_tab_from_file(file_path: string){
    let tab = tabs.find((t) => file_path === t.path)
    console.log(tab?.path, tab?.id)
    if(tab){
        set_active_tab(tab.id)
        return
    } 
    const file_data = await extract_tab_info(file_path)
    const new_tab: Tab = ({
        id: crypto.randomUUID(),
        title: file_data.filename,
        path: file_path,
        language: file_data.language,
        document_version: 0,
        element: Editor
    })
    tabs.push(new_tab)
    set_active_tab(new_tab.id)

    if(file_data.language){
        await notify_document_opened(
            file_data.language,
            file_path,
            file_data.content,
            new_tab
        )
    }

    await tick()

    const editor = editor_views.get(new_tab.id)
    if(editor){
        language_handler(new_tab.id, new_tab.language)
        content_to_doc(editor, file_data.content)
    }
}