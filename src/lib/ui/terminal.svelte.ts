import { Terminal } from "@xterm/xterm";
import { get } from "svelte/store";

import { active_id } from "./tabs.svelte";
import { editor_views } from "$lib/utils/editors.svelte";

export const term = new Terminal({
    cursorBlink: true,
    fontFamily: "Hack Mono",
    fontSize: 10,
    fontWeight: "normal",
});

export function toggle_terminal(){
    const terminal_container = document.getElementById("terminal")
    if(!terminal_container) return false

    if(terminal_container.classList.contains("hidden")){
        terminal_container.classList.remove("hidden")
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