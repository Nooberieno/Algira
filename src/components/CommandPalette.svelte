<script lang="ts">
    import "../styles/command-palette.css"

    import type { SearchResult } from "$lib/ui/command-palette.svelte";
    import type { PaletteItem } from "$lib/ui/command-palette.svelte";

    import { tick } from "svelte";
    import { fade } from "svelte/transition";

    import { working_directory } from "$lib/ui/directory.svelte";
    import { load_directory } from "$lib/utils/filesystem.svelte";
    import { create_file_items, fuzzy_search } from "$lib/ui/command-palette.svelte";

    let dialog: HTMLDialogElement | null = $state(null)
    let input: HTMLInputElement | null = $state(null)
    let selected_index = $state(0)
    let search_results: SearchResult[] = $state([])
    let items: PaletteItem[] = $state([])
    let search_query = $state("")

    let is_palette_open = $state(false)
    
    async function load_file_items(){
        if(!$working_directory) return
        const entries = await load_directory($working_directory, true)
        items = create_file_items(entries)
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
                load_file_items()
            })
        }else{
            dialog?.close()
        }
    }
    
    function handle_keydown(event: KeyboardEvent){
        switch(event.key){
            case "Escape":
                toggle_palette()
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