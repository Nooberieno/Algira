import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit"
import { invoke } from "@tauri-apps/api/core";
import { tick } from "svelte";
import { get, writable } from "svelte/store";
import { editor_views } from "./editors.svelte";
import { active_id } from "./tabs.svelte";
import { working_directory } from "./directory.svelte";


export interface TerminalInstance{
    terminal: Terminal,
    fit: FitAddon,
    id: string,
}

export const terminals: TerminalInstance[] = $state([])
export const active_terminal = writable<string>("")

export function set_active_terminal(id: string){
    active_terminal.set(id)
    const active_terminal_instance = terminals.find((t) => t.id === id)
    if(!active_terminal_instance) return
    fit_terminal(active_terminal_instance)
}

export async function toggle_terminal_focus(){
    const active_term_id = get(active_terminal)
    let active_term_instance: TerminalInstance | undefined = terminals.find((t) => t.id === active_term_id)
    const terminal_container = document.getElementById("terminal-tab-container")
    const terminal_tab_bar = document.getElementById("terminal-tab-bar")
    if(!terminal_container || ((terminals.length > 0) && !active_term_instance) || (active_term_instance && (terminals.length <= 0))) return false

    if(terminal_container.classList.contains("hidden")){
        terminal_container.classList.remove("hidden")
        terminal_tab_bar?.classList.remove("hidden")
        if(terminals.length === 0){
            await add_terminal_instance()
            const active_term_id = get(active_terminal)
            active_term_instance = terminals.find((t) => t.id === active_term_id) 
        }
        if(!active_term_instance) return false
        active_term_instance.terminal.focus()
    }else{        
        if(!active_term_instance) return false
        if(document.querySelector(".xterm-helper-textarea") === document.activeElement){
            terminal_container.classList.add("hidden")
            terminal_tab_bar?.classList.add("hidden")

            const editor = editor_views.get(get(active_id))
            if(editor){
                editor.focus()
            }else{
                active_term_instance.terminal.blur()
            }

        }else{
            active_term_instance.terminal.focus()
        }
    }
    return true
}

export async function toggle_terminal_simple(){
    const active_term_id = get(active_terminal)
    let active_term_instance = terminals.find((t) => t.id === active_term_id)
    const terminal_container = document.getElementById("terminal-tab-container")
    const terminal_tab_bar = document.getElementById("terminal-tab-bar")
    if(!terminal_container || ((terminals.length > 0) && !active_term_instance) || (active_term_instance && (terminals.length <= 0))) return false

    if(terminal_container.classList.contains("hidden")){
        terminal_container.classList.remove("hidden")
        terminal_tab_bar?.classList.remove("hidden")
        if(terminals.length === 0){
            await add_terminal_instance()
            active_term_instance = terminals[terminals.length - 1]
        }
        if(!active_term_instance) return false
        if(!active_term_instance.terminal.element){
            active_term_instance.terminal.open(terminal_container)
            fit_terminal(active_term_instance)
        }
        active_term_instance.terminal.focus()
    }else{
        terminal_container.classList.add("hidden")
        terminal_tab_bar?.classList.add("hidden")
        const editor = editor_views.get(get(active_id))
        if(editor) editor.focus()
    }
    return true
}

export function new_terminal(){
    const term = new Terminal({
    cursorBlink: true,
    fontFamily: "Hack Mono",
    fontSize: 10,
    fontWeight: "normal",
    theme: {
        background: "#131313",
        cursor: "528bff",
        foreground: "#f8f8f2",
        selectionBackground: "#9696964d"
    }
});

    const fit = new FitAddon()
    
    const term_instance: TerminalInstance = {
        terminal: term,
        fit,
        id: crypto.randomUUID(),
    }
    return term_instance
}

export async function fit_terminal(term_instance: TerminalInstance){
    await tick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    const terminal_container = document.getElementById("terminal-tab-container")
    if(!terminal_container || terminal_container.classList.contains("hidden")) return
    try{
        console.log("Fitting terminal")
        term_instance.fit.fit()
        console.log(term_instance.terminal.rows, term_instance.terminal.cols)
        await invoke("pty_resize", {id: term_instance.id, rows: term_instance.terminal.rows, cols: term_instance.terminal.cols})
    }catch(error){
        console.error("Error fitting terminal:", error)
    }
}

export function write_to_terminal(data: string, term_instance: TerminalInstance){
    return new Promise<void>((response) => {
        term_instance.terminal.write(data, () => response())
    })
}

export function write_to_pty(id: string, data: string){
    invoke("pty_write", {id, data})
}

export async function init_shell(id: string){
    let active_dir: string | null = get(working_directory)
    if(!active_dir){
        active_dir = null
    }
    await invoke("create_shell_process", {id, dir: active_dir}).catch((error) => {
        console.error("Error creating shell:", error)
    })
}

export async function add_terminal_instance(){
    const term_instance = new_terminal()
    terminals.push(term_instance)
    await tick()
    const term_container = document.getElementById(`terminal-${term_instance.id}`)
    term_instance.terminal.open(term_container!)
    await tick()
    active_terminal.set(term_instance.id)
    console.log(get(active_terminal))
    console.log(terminals.length)
    // await new Promise((res) => setTimeout(res, 500));
}

export function close_terminal(id: string){
    const index = terminals.findIndex((t) => t.id === id)
    if(index === -1) return

    const terminal = terminals[index]
    terminal.terminal.dispose()
    terminal.fit.dispose()


    terminals.splice(index, 1)
    console.log(terminals.length)

    if(terminals.length > 0){
        const next_term = terminals[Math.min(index, terminals.length - 1)]
        active_terminal.set(next_term.id)
        if(next_term){
            fit_terminal(next_term)
            next_term.terminal.focus()
        }
    }else{
        toggle_terminal_simple()
        active_terminal.set("")
        console.log("No active terminal")
    }
}

export async function exit_terminal_with_pty_cleanup(id: string){
    await invoke("close_terminal", {id})
}

export async function terminal_stress_test() {
    for(let i = 0; i < 1024; i++){
        await add_terminal_instance()
    }
}