import type * as LSP from "vscode-languageserver-protocol"

import { invoke } from "@tauri-apps/api/core";

import { servers } from "./lsp.svelte";
import { file_path_to_uri } from "$lib/utils/filesystem.svelte";

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

export async function notify_document_opened(language: string, file_path: string, text: string){
    const uri = file_path_to_uri(file_path)
    try{
        const server = servers.find((server) => server.language === language)
        if(!server || !server.ready || !server.capabilities?.workspace?.workspaceFolders?.changeNotifications) console.log("failed to update workspaces for server", server?.name)
        await invoke("send_notification", {
            language,
            method: "textDocument/didOpen",
            params: {
                textDocument: {
                    uri,
                    languageId: language,
                    version: 1,
                    text
                }
            }
        })
        console.log(`Notified LSP server about opened file: ${file_path}`)
    }catch(error){
        console.error(`Failed to notify LSP about opened file: ${file_path}`)
    }
}