import type { Hover } from "vscode-languageserver-protocol"
import type { Tooltip } from "@codemirror/view"

import { get } from "svelte/store"
import { EditorView } from "codemirror"

import { format_lsp_contents, position_to_offset } from "$lib/lsp/lsp.svelte"
import { get_tooltips } from "$lib/lsp/requests.svelte"
import { tabs, active_id } from "$lib/ui/tabs.svelte"

export async function transform_lsp_tooltips(view: EditorView, { line, character }:{ line: number, character: number }): Promise<Tooltip | null>{
    const tab = tabs.find((tab) => tab.id === get(active_id))
    if(!tab || !tab.path || !tab.language){
      console.log("Not enough tab information to get tooltips")
      return null
    }
    const tooltips: Hover | null = await get_tooltips(tab.language, tab.path, (view.state.doc, {line, character}))
    if(!tooltips){
      console.log("No tooltips")
      return null
    }

    const { contents, range } = tooltips

    let position = position_to_offset( view.state.doc, line, character)!
    let end: number = position

    if(range){
        position = position_to_offset(view.state.doc, range.start.line, range.start.character)!
        end = position_to_offset(view.state.doc, range.end.line, range.end.character)!
    }
    if(position === null) return null
    
    const dom = document.createElement("div")

    dom.classList.add("documentation")

    dom.innerHTML = await format_lsp_contents(contents, tab.language)

    return {
        pos: position,
        end,
        create: (view) => ({dom}),
        above: true
    }
}