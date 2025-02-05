<script lang="ts">
    import { tabs, active_id } from "../lib/tabs";
</script>

<div class="tab-content">
    {#each $tabs as tab (tab.id)}
        {#if $active_id === tab.id}
            <svelte:component this={tab.element} {tab} />
        {/if}
    {/each}
</div>