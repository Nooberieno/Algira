import { AlgiraKeymap } from "./keymap.svelte";

import { tab_switcher } from "../ui/tabs.svelte";
import { toggle_terminal } from "$lib/utils/terminal.svelte";

AlgiraKeymap.add_keybinding({
    key: "Ctrl-Tab",
    run: () => {
        tab_switcher()
        return true
    },
    prevent_default: true
})

AlgiraKeymap.add_keybinding({
    key: "Ctrl-`",
    run: toggle_terminal,
    prevent_default: true
})