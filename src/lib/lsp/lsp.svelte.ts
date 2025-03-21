import { listen } from "@tauri-apps/api/event";

import { invoke } from "@tauri-apps/api/core";

console.log("LSP module loaded")

const init_opts = {
    capabilities: {
        textDocument: {
            hover: {
                dynamicRegistration: true,
                contentFormat: ["plaintext", "markdown"],
            },
        },
    },
};

(async () => {
    try{
        console.log("sending initialization request...")
        await invoke("send_request", { method: "initialize", params: init_opts}).catch(err => {
            console.error("LSP request failed:", err)
        });
        console.log("initialization request send")
    }catch(err){
        console.error("Failed to send initialization message")
    }
})()

listen("lsp-message", (event: any) => {
    try{
        console.log("Got LSP response: ", event.payload);
    }catch(err){
        console.error("Error handling LSP message: ", err)
    }
});