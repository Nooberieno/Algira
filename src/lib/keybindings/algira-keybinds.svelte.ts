import { AlgiraKeymap } from "./keymap.svelte";
import { tab_switcher } from "../ui/tabs.svelte";

AlgiraKeymap.add_keybinding({
    key: "Ctrl-Tab",
    run: () => {
        tab_switcher()
        return true
    },
    prevent_default: true
})