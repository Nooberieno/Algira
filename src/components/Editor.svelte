<script lang="ts">
    import "../styles/editor/cm-styles.css"

    import { onMount, onDestroy } from "svelte";
    import { EditorState, Transaction } from "@codemirror/state";
    import { EditorView} from "codemirror";
    import { basicSetup } from "codemirror";
    import { oneDark } from "@codemirror/theme-one-dark";

    import { focus_tracker } from "../lib/cm-extensions";
  
    let view: EditorView
    let editor_container: HTMLDivElement

    onMount(() => {
        view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [
                    basicSetup,
                    oneDark,
                    focus_tracker
                ]
            }),
            parent: editor_container
        })
    })

    onDestroy(() =>{
        view.destroy()
    })
</script>

<div bind:this={editor_container} class="editor"></div>
