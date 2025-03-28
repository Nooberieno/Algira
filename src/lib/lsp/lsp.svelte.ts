import type * as LSP from "vscode-languageserver-protocol";

import { listen } from "@tauri-apps/api/event";

import { invoke } from "@tauri-apps/api/core";

console.log("LSP module loaded")

function get_initialization_parameters(process_id: number): LSP.InitializedParams{
  return{
    processId: process_id,
    clientInfo: {
      name: "Algira",
      version: "0.1.0",
    },
    capabilities: {
      definition: {
        dynamicRegistration: true,
        linkSupport: true
      },
    },
    workspaceFolders: []
  }
}

function handle_lsp_message(message: any){
  if(message.id){
    console.log(`Got lsp response for language ${message.language}`, message)
  }else{
    console.log(`Got lsp notification for language ${message.language}`, message)
  }
}

async function startLspServer(language: string, command: string) {
    try {
      const process: number = await invoke("start_language_server", { language, command });
      console.log(process)
      console.log(`Started LSP server for ${language}`);
      
      // Initialize the server after starting it
      await invoke("send_request", { 
        language,
        method: "initialize",
        params: get_initialization_parameters(process) 
      });
    } catch (err) {
      console.error(`Failed to start LSP server for ${language}:`, err);
    }
  }

listen("lsp-message", (event: any) => {
    try{
        handle_lsp_message(event.payload)
    }catch(err){
        console.error("Error handling LSP message: ", err)
    }
});

startLspServer("rust", "rust-analyzer")
startLspServer("go", "gopls")