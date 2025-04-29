import type { Position } from "vscode-languageserver-protocol";

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
        const result = await send_request_with_response("python", "textDocument/definition", {
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