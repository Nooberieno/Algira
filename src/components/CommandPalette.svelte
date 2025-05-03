<script lang="ts">
    import "../styles/command-palette.css"

    import type { Unsubscriber } from "svelte/store";

    import type { SearchResult } from "$lib/ui/command-palette.svelte";
    import type { PaletteItem } from "$lib/ui/command-palette.svelte";

    import { onMount, tick } from "svelte";
    import { fade } from "svelte/transition";
    import { invoke } from "@tauri-apps/api/core";

    import { working_directory } from "$lib/ui/directory.svelte";
    import { fuzzy_search } from "$lib/ui/command-palette.svelte";
    import { create_tab_from_file } from "$lib/ui/tabs.svelte";

    let unsub_working_dir: Unsubscriber

    let dialog: HTMLDialogElement | null = $state(null)
    let input: HTMLInputElement | null = $state(null)
    let selected_index = $state(0)
    let search_results: SearchResult[] = $state([])
    let items: PaletteItem[] = $state([])
    let search_query = $state("")

    let is_palette_open = $state(false)
    
    async function load_file_items(): Promise<PaletteItem[]>{
        if(!$working_directory) return []

        try{
            let items = []
            const files = await invoke<{path: string, name: string}[]>("index_directory", {dirPath: $working_directory})

            items = [...files.map(file => ({
                id: file.path,
                label: file.name,
                description: file.path,
                type: "file" as const,
                action: () => create_tab_from_file(file.path)
            }))]

            return items
        }catch(err){
            console.error("Failed to index directory:", err)
            return []
        }
    }

    function handle_search(query: string){
        if(!query){
            search_results = items.map(item => ({item, score: 1}))
            return
        }
        search_results = items.map(item => ({
            item,
            score: fuzzy_search(query, item.label)
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        selected_index = 0
    }

    export function toggle_palette(){
        is_palette_open = !is_palette_open

        if(is_palette_open){
            tick().then(() => {
                dialog?.showModal()
                input?.focus()
            })
        }else{
            dialog?.close()
        }
    }
    
    function handle_keydown(event: KeyboardEvent){
        switch(event.key){
            case "Escape":
                toggle_palette()
                search_query = ""
                break
            case "ArrowDown":
                event.preventDefault()
                selected_index = (selected_index + 1) % search_results.length
                break
            case "ArrowUp":
                event.preventDefault()
                selected_index = (selected_index - 1) % search_results.length
                break
            case "Enter":
                event.preventDefault()
                if(search_results[selected_index]){
                    search_results[selected_index].item.action()
                    toggle_palette()
                    search_query = ""
                }
                break
            }   
    }

    document.addEventListener("toggle-command-palette", () => {
        toggle_palette()
    })

    $effect(() => {
        handle_search(search_query)
    })

    onMount(() => {
        if($working_directory){
            load_file_items().then(result => {
                items = result
                handle_search("")
            })
        }
        unsub_working_dir = working_directory.subscribe(async (work_dir) => {
            if(!work_dir){
                items = []
                handle_search("")
                return
            }
            console.log("Loading new files from directory:", work_dir)
            items = await load_file_items()
            handle_search("")
        })

        return () => {
            unsub_working_dir()
        }
    })

</script>

{#if is_palette_open}
    <dialog bind:this={dialog} transition:fade class="command-palette" aria-modal="true">
        <input bind:this={input} bind:value={search_query} onkeydown={handle_keydown} type="text" placeholder="Type a command or search" class="command-input" spellcheck="false"/>
        <div class="command-list {search_results.length > 0 ? "has-results" : ""}">
            {#each search_results as result, i}
            <div class="command-item" class:selected={i === selected_index} onclick={() => {result.item.action(); toggle_palette(); search_query = ""}} role="button" onkeydown={(event) => {if(event.key === "Enter" || event.key === " "){result.item.action(); toggle_palette(); search_query = ""}}} tabindex=0>
                <span class="command-label">{result.item.label}</span>
                {#if result.item.description}
                    <span class="command-description">{result.item.description}</span>
                {/if}
            </div>
                
            {/each}
        </div>
    </dialog>
{/if}