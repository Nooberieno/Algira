<script lang="ts">
    import "../styles/tab.css"

    import { tabs, active_id, set_active_tab, close_tab, create_new_tab } from '../lib/ui/tabs.svelte';
    import Editor from './Editor.svelte';
</script>

<div class="tab-bar">
    {#each tabs as tab (tab.id)}
    <div 
        class="tab-container" 
        class:active={$active_id === tab.id} 
        role="button" 
        tabindex="0" 
        onclick={() => set_active_tab(tab.id)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') set_active_tab(tab.id); }}>
        <span class="tab" id={`tab-${tab.id}`}>{tab.title}</span>
        <button class="close-tab" onclick={(e: MouseEvent) => { e.stopPropagation(); close_tab(tab.id); }}>x</button>
    </div>
    {/each}
    <button onclick={() => create_new_tab(Editor)} class="add-tab">+</button>
</div>
