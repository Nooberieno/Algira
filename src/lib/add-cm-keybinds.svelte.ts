import { EditorView } from "@codemirror/view"

import { open_new_file, save_text_file } from "./filesystem.svelte"

export const AlgiraEditorKeymap = [
    {key: "Ctrl-o", run: (view: EditorView) => {open_new_file(view); return true}},
    {key: "Ctrl-s", run: (view: EditorView) => {save_text_file(view)}}
]