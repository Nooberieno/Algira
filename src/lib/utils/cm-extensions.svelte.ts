import type { Extension } from "@codemirror/state";

import { get } from "svelte/store";
import { EditorView } from "codemirror";
import { basicSetup } from "codemirror";
import { hoverTooltip, keymap, ViewPlugin } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { autocompletion, CompletionContext, insertCompletionText, type Completion } from "@codemirror/autocomplete";
import { CompletionTriggerKind } from "vscode-languageserver-protocol";

import { AlgiraEditorKeymap } from "../keybindings/add-cm-keybinds.svelte";
import { AlgiraStandard } from "$lib/ui/base-theme.svelte";
import { offset_to_position, position_to_offset } from "$lib/lsp/lsp.svelte";
import { tabs, active_id } from "$lib/ui/tabs.svelte";
import { get_completion, get_definiton } from "$lib/lsp/requests.svelte";
import { did_change } from "$lib/lsp/notifications.svelte";
import { get_completion_type, is_lsp_text_edit, match_prefix } from "./completions.svelte";
import { transform_lsp_tooltips } from "./tooltips.svelte";
import { ignore_changes } from "$lib/ui/editors.svelte";



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

      const ignore = update.transactions.some(tr => tr.effects.some(e => e.is(ignore_changes)))
      if(ignore) return

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

const autocomplete = autocompletion({
  override: [
    async (context: CompletionContext) => {
      const tab = tabs.find((tab) => tab.id === get(active_id))
      if(!tab || !tab.language || !tab.path){
        console.log("Not enough tab information to provided completions")
        return null
      }

      const character_before = context.state.sliceDoc(context.pos - 1, context.pos)
      if(character_before === "("){
        return null
      }

      const position = offset_to_position(context.state.doc, context.pos)
      const trigger_chararacter = context.matchBefore(/\w+$/) ? undefined : character_before
      const trigger_kind = context.explicit ? CompletionTriggerKind.Invoked : CompletionTriggerKind.TriggerCharacter

      const completions = await get_completion(tab.language, tab.path, position, trigger_kind, trigger_chararacter)

      if(!completions){
        console.log("No completion items")
        return null
      } 

      let items = "items" in completions ? completions.items : completions

      const [span, match] = match_prefix(items)
      const token = context.matchBefore(match)

      let { pos } = context
      
      if(token){
        pos = token.from
        const word = token.text.toLowerCase()
        if(/^\w+$/.test(word)){
          items = items.filter(({ label, filterText}: {label: any, filterText: any}) => {
            const text = filterText ?? label
            return text.toLowerCase().startsWith(word)
          })
          .sort((a: any, b: any) => {
            const a_text = a.sortText ?? a.label
            const b_text = b.sortText ?? b.label

            switch(true){
              case a_text.startsWith(token.text) && !b_text.startsWith(token.text):
                return -1
              case !a_text.startsWith(token.text) && b_text.startsWith(token.text):
                return 1
            }
            return 0
          })
        }
      }

          const options = items.map((item: { detail: string; label: string; kind?: any; textEdit?: any; _documentation?: any; additionalTextEdits?: any }) => {
            const { detail, label, kind, textEdit, _documentation, additionalTextEdits } = item;
            const completion: Completion = {
              label,
              detail,
              apply(view: EditorView, completion: Completion, from: number, to: number){
                if(is_lsp_text_edit(textEdit)){
                  view.dispatch(
                    insertCompletionText(
                      view.state,
                      textEdit.newText,
                      position_to_offset(view.state.doc, textEdit.range.start.line, textEdit.range.start.character)!,
                      position_to_offset(view.state.doc, textEdit.range.end.line, textEdit.range.end.character)!
                    )
                  )
                }else{
                  view.dispatch(insertCompletionText(view.state, label, from, to))
                }

                if(!additionalTextEdits) return

                additionalTextEdits
                  .sort(({ range: {end: a } }: { range: { end: { line: number; character: number } } }, { range: { end: b } }: { range: { end: { line: number; character: number } } }) => {
                    if (position_to_offset(view.state.doc, a.line, a.character)! < position_to_offset(view.state.doc, b.line, b.character)!) {
                      return 1;
                  } else if (position_to_offset(view.state.doc, a.line, a.character)! > position_to_offset(view.state.doc, b.line, b.character)!) {
                      return -1;
                  }
                  return 0;
              })
              .forEach((textEdit: { range: { start: { line: number; character: number; }; end: { line: number; character: number; }; }; newText: any; }) => {
                  view.dispatch(view.state.update({
                      changes: {
                          from: position_to_offset(view.state.doc, textEdit.range.start.line, textEdit.range.start.character)!,
                          to: position_to_offset(view.state.doc, textEdit.range.end.line, textEdit.range.end.character)!,
                          insert: textEdit.newText,
                      },
                  }))
                })
              },
              type: kind && get_completion_type(kind)
            }
            return completion
          })
          return {
            from: pos,
            options,
            filter: false
      }
    }
  ]
})

const hover_tooltips = hoverTooltip(
  (view, pos) => {
    return transform_lsp_tooltips(view, offset_to_position(view.state.doc, pos)) ?? null
  }
)

export const global_extensions: Extension[] = $state([focus_tracker, AlgiraStandard, basicSetup, goto_definition, change_updater, autocomplete, hover_tooltips,  keymap.of([...defaultKeymap, ...AlgiraEditorKeymap])])

export const active_extensions: Record<string, Extension[]> = $state({})

export function add_active_extensions(tab_id: string, extensions: Extension[]){
    active_extensions[tab_id] = [...(active_extensions[tab_id] || []), ...(extensions || [])]
}