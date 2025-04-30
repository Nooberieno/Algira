import type { CompletionTriggerKind, Position } from "vscode-languageserver-protocol";

import { servers, send_request_with_response } from "./lsp.svelte";
import { file_path_to_uri } from "$lib/utils/filesystem.svelte";
import { goto_location } from "./response_handler.svelte";

export async function get_definiton(language: string, file_path: string, position: Position) {
    const server = servers.find((server) => server.language === language)

    if(!server || !server.ready){
        console.log("Server was not ready")
        return
    }

    try{
        const result = await send_request_with_response(language, "textDocument/definition", {
            textDocument: {
                uri: file_path_to_uri(file_path)
            },
            position
        })
        goto_location(result)
    }catch(error){
        console.error("Failed to get definiton", error)
    }
}

export async function get_completion(language: string, file_path: string, position: Position, trigger_kind: CompletionTriggerKind, trigger_character: string | undefined){
    const server = servers.find((server) => server.language === language)

    if(!server || !server.ready){
        console.log("Server was not ready")
        return null
    }

    try{
        const result = await send_request_with_response(language, "textDocument/completion", {
            textDocument: {
                uri: file_path_to_uri(file_path)
            },
            position,
            context: {
                triggerKind: trigger_kind,
                triggerCharacter: trigger_character
            }
        })
        console.log("Got completions", result)
        return result
    }catch(error){
        console.error("Failed to get completion", error)
        return null
    }
}