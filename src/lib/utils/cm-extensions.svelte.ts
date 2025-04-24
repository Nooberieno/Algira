import type { Extension } from "@codemirror/state";

import { get } from "svelte/store";
import { EditorView } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { keymap, ViewPlugin } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

import { AlgiraEditorKeymap } from "../keybindings/add-cm-keybinds.svelte";
import { offset_to_position } from "$lib/lsp/lsp.svelte";
import { tabs, active_id } from "$lib/ui/tabs.svelte";
import { get_definiton } from "$lib/lsp/requests.svelte";



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

const goto_definition = ViewPlugin.fromClass(class {
    constructor(view: EditorView){
        view.dom.addEventListener("click", (e: MouseEvent) => {
            if (e.ctrlKey || e.metaKey){
                const offset = view.posAtCoords({x: e.clientX, y: e.clientY})
                if(offset){
                    const position = offset_to_position(view.state.doc, offset)
                    const tab = tabs.find((tab) => tab.id === get(active_id))
                    if(!tab || !tab.language || !tab.path) return
                    get_definiton(tab.language, tab.path, position)
                }
            }
        })
    }
})

export const global_extensions: Extension[] = $state([focus_tracker, oneDark, basicSetup, goto_definition, keymap.of([...defaultKeymap, ...AlgiraEditorKeymap])])

export const active_extensions: Record<string, Extension[]> = $state({})

export function add_active_extensions(tab_id: string, extensions: Extension[]){
    active_extensions[tab_id] = [...(active_extensions[tab_id] || []), ...(extensions || [])]
}