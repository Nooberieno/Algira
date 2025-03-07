<script lang="ts">
    import "../styles/editor/cm-styles.css"

    import type { Extension } from "@codemirror/state";
    import type { Unsubscriber } from "svelte/store";

    import { onMount, onDestroy, tick } from "svelte";
    import { EditorState, StateEffect } from "@codemirror/state";
    import { EditorView} from "codemirror";

    import { active_extensions, global_extensions } from "$lib/utils/cm-extensions.svelte";
    import { register_editor, unregister_editor } from "$lib/ui/editors.svelte";
    import { active_id } from "$lib/ui/tabs.svelte";

    let { tab_id }: { tab_id: string} = $props()

    let view: EditorView
    let editor_container: HTMLDivElement
    let unsub_id: Unsubscriber

    const editor_extensions: Set<Extension> = new Set<Extension>([...(active_extensions[tab_id] || []), ...global_extensions])

    async function focus_editor(){
        if(view){
            await tick()
            view.focus()
        }
    }

    $effect(() => {
        const editor_extensions: Set<Extension> = new Set<Extension>([...(active_extensions[tab_id] || []), ...global_extensions])

        if(view){
            view.dispatch({
                effects: StateEffect.appendConfig.of([...editor_extensions])
            })
        }
    })

    onMount(() => {
        console.log(tab_id)
        view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [...editor_extensions]
            }),
            parent: editor_container
        })
        register_editor(tab_id, view)
        focus_editor()

        unsub_id = active_id.subscribe((id) => {
            if(id === tab_id) focus_editor()
        })

    })


    onDestroy(() =>{
        unregister_editor(tab_id)
        view.destroy()
        if(unsub_id) unsub_id
    })
</script>

<div bind:this={editor_container} id={`editor-${tab_id}`} class="editor"></div>
