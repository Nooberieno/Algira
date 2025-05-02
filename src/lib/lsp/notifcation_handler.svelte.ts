import * as LSP from "vscode-languageserver-protocol";

import { setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { get } from "svelte/store";

import { tabs } from "$lib/ui/tabs.svelte";
import { editor_views } from "$lib/ui/editors.svelte";
import { uri_to_file_path } from "$lib/utils/filesystem.svelte";
import { position_to_offset } from "./lsp.svelte";

export function notification_assigner(message: any){
    if(!message.method){
        console.log(`Unknown LSP notifcation for language: ${message.language}`, message)
    }
    switch(message.method){
        case "textDocument/publishDiagnostics":
            handle_diagnostics(message.params)
            break;
        default:
            console.log(`Message with unknown/unhandled method: ${message.method} for language: ${message.language}`, message)
    }
}

function handle_diagnostics(diagnostic_params: LSP.PublishDiagnosticsParams){
    const path = uri_to_file_path(diagnostic_params.uri)
    const tab = tabs.find((tab) => tab.path === path)

    if(!tab){
        console.log("could not find tab for diagnostics", diagnostic_params)
        return
    }

    const view = editor_views.get(tab.id)

    if(!view){
        console.log("could not find editor for tab: ", tab.id)
        return
    }

    const diagnostics: Diagnostic[] = diagnostic_params.diagnostics.map(({ range, message, severity, source }) => ({
        from: position_to_offset(view.state.doc, range.start.line, range.start.character)!,
        to: position_to_offset(view.state.doc, range.end.line, range.end.character)!,
        severity: ({
            [LSP.DiagnosticSeverity.Error]: "error",
            [LSP.DiagnosticSeverity.Warning]: "warning",
            [LSP.DiagnosticSeverity.Information]: "info",
            [LSP.DiagnosticSeverity.Hint]: "info",
        } as const)[severity!],
        message: message,
        source: source,
        above: true 
    }))
    .filter(({from, to}) => from !== null && to !== null && from !== undefined && to !== undefined)
    .sort((a, b) => {
        switch(true){
            case a.from < b.from:
                return -1
            case a.from > b.from:
                return 1
        }
        return 0
    })

    view.dispatch(setDiagnostics(view.state, diagnostics))

}