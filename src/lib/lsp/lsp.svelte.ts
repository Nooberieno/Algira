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

async function startLspServer(language: string, command: string) {
    try {
      await invoke("start_language_server", { language, command });
      console.log(`Started LSP server for ${language}`);
      
      // Initialize the server after starting it
      await invoke("send_request", { 
        language,
        method: "initialize",
        params: init_opts 
      });
    } catch (err) {
      console.error(`Failed to start LSP server for ${language}:`, err);
    }
  }

listen("lsp-message", (event: any) => {
    try{
        console.log("Got LSP response: ", event.payload);
    }catch(err){
        console.error("Error handling LSP message: ", err)
    }
});

startLspServer("rust", "rust-analyzer")
startLspServer("go", "gopls")