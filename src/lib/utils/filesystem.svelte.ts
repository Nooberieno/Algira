import type { EditorView } from "codemirror";

import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { path } from "@tauri-apps/api";
import { get } from "svelte/store";

import { active_id, tabs, set_active_tab } from "../ui/tabs.svelte";

export const open_new_file = async(view: EditorView) => {
    console.log("Opening file")
    const file_path = await open({
        multiple: false,
        title: "Open file",
        directory: false
    })
    if(file_path){
        let tab = tabs.find((t) => file_path === t.path)
        if (tab){
            set_active_tab(tab.id)
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

export const save_text_file = async(view: EditorView) => {
    console.log("Saving file")
    const tab = tabs.find((t) => t.id === get(active_id))
    if(!tab) return false
    if(tab.path){
        await writeTextFile(tab.path, view.state.doc.toString())
        return true
    }else{
        const file_path = await save({
            title: "Save as"
        })
        if(file_path){
            tab.title = await path.basename(file_path)
            tab.path = file_path
            await writeTextFile(file_path, view.state.doc.toString())
            return true
        }
    }
    return false
}