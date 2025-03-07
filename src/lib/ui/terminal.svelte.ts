import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit"
import { invoke } from "@tauri-apps/api/core";
import { get } from "svelte/store";
import { tick } from "svelte";

import { active_id } from "./tabs.svelte";
import { editor_views } from "$lib/ui/editors.svelte";

export const term = new Terminal({
    cursorBlink: true,
    fontFamily: "Hack Mono",
    fontSize: 10,
    fontWeight: "normal",
});

export const fit = new FitAddon()

export function toggle_terminal_focus(){
    const terminal_container = document.getElementById("terminal")
    if(!terminal_container) return false

    if(terminal_container.classList.contains("hidden")){
        terminal_container.classList.remove("hidden")
        if(!term.element){
            console.log("opening element")
            term.open(terminal_container)
            fit_terminal()
        }
        term.focus()
    }else{
        if(document.querySelector(".xterm-helper-textarea") === document.activeElement){
            terminal_container.classList.add("hidden")
            const editor = editor_views.get(get(active_id))
            if(editor) editor.focus()
        }else{
            term.focus()
        }
    }
    return true
}

export function toggle_terminal_simple(){
    const terminal_container = document.getElementById("terminal")
    if(!terminal_container) return false

    if(terminal_container.classList.contains("hidden")){
        terminal_container.classList.remove("hidden")
        if(!term.element){
            term.open(terminal_container)
            fit_terminal()
        }
        term.focus()
    }else{
        terminal_container.classList.add("hidden")
        const editor = editor_views.get(get(active_id))
        if(editor) editor.focus()
    }
    return true
}

export async function fit_terminal(){
    await tick()
    await new Promise(resolve => requestAnimationFrame(resolve))

    const terminal_container = document.getElementById("terminal")
    if(!terminal_container || terminal_container.classList.contains("hidden")) return
    try{
        fit.fit()
        console.log(term.rows, term.cols)
        await invoke("pty_resize", {rows: term.rows, cols: term.cols})
    }catch(error){
        console.error("Error fitting terminal:", error)
    }
}

export function write_to_terminal(data: string){
    return new Promise<void>((response) => {
        term.write(data, () => response())
    })
}

export function write_to_pty(data: string){
    invoke("pty_write", {data})
}

export function init_shell(){
    invoke("create_shell_process").catch((error) => {
        console.error("Error creating shell:", error)
    })
}

export async function read_from_pty(){
    const data = await invoke<string>("pty_read")

    if(data){
        await write_to_terminal(data)
    }
    window.requestAnimationFrame(read_from_pty)
}