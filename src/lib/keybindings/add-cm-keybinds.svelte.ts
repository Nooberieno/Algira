import type { KeyBinding } from "@codemirror/view";

import { EditorView } from "@codemirror/view"

import { open_new_file, save_text_file } from "../utils/filesystem.svelte"

export const AlgiraEditorKeymap: readonly KeyBinding[] = [
    {key: "Ctrl-o", run: (view: EditorView) => {open_new_file(view); return true}},
    {key: "Ctrl-s", run: (view: EditorView) => {save_text_file(view); return true}}
]