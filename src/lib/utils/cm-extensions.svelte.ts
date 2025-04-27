import type { Extension } from "@codemirror/state";

import { get } from "svelte/store";
import { EditorView } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { keymap, ViewPlugin } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

import { AlgiraEditorKeymap } from "../keybindings/add-cm-keybinds.svelte";
import { offset_to_position } from "$lib/lsp/lsp.svelte";
import { tabs, active_id } from "$lib/ui/tabs.svelte";
import { get_definiton } from "$lib/lsp/requests.svelte";
import { did_change } from "$lib/lsp/notifications.svelte";



const focus_tracker: Extension = EditorView.updateListener.of((update) => {
    let last_cursor_position: number | null = null
    if (update.focusChanged && update.view.hasFocus && last_cursor_position !== null){
        update.view.dispatch({
            selection: { anchor: last_cursor_position }
        })
    }
    if (update.selectionSet){
        last_cursor_position = update.state.selection.main.head
    }
})

const goto_definition = ViewPlugin.fromClass(class {
    constructor(view: EditorView){
        view.dom.addEventListener("click", (e: MouseEvent) => {
            if (e.ctrlKey || e.metaKey){
                const offset = view.posAtCoords({x: e.clientX, y: e.clientY})
                if(offset){
                    const position = offset_to_position(view.state.doc, offset)
                    const tab = tabs.find((tab) => tab.id === get(active_id))
                    if(!tab || !tab.language || !tab.path) return
                    get_definiton(tab.language, tab.path, position)
                }
            }
        })
    }
})

const change_updater = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const tab = tabs.find((t) => t.id === get(active_id));
      if (!tab || !tab.path || !tab.language || tab.document_version === undefined) return;
  
      const changes: any[] = [];
      update.changes.iterChanges((from, to, _unused_from, _unused_to, text) => {
        const start = offset_to_position(update.startState.doc, from);
        const end = offset_to_position(update.startState.doc, to);
        
        changes.push({
          range: {
            start,
            end
          },
          text: text.toString()
        });
      });
  
      if (changes.length > 0) {
        tab.document_version++;
        did_change(tab.language, tab.path, tab.document_version, changes);
      }
    }
  })

export const global_extensions: Extension[] = $state([focus_tracker, oneDark, basicSetup, goto_definition, change_updater, keymap.of([...defaultKeymap, ...AlgiraEditorKeymap])])

export const active_extensions: Record<string, Extension[]> = $state({})

export function add_active_extensions(tab_id: string, extensions: Extension[]){
    active_extensions[tab_id] = [...(active_extensions[tab_id] || []), ...(extensions || [])]
}