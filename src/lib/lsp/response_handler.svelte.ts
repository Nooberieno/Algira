import type * as LSP from "vscode-languageserver-protocol";

import { invoke } from "@tauri-apps/api/core";

import { position_to_offset, request_stack, servers } from "./lsp.svelte";
import { tabs, set_active_tab, create_tab_from_file } from "$lib/ui/tabs.svelte";
import { editor_views } from "$lib/ui/editors.svelte";
import { current_platform } from "$lib/keybindings/keymap.svelte";

export async function lsp_initialization(message: any){
    const server = servers.find((server) => server.language === message.language)
      if(!server){
        console.error("Could not find server for repsonse with language: ", message.language)
        return
      }
      server.capabilities = message.result.capabilities
      server.ready = true

      console.log(server)

    await invoke("send_notification", {
        language: message.language,
        method: "initialized",
        params: {}
      })
}

export async function goto_location(message: any){
    const result = message.result

    if(!result){
        console.log("No location found")
        return
    }

    if(result.uri) open_location(result.uri, result.range)

    if(Array.isArray(result) && result.length > 0 ){
        if(result[0].uri) open_location(result[0].uri, result[0].range)
        if(result[0].targetUri) open_location(result[0].targetUri, result[0].targetRange)
    }
    request_stack.delete(message.id)
}

function open_location(uri: LSP.URI, range: LSP.Range){
    let path = uri.replace(/^file:\/\//, "")
                    .replace(/%3A/g, ":")
                    .replace(/%5C/g, "\\")
                    .replace(/%20/g, " ")
    if(current_platform === "win"){
        path = path.replace(/^\//, "").replace(/\//g, "\\").replace(/^([a-zA-Z]:)/, (_, drive) => drive.toUpperCase())
    }

    const tab = tabs.find((tab) => {
        if(!tab.path) return false
        let normalized_tab_path = tab.path
        if(current_platform === "win") normalized_tab_path = tab.path.replace(/\\/g, "\\")
        console.log("Comparing paths: ", path, normalized_tab_path, (path === normalized_tab_path))
        return path === normalized_tab_path
    })

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