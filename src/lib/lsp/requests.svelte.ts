import type { Position } from "vscode-languageserver-protocol";

import { invoke } from "@tauri-apps/api/core";

import { servers } from "./lsp.svelte";
import { file_path_to_uri } from "$lib/utils/filesystem.svelte";


export async function get_definiton(language: string, file_path: string, position: Position){
    const server = servers.find((server) => server.language === language)

    if(!server || !server.ready){
        console.log("Server was not ready")
        return
    }

    await invoke("send_request", {
        language,
        method: "textDocument/definition",
        params: {
            textDocument: {
                uri: file_path_to_uri(file_path)
            },
            position
        }
    })
    console.log(`Sent definition request for language: ${language} for file ${file_path}`)
}