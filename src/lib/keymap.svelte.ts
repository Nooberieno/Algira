import type { EditorView } from "codemirror"
import { platform } from "@tauri-apps/plugin-os"

export type KeyBinding = {
    key?: string,
    mac?: string,
    win?: string,
    linux?: string,
    run?: (view: EditorView, tab_id: string) => boolean,
    shift?: (view: EditorView, tab_id: string) => boolean,
    priority?: number,
    prevent_default?: boolean,
    stop_propagation?: boolean
}

type PlatformName = "mac" | "win" | "linux" | "key"

function get_platform(){
    const platform_string = platform();
    switch(platform_string){
        case("windows"):
            return "win"
        case("linux"):
            return platform_string
        case("macos"):
            return "mac"
        default:
            return "key"
    }
}

const current_platform: PlatformName = get_platform()

class KeyMapManager{
    private keybindings: KeyBinding[] = []

    private normalize_keyname(key_name: string, platform: PlatformName): string{
        const parts = key_name.split(/-(?!$)/)
        let result = parts[parts.length - 1]
        if (result == "Space") result = " "
        let alt, ctrl, shift, meta
        for(let i = 0; i < parts.length - 1; i++){
            const mod = parts[i]
            if(/^(cmd|meta|m)$/i.test(mod)) meta = true 
            else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true
            else if (/^s(hift)?$/i.test(mod)) shift = true
            else if (/^mod$/i.test(mod)) { if (platform == "mac") meta = true; else ctrl = true }
            else throw new Error("Unrecognized modifier name: " + mod)
        }
        if (alt) result = "Alt-" + result
        if (ctrl) result = "Ctrl-" + result
        if (meta) result = "Meta-" + result
        if (shift) result = "Shift-" + result
        return result
    }

    add_keybinding(binding: KeyBinding){
        if(binding.key) binding.key = this.normalize_keyname(binding.key, current_platform)
        this.keybindings.push(binding)
        this.keybindings.sort((a,b) => (b.priority || 0) - (a.priority || 0));
    }

    remove_keybinding(key: string){
        this.keybindings = this.keybindings.filter(binding => binding.key !== key)
    }


    handle_event = (event: KeyboardEvent, view: EditorView, tab_id: string) => {
        const key = this.modifiers(event)
        const binding = this.keybindings.find(binding => binding.key === key || binding[current_platform] === key)

        if(binding){
            let handled = false
            if(event.shiftKey && binding.shift){
                handled = binding.shift(view, tab_id)
            }else if(binding.run){
                handled = binding.run(view, tab_id)
            }

            if(handled !== false){
                if(binding.prevent_default) event.preventDefault()
                if(binding.stop_propagation) event.stopPropagation()
            }
        }

    }

    private modifiers(event: KeyboardEvent): string {
        let key = event.key.toLowerCase()
        if(event.ctrlKey) key = `Ctrl-${key}`
        if(event.shiftKey) key = `Shift-${key}`
        if(event.altKey) key = `Alt-${key}`
        if(event.metaKey) key = `Meta-${key}`
        return key
    }
}

export const AlgiraKeymap = new KeyMapManager()

export const setup_keymap_listener = (view: EditorView, tab_id: string) => {
    const handler = (event: KeyboardEvent) => AlgiraKeymap.handle_event(event, view, tab_id)
    window.addEventListener("keydown", handler)

    return() => {
        window.removeEventListener("keydown", handler)
    }
}