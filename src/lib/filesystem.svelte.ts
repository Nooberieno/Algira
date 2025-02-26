import type { EditorView } from "codemirror";

import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { get } from "svelte/store";

import { active_id, tabs, setActiveTab } from "./tabs.svelte";

export const open_new_file = async(view: EditorView, tab_id: string) => {
    // if(tab_id !== get(active_id)){
    //     return
    // }
    const file_path = await open({
        multiple: false,
        title: "Open file",
        directory: false
    })
    if(file_path){
        let tab = tabs.find((t) => file_path === t.path)
        if (tab){
            setActiveTab(tab.id)
        }
        tab = tabs.find((t) => get(active_id) === t.id)
        const filename = await path.basename(file_path)
        if(filename !== tab?.title){
            const text = await readTextFile(file_path)
            if(tab){
                tab.title = filename
                tab.path = file_path
                view.dispatch({
                    changes: {from: 0, to: view.state.doc.length, insert: text}
                })
            }

        }
    }
}