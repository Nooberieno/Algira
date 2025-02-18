import type { EditorView } from "codemirror";

export const open_file_with_dialog = (view: EditorView, tab_id: string, callback: (editorview: EditorView, tab_id: string) => void) => {
    const handle_keydown = (event: KeyboardEvent) => {
        if(event.ctrlKey && event.key === 'o'){
            event.preventDefault()
            callback(view, tab_id)
        }
    }
    window.addEventListener('keydown', handle_keydown)

    return () => {
        window.removeEventListener('keydown', handle_keydown)
    }
}