import type { Extension } from "@codemirror/state";

import { EditorView } from "codemirror";
import { basicSetup } from "codemirror";
import { keymap } from "@codemirror/view"
import { defaultKeymap } from "@codemirror/commands";

import { AlgiraEditorKeymap } from "../keybindings/add-cm-keybinds.svelte";
import { AlgiraDark } from "$lib/ui/base-theme.svelte";



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

export const global_extensions: Extension[] = $state([focus_tracker, AlgiraDark, basicSetup, keymap.of([...defaultKeymap, ...AlgiraEditorKeymap])])

export const active_extensions: Record<string, Extension[]> = $state({})

export function add_active_extensions(tab_id: string, extensions: Extension[]){
    active_extensions[tab_id] = [...(active_extensions[tab_id] || []), ...(extensions || [])]
}