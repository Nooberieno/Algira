<script lang="ts">
    import "../styles/tab.css"
    import { tabs, active_id } from "../lib/ui/tabs.svelte";
</script>

<div class="tab-content">
    {#each tabs as tab (tab.id)}
    <div class="tab-component {tab.id === $active_id ? 'active' : ''}">
        <tab.element tab_id={tab.id}></tab.element>
    </div>
    {/each}
</div>