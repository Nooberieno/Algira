<script lang="ts">
    import "../../node_modules/@xterm/xterm/css/xterm.css"
    import "../styles/terminal.css"

    import { onMount } from "svelte";
    import { Terminal } from "@xterm/xterm";


    onMount(() => {
        const term = new Terminal();
    
        term.open(document.getElementById("terminal"))
        term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ")
    })
</script>

<div id="terminal"></div>
