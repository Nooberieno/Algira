import type { EditorView } from "codemirror";

import { tabs} from "$lib/ui/tabs.svelte";

export const editor_views = new Map<string, EditorView>()

export function register_editor(tab_id: string, view: EditorView){
    if(!tabs.find((t) => t.id === tab_id)) return
    editor_views.set(tab_id, view)
}

export function unregister_editor(tab_id: string){
    editor_views.delete(tab_id)
}

export function content_to_doc(view: EditorView, content: string){
    view.dispatch({
        changes: {from: 0, to: view.state.doc.length, insert: content}
    })
}