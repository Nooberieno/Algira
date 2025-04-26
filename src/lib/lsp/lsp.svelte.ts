import type { Text } from "@codemirror/state";
import * as LSP from "vscode-languageserver-protocol";

import { listen } from "@tauri-apps/api/event";

import { invoke } from "@tauri-apps/api/core";
import { get } from "svelte/store";

import { goto_location, lsp_initialization, response_assigner } from "./response_handler.svelte";
import { working_directory, get_working_directory_name } from "$lib/ui/directory.svelte";
import { file_path_to_uri } from "$lib/utils/filesystem.svelte";
import { notification_assigner } from "./notifcation_handler.svelte";

interface LspServer{
  language: string,
  name: string,
  ready: boolean,
  capabilities: LSP.ServerCapabilities | undefined
}

export const servers: LspServer[] = []

export const request_stack: Map<number, string> = new Map<number, string>()

async function get_initialization_parameters(process_id: number, initialization_options: LSP.LSPAny): Promise<LSP.InitializeParams>{
  const algira_working_directory = get(working_directory)
  let workspace_folder: LSP.WorkspaceFolder | undefined;
  if(algira_working_directory){
    workspace_folder = {
      name: await get_working_directory_name(),
      uri: file_path_to_uri(algira_working_directory)
    }
  }
  return{
    processId: process_id,
    clientInfo: {
      name: "Algira",
      version: "0.1.0",
    },
    rootUri: workspace_folder ? workspace_folder.uri : null,
    initializationOptions: initialization_options,
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
    workspaceFolders: workspace_folder ? [workspace_folder] : null,
  }
}

function handle_lsp_message(message: any){
  if(message.id){
    response_assigner(message)
  }else{
    notification_assigner(message)
  }
}

async function startLspServer(language: string, command: string, args: string[], initialization_options: LSP.LSPAny = null) {
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
        params: await get_initialization_parameters(process, initialization_options) 
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