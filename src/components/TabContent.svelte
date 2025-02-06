<script lang="ts">
    import "../styles/tab.css"
    import { tabs, active_id } from "../lib/tabs";
</script>

<div class="tab-content">
    {#each $tabs as tab (tab.id)}
    <div class="tab-component {tab.id === $active_id ? 'active' : ''}">
        <svelte:component this={tab.element} />
    </div>
    {/each}
</div>