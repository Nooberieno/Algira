import { platform } from "@tauri-apps/plugin-os"

export type KeyBinding = {
    key?: string | string[],
    mac?: string | string[],
    win?: string | string[],
    linux?: string | string[],
    run?: () => boolean,
    shift?: () => boolean,
    scope?: string,
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
    private current_sequence: string[] = []
    private sequence_timeout: number | null = null
    private SEQUENCE_TIMEOUT = 1000

    private clear_sequence(){
        this.current_sequence = []
        if(this.sequence_timeout){
            window.clearTimeout(this.sequence_timeout)
            this.sequence_timeout = null
        }
    }

    private reset_sequence_timeout(){
        if(this.sequence_timeout){
            window.clearTimeout(this.sequence_timeout)
        }
        this.sequence_timeout = window.setTimeout(() => this.clear_sequence(), this.SEQUENCE_TIMEOUT)
    }

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

        const key_sequence = Array.isArray(key) ? key : [key]
        const normalized_sequence = key_sequence.map(k => this.normalize_keyname(k, current_platform)).join(" ")

        this.keybindings.set(normalized_sequence, binding)
        
    }

    remove_keybinding(key: string | string[]){
        const key_sequence = Array.isArray(key) ? key : [key]
        const normalized_sequence = key_sequence.map(k => this.normalize_keyname(k, current_platform)).join(" ")
        this.keybindings.delete(normalized_sequence)
    }


    handle_event = (event: KeyboardEvent) => {
        const key = this.modifiers(event)
        if(key === "") return
        this.current_sequence.push(key)
        this.reset_sequence_timeout()

        console.log("Current sequence:", this.current_sequence)

        for(const [binding_key, binding] of this.keybindings){
            const keys = binding_key.split(" ")
            if(this.current_sequence.length === keys.length && this.current_sequence.every((k, i) => k === keys[i])){
                const handled = event.shiftKey && binding.shift ? binding.shift() : binding.run ? binding.run() : false
                
                if(handled !== false){
                    if(binding.prevent_default) event.preventDefault()
                    if(binding.stop_propagation) event.stopPropagation()
                }
            this.clear_sequence()
            return
            }
        }
        if(this.current_sequence.length > 2){
            this.clear_sequence()
        }
    }

    register_keymap(keymap: readonly KeyBinding[]){
        keymap.forEach((keybind) => this.add_keybinding(keybind))
    }

    unregister_keymap(keymap: readonly KeyBinding[]){
        keymap.forEach((keybind) => {
            const key = keybind[current_platform] || keybind.key
            if(!key) return
            this.remove_keybinding(key)
        })
    }

    private modifiers(event: KeyboardEvent): string {
        if (event.key === "Control" || event.key === "Alt" || event.key === "Shift" || event.key === "Meta") {
            if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
                return "";
            }
            switch (event.key) {
                case "Control": return "Ctrl";
                case "Alt": return "Alt";
                case "Shift": return "Shift";
                case "Meta": return "Meta";
            }
        }

        let key = event.key === "Tab" ? "Tab" : event.key.toLowerCase()
        if (event.ctrlKey) key = `Ctrl-${key}`
        if (event.shiftKey) key = `Shift-${key}`
        if (event.altKey) key = `Alt-${key}`
        if (event.metaKey) key = `Meta-${key}`
        return key
    }
}

export const AlgiraKeymapManager = new KeyMapManager()

export const setup_keymap_listener = () => {
    const handler = (event: KeyboardEvent) => AlgiraKeymapManager.handle_event(event)
    window.addEventListener("keydown", handler)
 
    return() => {
        window.addEventListener("keydown", handler)
    }
}