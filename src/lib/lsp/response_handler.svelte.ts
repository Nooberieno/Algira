import type * as LSP from "vscode-languageserver-protocol";

import { invoke } from "@tauri-apps/api/core";

import { position_to_offset, response_tracker } from "./lsp.svelte";
import { tabs, set_active_tab, create_tab_from_file } from "$lib/ui/tabs.svelte";
import { editor_views } from "$lib/ui/editors.svelte";
import { uri_to_file_path } from "$lib/utils/filesystem.svelte";


export function response_assigner(message: any){
    const pending = response_tracker.get(message.id)
    if(pending){
        pending.resolve(message.result)
        response_tracker.delete(message.id)
        return
    }
    console.log(`Unknown response for language ${message.language}`, message)
}

export async function goto_location(result: any){

    if(!result){
        console.log("No location found")
        return
    }

    if(result.uri) open_location(result.uri, result.range)

    if(Array.isArray(result) && result.length > 0 ){
        if(result[0].uri) open_location(result[0].uri, result[0].range)
        if(result[0].targetUri) open_location(result[0].targetUri, result[0].targetRange)
    }
}

function open_location(uri: LSP.URI, range: LSP.Range){
    const path = uri_to_file_path(uri)
    const tab = tabs.find((tab) => tab.path === path)

    let tab_id
    if(tab){
        set_active_tab(tab.id)
        tab_id = tab.id
    }else{
        create_tab_from_file(path)
        tab_id = tabs[tabs.length -1].id
    }
    const view = editor_views.get(tab_id)
    if(!view){
        console.log("no editor found for path", path)
        return
    }

    const start = position_to_offset(view.state.doc, range.start.line, range.start.character)
    const end = position_to_offset(view.state.doc, range.end.line, range.end.character)

    if(!start || !end){
        console.log("No definition found")
        return
    }

    view.dispatch({
        selection:{
            anchor: start,
            head: end
        },
        scrollIntoView: true
    })
}