<script lang="ts">
    import "../../node_modules/@xterm/xterm/css/xterm.css"
    import "../styles/terminal.css"

    import { onMount } from "svelte";

    
    import { term, fit, init_shell, fit_terminal, write_to_pty, read_from_pty } from "../lib/ui/terminal.svelte"

    onMount(async () => {
        term.loadAddon(fit)

        init_shell()
        term.onData(write_to_pty)
        addEventListener("resize", fit_terminal)
        window.requestAnimationFrame(read_from_pty)
    })
</script>

<div id="terminal" class="algira-terminal hidden"></div>
