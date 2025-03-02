<script lang="ts">
    import "../../node_modules/@xterm/xterm/css/xterm.css"
    import "../styles/terminal.css"

    import { onMount } from "svelte";
    import { Terminal } from "@xterm/xterm";
    import { FitAddon } from "@xterm/addon-fit"
    import { invoke } from "@tauri-apps/api/core";

    let term_container: HTMLDivElement

    onMount(() => {
        const fit = new FitAddon()
        const term = new Terminal({
            cursorBlink: true,
            fontFamily: "Hack Mono",
            fontSize: 8
        });
        term.loadAddon(fit)
        term.open(term_container)
        async function fit_terminal(){
                fit.fit()
                await invoke("pty_resize", {rows: term.rows, cols: term.cols})
            }

            function write_to_terminal(data: string){
                return new Promise<void>((response) => {
                    term.write(data, () => response())
                })
            }

            function write_to_pty(data: string){
                invoke("pty_write", {data})
            }

            function init_shell(){
                invoke("create_shell_process").catch((error) => {
                    console.error("Error creating shell:", error)
                })
            }

            async function read_from_pty(){
                const data = await invoke<string>("pty_read")

                if(data){
                    await write_to_terminal(data)
                }
                window.requestAnimationFrame(read_from_pty)
            }
        init_shell()
        fit_terminal()
        addEventListener("resize", fit_terminal)
        term.onData(write_to_pty)
        window.requestAnimationFrame(read_from_pty)
    })
</script>

<div bind:this={term_container} id="terminal"></div>
