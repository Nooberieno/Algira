<script lang="ts">
    import "../../../styles/sidebar/directory.css"

    import type { FileEntry } from "$lib/ui/directory.svelte";

    import { working_directory, get_working_directory_name } from "$lib/ui/directory.svelte";
    import { load_directory, open_new_working_directory } from "$lib/utils/filesystem.svelte";

    import DirectoryItem from "./DirectoryItem.svelte";

    let file_tree: FileEntry[] = $state([])
    let working_dir_display: string = $state("")

    working_directory.subscribe(async (dir) => {
        if(!dir) return
        load_directory(dir).then(result => {
            file_tree = [...result]
        })
        working_dir_display = await get_working_directory_name()
    })
</script>

{#if !$working_directory}
    <div>No folder opened</div>
    <button onclick={open_new_working_directory} class="content-button">open new folder</button>
{:else}
    <div>{working_dir_display}</div>
    <div class="directory-item">
        {#each file_tree as file_entry}
            <DirectoryItem item={file_entry}/>
        {/each}
    </div>
{/if}