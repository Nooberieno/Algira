<script lang="ts">
    import "../../styles/terminal.css"

    import { terminals, add_terminal_instance, active_terminal, set_active_terminal, exit_terminal_with_pty_cleanup, terminal_stress_test } from "$lib/ui/terminal.svelte";
    import Terminal from "./Terminal.svelte";
</script>

<div id=terminal-tab-container class="hidden">
    <div id="terminal-container">
    {#each terminals as terminal (terminal.id)}
        <Terminal term_instance={terminal}></Terminal>
    {/each}
    </div>
    <div id="terminal-tab-bar" class="hidden">
        <button class="terminal-button" onclick={add_terminal_instance}>+</button>
        <button class="terminal-button" onclick={terminal_stress_test}>+</button>
        {#each terminals as terminal (terminal.id)}
        <div 
        class="tab-container-terminal" 
        class:active={$active_terminal === terminal.id} 
        role="button" 
        tabindex="0" 
        onclick={() => set_active_terminal(terminal.id)}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') set_active_terminal(terminal.id); }}>
            <span class="terminal-tab" id={`terminal-tab-${terminal.id}`}>Terminal</span>
            <button class="close-tab" onclick={(e: MouseEvent) => { e.stopPropagation(); exit_terminal_with_pty_cleanup(terminal.id); }}>x</button>
        </div>
    {/each}
    </div>
</div>