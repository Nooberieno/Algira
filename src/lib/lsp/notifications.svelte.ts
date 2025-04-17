import type * as LSP from "vscode-languageserver-protocol"

import { invoke } from "@tauri-apps/api/core";

import { servers } from "./lsp.svelte";

export async function update_workspaces(added: LSP.WorkspaceFolder[], removed: LSP.WorkspaceFolder[]){
    for(let i=0; i<servers.length; i++){
        if(!servers[i].ready) continue
        try{
            await invoke("send_notification", {
                language: servers[i].language,
                method: "workspace/didChangeWorkspaceFolders",
                params: {
                    event: {
                        added,
                        removed
                    }
                }
            })
            console.log(`Updated workspace folder for ${servers[i].language}`)
        }catch(error){
            console.error(`Failed to update workspace for ${servers[i].language}`)
        }
    }
}