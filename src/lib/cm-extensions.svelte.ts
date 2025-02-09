import type { Extension } from "@codemirror/state";

import { EditorView } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";



const focus_tracker: Extension = EditorView.updateListener.of((update) => {
    let last_cursor_position: number | null = null
    if (update.focusChanged && update.view.hasFocus && last_cursor_position !== null){
        update.view.dispatch({
            selection: { anchor: last_cursor_position }
        })
    }
    if (update.selectionSet){
        last_cursor_position = update.state.selection.main.head
    }
})

export const global_extensions: Extension[] = $state([focus_tracker, oneDark, basicSetup, python()])

export const active_extensions: Record<string, Extension[]> = $state({})

export function add_active_extensions(tab_id: string, extensions: Extension[]){
    let extensions_to_add: Set<Extension> = new Set
    extensions.forEach((extension) => {
        if(!global_extensions.includes(extension)){
            console.log(extension)
            extensions_to_add.add(extension)
        }
    })
    active_extensions[tab_id] = [...(active_extensions[tab_id] || []), ...(extensions_to_add || [])]
}