import * as LSP from "vscode-languageserver-protocol";

import { listen } from "@tauri-apps/api/event";

import { invoke } from "@tauri-apps/api/core";

console.log("LSP module loaded")

interface LspServer{
  language: string,
  name: string,
  ready: boolean,
  capabilities: LSP.ServerCapabilities | undefined
}

export const servers: LspServer[] = []

function get_initialization_parameters(process_id: number): LSP.InitializeParams{
  return{
    processId: process_id,
    clientInfo: {
      name: "Algira",
      version: "0.1.0",
    },
    rootUri: null,
    capabilities: {
      textDocument: {
        definition: {
          dynamicRegistration: true,
          linkSupport: true
        },
      },
    },
    workspaceFolders: null
  }
}

function handle_lsp_message(message: any){
  if(message.id){
    if(message.result.capabilities){
      console.log(`Got initialization response for language ${message.language}`, message)
      const server = servers.find((server) => server.language === message.language)
      if(!server){
        console.error("Could not find server for repsonse with language: ", message.language)
        return
      }
      server.capabilities = message.result.capabilities
      server.ready = true

      console.log(server)

      invoke("send_notification", {
        language: message.language,
        method: "initialized",
        params: {}
      })
    }else{
      console.log(`Got lsp response for language ${message.language}`, message)
    }
  }else{
    console.log(`Got lsp notification for language ${message.language}`, message)
  }
}

async function startLspServer(language: string, command: string) {
    try {
      const process: number = await invoke("start_language_server", { language, command });
      console.log(process)
      console.log(`Started LSP server for ${language}`);
      servers.push({
        language,
        name: command,
        ready: false,
        capabilities: undefined
      })
      
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