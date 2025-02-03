<script lang="ts">
    import "../styles/cm-styles.css"
    import { onMount } from "svelte";
    import { EditorState } from "@codemirror/state";
    import { EditorView} from "codemirror";
    import { basicSetup } from "codemirror";
    import { oneDark } from "@codemirror/theme-one-dark";

    let view: EditorView

    onMount(() => {
        view = new EditorView({
            state: EditorState.create({
                doc: "",
                extensions: [
                    basicSetup,
                    oneDark
                ],
            }),
            parent: document.getElementById("editor")!
        })
    })
</script>

<div id='editor'></div>