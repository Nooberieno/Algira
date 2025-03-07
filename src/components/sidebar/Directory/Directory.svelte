<script lang="ts">
    import type { FileEntry } from "$lib/ui/directory.svelte";

    import { working_directory } from "$lib/ui/directory.svelte";
    import { load_directory, open_new_working_directory } from "$lib/utils/filesystem.svelte";

    import DirectoryItem from "./DirectoryItem.svelte";

    let file_tree: FileEntry[] = $state([])

    working_directory.subscribe((dir) => {
        if(!dir) return
        load_directory(dir).then(result => {
            file_tree = [...result]
        })
    })
</script>

{#if !$working_directory}
    <button onclick={open_new_working_directory}>open new directory</button>
{:else}
    <div>
        {#each file_tree as file_entry}
            <DirectoryItem item={file_entry}/>
        {/each}
    </div>
{/if}