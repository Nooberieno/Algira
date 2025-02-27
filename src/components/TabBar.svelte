<script lang="ts">
    import "../styles/tab.css"
    
    import { onMount } from "svelte";

    import { tabs, active_id, setActiveTab, closeTab, createTab } from '../lib/tabs.svelte';
    import { setup_keymap_listener } from "$lib/keymap.svelte";
    import Editor from './Editor.svelte';

    onMount(() => {
        setup_keymap_listener()
    })
</script>

<div class="tab-bar">
    {#each tabs as tab (tab.id)}
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
