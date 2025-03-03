import type { KeyBinding } from "./keymap.svelte";

import { AlgiraKeymapManager } from "./keymap.svelte";

import { tab_switcher } from "../ui/tabs.svelte";
import { toggle_terminal } from "../ui/terminal.svelte";

const AlgiraKeymap: readonly KeyBinding[] = [
    {
        key: "Ctrl-Tab",
        run: tab_switcher,
        prevent_default: true
    },
    {
        key: "Ctrl-`",
        run: toggle_terminal,
        prevent_default: true
    }
]

AlgiraKeymapManager.register_keymap(AlgiraKeymap)