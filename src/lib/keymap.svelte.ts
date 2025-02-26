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
    private keybindings: Map<string, KeyBinding> = new Map<string, KeyBinding>()

    private normalize_keyname(key_name: string, platform: PlatformName): string{
        const parts = key_name.split(/-(?!$)/)
        let result = parts.pop() || ""
        if (result == "Space") result = " "

        const modifiers = new Set()
        for(const mod of parts){
            switch(mod.toLowerCase()){
                case "cmd": case "meta": case "m":
                    modifiers.add("Meta"); break
                case "alt": case "a":
                    modifiers.add("Alt"); break
                case "ctrl": case "control": case "c":
                    modifiers.add("Ctrl"); break
                case "shift": case "s":
                    modifiers.add("Shift"); break
                case "mod":
                    modifiers.add(platform === "mac" ? "Meta" : "Ctrl"); break
                default:
                    throw new Error("Unrecognized modifier name: " + mod)
            }
        }
        return [...modifiers, result].join("-")
    }

    add_keybinding(binding: KeyBinding){
        const key = binding[current_platform] || binding.key
        if (!key) return

        const normalized_key = this.normalize_keyname(key, current_platform)
        this.keybindings.set(normalized_key, binding)
        
    }

    remove_keybinding(key: string){
        this.keybindings.delete(this.normalize_keyname(key, current_platform))
    }


    // handle_event = (event: KeyboardEvent) => {
    //     const key = this.modifiers(event)
    //     const binding = this.keybindings.get(key)

    //     if (!binding) return

    //     const handled = event.shiftKey && binding.shift ? binding.shift : binding.run ? binding.run() : false

    //     if(handled !== false){
    //         if(binding.prevent_default) event.preventDefault()
    //         if(binding.stop_propagation) event.stopPropagation()
    //     }
    // }

    handle_editor_event = (event: KeyboardEvent, view: EditorView, tab_id: string) => {
        const key = this.modifiers(event)
        const binding = this.keybindings.get(key)

        if (!binding) return

        const handled = event.shiftKey && binding.shift ? binding.shift : binding.run ? binding.run(view, tab_id) : false

        if(handled !== false){
            if(binding.prevent_default) event.preventDefault()
            if(binding.stop_propagation) event.stopPropagation()
        }
    }

    private modifiers(event: KeyboardEvent): string {
        let key = event.key === "Tab" ? "Tab" : event.key.toLowerCase() // Fix for Tab key
        if(event.ctrlKey) key = `Ctrl-${key}`
        if(event.shiftKey) key = `Shift-${key}`
        if(event.altKey) key = `Alt-${key}`
        if(event.metaKey) key = `Meta-${key}`
        return key
    }
}

export const AlgiraKeymap = new KeyMapManager()

export const setup_editor_keymap_listener = (view: EditorView, tab_id: string) => {
    const handler = (event: KeyboardEvent) => AlgiraKeymap.handle_editor_event(event, view, tab_id)
    view.dom.addEventListener("keydown", handler)

    return() => {
        view.dom.removeEventListener("keydown", handler)
    }
}

// export const setup_keymap_listener = () => {
//     const handler = (event: KeyboardEvent) => AlgiraKeymap.handle_event(event)
//     window.addEventListener("keydown", handler)
 
//     return() => {
//         window.addEventListener("keydown", handler)
//     }
// }