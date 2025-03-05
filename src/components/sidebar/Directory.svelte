<script lang="ts">
    import type { FileEntry } from "$lib/ui/directory.svelte";

    import { working_directory, toggle_directory } from "$lib/ui/directory.svelte";
    import { load_directory, open_new_working_directory } from "$lib/utils/filesystem.svelte";

    let file_tree: FileEntry[] = $state([])

    working_directory.subscribe((dir) => {
        if(!dir) return
        load_directory(dir).then(result => {
            file_tree = result
        })
    })
</script>

{#if !$working_directory}
    <button onclick={open_new_working_directory}>open new directory</button>
{:else}
    <div>
        {#each file_tree as file_entry}
            <div>
                <span
                    role="button"
                    tabindex="0"
                    onclick={() => toggle_directory(file_entry)}
                    onkeydown={(e) => {if(e.key === "Enter") toggle_directory(file_entry)}}
                >
                    {#if file_entry.is_directory}
                        {file_entry.is_collapsed ? "\uea83": "\ueaf7"}
                    {:else}
                    &#xf15b
                    {/if}
                    {file_entry.name}
                </span>

                {#if file_entry.is_directory && !file_entry.is_collapsed && file_entry.children}
                    <div>
                        {#each file_entry.children as child}
                            <div>
                                <span
                                role="button"
                                tabindex="0"
                                onclick={() => toggle_directory(child)}
                                onkeydown={(e) => {if(e.key === "Enter") toggle_directory(child)}}
                            >
                                {#if child.is_directory}
                                    {child.is_collapsed ? "\uea83": "\ueaf7"}
                                {:else}
                                &#xf15b
                                {/if}
                                {child.name}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{/if}