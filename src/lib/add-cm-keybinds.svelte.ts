import { EditorView, keymap } from "@codemirror/view"

import { open_new_file } from "./filesystem.svelte"

export const AlgiraEditorKeymap = [
    {key: "Ctrl-o", run: (view: EditorView) => {open_new_file(view); return true}}
]