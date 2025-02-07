<script lang="ts">
    import { tabs, active_id, setActiveTab, closeTab, createTab } from '../lib/tabs';
    import Editor from './Editor.svelte';
    import "../styles/tab.css"

</script>

<div class="tab-bar">
    {#each $tabs as tab (tab.id)}
    <div 
        class="tab-container" 
        class:active={$active_id === tab.id} 
        role="button" 
        tabindex="0" 
        onclick={() => setActiveTab(tab.id)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab.id); }}>
        <span class="tab" id={`tab-${tab.id}`}>{tab.title}</span>
        <button class="close-tab" onclick={(e: MouseEvent) => { e.stopPropagation(); closeTab(tab.id); }}>x</button>
    </div>
    {/each}
    <button onclick={() => createTab(Editor)} class="add-tab">+</button>
</div>
