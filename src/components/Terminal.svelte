<script lang="ts">
    import "../../node_modules/@xterm/xterm/css/xterm.css"
    import "../styles/terminal.css"

    import { onMount } from "svelte";
    import { Terminal } from "@xterm/xterm";

    let term_container: HTMLDivElement
    let output: string = $state("")

    onMount(() => {
        const term = new Terminal();
    
        term.open(term_container)
        term.write("$: ")

        term.onData((data) => {
            const code = data.charCodeAt(0)

            if(code === 13){
                term.write("\r\n")
                console.log("Command entered: ", output)
                output = ""
                term.write("$: ")
                return;
            }
            if(code === 127){
                if(output.length > 0){
                    output = output.slice(0, -1)
                    term.write("\b \b")
                }
                return
            }
            output += data
            term.write(data)
        })
    })
</script>

<div bind:this={term_container} id="terminal"></div>
