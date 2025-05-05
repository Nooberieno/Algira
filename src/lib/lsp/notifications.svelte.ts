import type * as LSP from "vscode-languageserver-protocol"

import { invoke } from "@tauri-apps/api/core";

import { servers } from "./lsp.svelte";
import { file_path_to_uri } from "$lib/utils/filesystem.svelte";
import type { Tab } from "$lib/ui/tabs.svelte";

export async function update_workspaces(added: LSP.WorkspaceFolder[], removed: LSP.WorkspaceFolder[]){
    for(let i=0; i<servers.length; i++){
        if(!servers[i].ready || !servers[i].capabilities?.workspace?.workspaceFolders?.supported) continue
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

export async function notify_document_opened(language: string, file_path: string, text: string, tab: Tab){
    const uri = file_path_to_uri(file_path)
    try{
        const server = servers.find((server) => server.language === language)
        if(!server || !server.ready){
            console.log(`failed to notify server: ${server?.name} about file`, file_path)
            return
        } 
        if(!tab.document_version){
            console.log("Tab has no document_version, using 0")
            tab.document_version = 0
        }
            await invoke("send_notification", {
            language,
            method: "textDocument/didOpen",
            params: {
                textDocument: {
                    uri,
                    languageId: language,
                    version: tab.document_version,
                    text
                }
            }
        })
        console.log(`Notified LSP server about opened file: ${file_path}`)
    }catch(error){
        console.error(`Failed to notify LSP about opened file: ${file_path}`)
    }
}

export async function did_change(language: string, file_path: string,  version: number, content_change: LSP.TextDocumentContentChangeEvent[]){
    const uri = file_path_to_uri(file_path)
    await invoke("send_notification", {
        language,
        method: "textDocument/didChange",
        params: {
            textDocument:{
                uri,
                version
            },
            contentChanges: content_change
        }
    })
}