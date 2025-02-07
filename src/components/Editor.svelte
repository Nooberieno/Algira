<script lang="ts">
    import "../styles/editor/cm-styles.css"

    import type { Extension } from "@codemirror/state";
    import type { Unsubscriber } from "svelte/store";

    import { onMount, onDestroy } from "svelte";
    import { EditorState, Transaction } from "@codemirror/state";
    import { EditorView} from "codemirror";

    import { active_extensions, global_extensions } from "$lib/cm-extensions";
    import { active_id } from "$lib/tabs";

    let { tab_id }: { tab_id: string} = $props()

    let view: EditorView
    let editor_container: HTMLDivElement
    let unsubscribe_extension_global: Unsubscriber
    let unsubscribe_extension_active: Unsubscriber
    let unsubscribe_active_id: Unsubscriber

    let editor_extensions: Extension[] = []

    function update_extensions(){
        let active_extension_list: Extension[] = $active_id === tab_id ? ($active_extensions[tab_id] || []) : []
        editor_extensions = [...$global_extensions, ...active_extension_list]
    }

    onMount(() => {
        update_extensions()

        unsubscribe_extension_global = global_extensions.subscribe(() => {
            update_extensions()
        })
        unsubscribe_extension_active = active_extensions.subscribe(() => {
            update_extensions()
        })

        unsubscribe_active_id = active_id.subscribe(() => {
            update_extensions()
        })


        console.log(tab_id)
        view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [editor_extensions]
            }),
            parent: editor_container
        })
    })

    onDestroy(() =>{
        unsubscribe_extension_active()
        unsubscribe_extension_global()
        view.destroy()
    })
</script>

<div bind:this={editor_container} class="editor"></div>
