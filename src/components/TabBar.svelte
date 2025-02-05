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
        on:click={() => setActiveTab(tab.id)}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab.id); }}>
        <span class="tab" id={`tab-${tab.id}`}>{tab.title}</span>
        <button class="close-tab" on:click={(e) => { e.stopPropagation(); closeTab(tab.id); }}>x</button>
    </div>
    {/each}
    <button on:click={() => createTab(Editor)} class="add-tab">+</button>
</div>
