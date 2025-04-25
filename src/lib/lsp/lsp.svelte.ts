import type { Text } from "@codemirror/state";
import type * as LSP from "vscode-languageserver-protocol";

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
        synchronization: {
          dynamicRegistration: true,
          willSave: false,
          didSave: false,
          willSaveWaitUntil: false,
        },
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

async function startLspServer(language: string, command: string, args: string[]) {
    try {
      const process: number = await invoke("start_language_server", { language, command, args });
      console.log(process)
      console.log(`Started LSP server for ${language}`);
      servers.push({
        language,
        name: command,
        ready: false,
        capabilities: undefined,
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

startLspServer("python", "pyright-langserver", ["--stdio"])

export function position_to_offset(document: Text, line: number, character: number){
    if(line >= document.lines) return

    const offset = document.line(line+1).from + character
    
    if(offset > document.length) return

    return offset
}

export function offset_to_position(document: Text, offset: number){
    const line = document.lineAt(offset)
    return {
        character: offset - line.from,
        line: line.number - 1
    }
}