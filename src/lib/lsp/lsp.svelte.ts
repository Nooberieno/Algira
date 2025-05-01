import type { Text } from "@codemirror/state";
import * as LSP from "vscode-languageserver-protocol";
import type { Input } from "@lezer/common";

import { listen } from "@tauri-apps/api/event";

import { invoke } from "@tauri-apps/api/core";
import { get } from "svelte/store";
import { marked} from "marked";
import { highlightCode, classHighlighter } from "@lezer/highlight"

import { response_assigner } from "./response_handler.svelte";
import { working_directory, get_working_directory_name } from "$lib/ui/directory.svelte";
import { file_path_to_uri } from "$lib/utils/filesystem.svelte";
import { notification_assigner } from "./notifcation_handler.svelte";
import { get_language_extension_from_language } from "$lib/utils/lang.svelte";

interface LspServer{
  language: string,
  name: string,
  ready: boolean,
  capabilities: LSP.ServerCapabilities | undefined
}

export const servers: LspServer[] = []

export const response_tracker: Map<number, {
  method: string,
  resolve: (value: any) => void,
  reject: (reason: any) => void
}> = new Map();

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
          dynamicRegistration: true
        },
        completion: {
          dynamicRegistration: true,
          completionItem: {
              snippetSupport: false,
              commitCharactersSupport: true,
              documentationFormat: ["markdown", "plaintext"],
              deprecatedSupport: false,
              preselectSupport: false,
          },
          contextSupport: false,
        },
        hover: {
          dynamicRegistration: true,
          contentFormat: ["markdown", "plaintext"]
        },
        definition: {
          dynamicRegistration: true,
          linkSupport: true
        },
        publishDiagnostics: {
          relatedInformation: true,
          tagSupport: {
            valueSet: [1,2]
          }
        }
      },
      workspace: {
        didChangeConfiguration: {
          dynamicRegistration: true
        }
      }
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
      const result = await send_request_with_response( 
        language,
        "initialize",
        await get_initialization_parameters(process, initialization_options) 
      )
      const server = servers.find((server) => server.language === language)
      if(!server){
        console.error("Could not find server for repsonse with language: ", language)
        return
      }
      server.capabilities = result.capabilities
      server.ready = true

      console.log(server)

      await invoke("send_notification", {
        language: language,
        method: "initialized",
        params: {}
      })

    } catch (err) {
      console.error(`Failed to start LSP server for ${language}:`, err);
    }
  }

export async function send_request_with_response(language: string, method: string, params: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const id: number = await invoke("send_request", {
                language,
                method,
                params
            });

            response_tracker.set(id, {
                method,
                resolve,
                reject
            });

            setTimeout(() => {
                if (response_tracker.has(id)) {
                    response_tracker.delete(id);
                    reject(new Error(`Request ${method} timed out`));
                }
            }, 10000);

        } catch (err) {
            reject(err);
        }
    });
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

export async function format_lsp_contents(contents: LSP.MarkupContent | LSP.MarkedString | LSP.MarkedString[], language: string): Promise<string>{
  const renderer = new marked.Renderer();

  renderer.code = ({ text, lang }: { text: string; lang?: any }) => {
    const code = text;
    const result = document.createElement("pre");
    result.className = "cm-editor"

    function emit(text: string, classes?: string) {
      let node: globalThis.Text | HTMLSpanElement = document.createTextNode(text);
      if (classes) {
        let span = document.createElement("span");
        span.appendChild(node as Node);
        span.className = classes;
        node = span;
      }
      result.appendChild(node as Node);
    }

    function emit_break() {
      result.appendChild(document.createTextNode("\n"));
    }

    // Get the appropriate language parser
    const languageParser = get_language_extension_from_language(lang || language);
    if (languageParser) {
      highlightCode(code, languageParser.language.parser.parse(code), classHighlighter, emit, emit_break);
    } else {
      // Fallback for unsupported languages
      emit(code);
    }

    return result.outerHTML;
  }

  marked.setOptions({renderer})

  if((contents as LSP.MarkupContent).kind !== undefined){
    let value = (contents as LSP.MarkupContent).value
    if((contents as LSP.MarkupContent).kind === "markdown"){
      value = await marked.parse(value)
    }
    return value
  }else if(Array.isArray(contents)){
    return contents.map((c) => format_lsp_contents(c, language) + "\n\n").join("")
  }
  return contents as string
}