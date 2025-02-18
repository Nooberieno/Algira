<script lang="ts">
    import "../styles/editor/cm-styles.css"

    import type { Extension } from "@codemirror/state";

    import { onMount, onDestroy } from "svelte";
    import { EditorState } from "@codemirror/state";
    import { EditorView} from "codemirror";

    import { open_file_with_dialog } from "$lib/keybinds.svelte";
    import { open_new_file } from "$lib/filesystem.svelte";

    import { active_extensions, global_extensions } from "$lib/cm-extensions.svelte";

    let { tab_id }: { tab_id: string} = $props()

    let view: EditorView
    let editor_container: HTMLDivElement

    let editor_extensions: Set<Extension> = new Set<Extension>([...(active_extensions[tab_id] || []), ...global_extensions])

    onMount(() => {


        console.log(tab_id)
        view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [...editor_extensions]
            }),
            parent: editor_container
        })
        open_file_with_dialog(view, tab_id, open_new_file)
    })


    onDestroy(() =>{
        view.destroy()
    })
</script>

<div bind:this={editor_container} class="editor"></div>
