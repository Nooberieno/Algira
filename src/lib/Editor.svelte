<script lang='ts'>
    import { onMount } from "svelte";
    import { EditorState } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { defaultKeymap } from "@codemirror/commands";
    import { keymap } from "@codemirror/view";
    import { basicSetup } from "codemirror";
    import { read_file } from "../utils/filesystem";
    import { open } from "@tauri-apps/plugin-dialog";
    import { setup_bindings } from "../utils/keybinds";

    // language import for codemirror
    import { javascript } from "@codemirror/lang-javascript";
    import { python } from "@codemirror/lang-python";
    import { rust } from "@codemirror/lang-rust";
    import { html } from "@codemirror/lang-html";
    import { css } from "@codemirror/lang-css";
    import { cpp } from "@codemirror/lang-cpp";
    import { markdown } from "@codemirror/lang-markdown";
  
  
   

    let view:EditorView;

    onMount(() => {
        const init_text = "console.log('Hello World!);'";
        view = new EditorView({
            state: EditorState.create({
                doc: init_text,
                extensions: [
                    basicSetup,
                    javascript(),
                    keymap.of(defaultKeymap)
                ],
            }),
            parent: document.getElementById('editor')!
        });
        // Listen for keydown events
        const open_file = async () => {
            const file_path = await open({
                multiple: false,
                title: "Open",
            })
            if (file_path) {
                const text = await read_file(file_path as string);
                if (text){
                    view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: text}
                })
                }
            }
        }
        setup_bindings(view, open_file)
    })
</script>

<div id='editor'></div>

<style>
    #editor{
        height: 100%;
        border: 1px solid #ccc;
    }
</style>