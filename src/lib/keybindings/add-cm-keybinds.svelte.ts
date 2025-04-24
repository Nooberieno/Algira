import type { KeyBinding, EditorView } from "@codemirror/view";

import { save_text_file } from "../utils/filesystem.svelte";

export const AlgiraEditorKeymap: readonly KeyBinding[] = [
    {key: "Ctrl-s", run: (view: EditorView) => {save_text_file(view); return true}}
]