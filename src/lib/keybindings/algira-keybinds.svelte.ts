import type { KeyBinding } from "./keymap.svelte";

import { tab_switcher } from "../ui/tabs.svelte";
import { toggle_terminal_focus } from "../ui/terminal.svelte";

export const AlgiraKeymap: readonly KeyBinding[] = [
    {
        key: "Ctrl-Tab",
        run: tab_switcher,
        prevent_default: true
    },
    {
        key: "Ctrl-`",
        run: toggle_terminal_focus,
        prevent_default: true
    }
]