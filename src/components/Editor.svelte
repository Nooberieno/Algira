<script lang="ts">
    import "../styles/editor/cm-styles.css"

    import type { Extension } from "@codemirror/state";
    import type { Unsubscriber } from "svelte/store";

    import { onMount, onDestroy, tick } from "svelte";
    import { EditorState } from "@codemirror/state";
    import { EditorView} from "codemirror";

    import { active_extensions, global_extensions } from "$lib/utils/cm-extensions.svelte";
    import { active_id } from "$lib/ui/tabs.svelte";

    let { tab_id }: { tab_id: string} = $props()

    let view: EditorView
    let editor_container: HTMLDivElement
    let unsub_id: Unsubscriber

    let editor_extensions: Set<Extension> = new Set<Extension>([...(active_extensions[tab_id] || []), ...global_extensions])

    async function focus_editor(){
        if(view){
            await tick()
            view.focus()
        }
    }

    onMount(() => {
        console.log(tab_id)
        view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [...editor_extensions]
            }),
            parent: editor_container
        })
        focus_editor()

        unsub_id = active_id.subscribe((id) => {
            if(id === tab_id) focus_editor()
        })

    })


    onDestroy(() =>{
        view.destroy()
        if(unsub_id) unsub_id
    })
</script>

<div bind:this={editor_container} id={`editor-${tab_id}`} class="editor"></div>
