import { EditorView } from "codemirror";

export const light_theme = EditorView.theme({
    "&": { backgroundColor: '#ffffff', color: '#000000'},
    ".cm-gutter": { bacgroundColor: '#f0f0f0'}
}, {dark: false});

export const dark_theme = EditorView.theme({
    "&": { backgroundColor: '#000000', color: '#ffffff'},
    ".cm-gutter": { bacgroundColor: '#333333'}
}, {dark: true})

