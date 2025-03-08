import type { KeyBinding } from "./keymap.svelte";

import Editor from "../../components/Editor.svelte";

import { tab_switcher, create_new_tab } from "../ui/tabs.svelte";
import { toggle_terminal_focus, toggle_terminal_simple } from "../ui/terminal.svelte";
import { open_new_working_directory } from "$lib/utils/filesystem.svelte";

export const AlgiraKeymap: readonly KeyBinding[] = [
    {
        //Cannot have a shift since that results in Ctrl-Shift-unidentified for some reason
        key: "Ctrl-Tab",
        run: tab_switcher,
        prevent_default: true
    },
    {
        key: "Ctrl-`",
        run: toggle_terminal_focus,
        prevent_default: true
    },
    {
        //This would normally be placed under the shift variation of the previous keybind,
        //  but due to shift changing the backtick ` into ~ that will not work
        key: "Ctrl-Shift-~",
        run: toggle_terminal_simple,
        prevent_default: true
    },
    {
        key: "Ctrl-k",
        run: () => {open_new_working_directory(); return true},
        prevent_default: true
    },
    {
        key: "Ctrl-n",
        run: () => {create_new_tab(Editor); return true},
        prevent_default: true
    }
]