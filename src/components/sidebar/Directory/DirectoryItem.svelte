<script lang="ts">
    import type { FileEntry } from "$lib/ui/directory.svelte";
    import { toggle_directory } from "$lib/ui/directory.svelte";
    import { create_tab_from_file } from "$lib/ui/tabs.svelte";

    import Self from "./DirectoryItem.svelte"

    let {item}: {item: FileEntry} = $props()
</script>

<div>
    <span
        role="button"
        tabindex="0"
        onclick={() => item.is_directory ? toggle_directory(item) : create_tab_from_file(item.path)}
        onkeydown={(e) => {if(e.key === "Enter") item.is_directory ? toggle_directory(item) : create_tab_from_file(item.path)}}
    >
        {#if item.is_directory}
            {item.is_collapsed ? "\uea83": "\ueaf7"}
        {:else}
            &#xf15b
        {/if}
        {item.name}
    </span>

    {#if item.is_directory && !item.is_collapsed && item.children?.length}
        <div class="pl-4">
            {#each item.children as child}
               <Self item={child}/>
            {/each}
        </div>
    {/if}
</div>