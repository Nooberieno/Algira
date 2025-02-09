import type { Extension } from "@codemirror/state";

import { EditorView } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";



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

export const global_extensions: Extension[] = $state([focus_tracker, oneDark, basicSetup])

export const active_extensions: Record<string, Extension[]> = $state({})