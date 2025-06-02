<script lang="ts">
    import "../../../node_modules/@xterm/xterm/css/xterm.css"
    import "../../styles/terminal.css"

    import type { TerminalInstance } from "../../lib/ui/terminal.svelte";

    import { onMount } from "svelte";
    import { listen } from "@tauri-apps/api/event";

    
    import { init_shell, fit_terminal, write_to_pty, write_to_terminal, close_terminal, active_terminal } from "../../lib/ui/terminal.svelte"

    let { term_instance} : { term_instance: TerminalInstance} = $props()
    console.log(term_instance.id)

    listen("terminal-data", (event: any) => {
        if(event.payload.id !== term_instance.id){
            return
        }

        write_to_terminal(event.payload.data, term_instance)
    })

    listen("terminal-exit", (event: any) => {
        if(event.payload.id !== term_instance.id){
            return
        }

        close_terminal(term_instance.id)
    })

    onMount(async () => {
        
        term_instance.terminal.loadAddon(term_instance.fit)

        await init_shell(term_instance.id)
        term_instance.terminal.onData((data) => write_to_pty(term_instance.id, data))
        addEventListener("resize", () => fit_terminal(term_instance))

        await fit_terminal(term_instance)
    })
</script>

<div id="terminal-{term_instance.id}" class="algira-terminal {term_instance.id !== $active_terminal ? "terminal-hidden": ""}"></div>
