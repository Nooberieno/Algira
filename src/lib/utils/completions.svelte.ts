import type { CompletionItem, InsertReplaceEdit, MarkedString, MarkupContent, TextEdit } from "vscode-languageserver-protocol"

import { CompletionItemKind } from "vscode-languageserver-protocol"

export function get_completion_type(kind: CompletionItemKind): string {
    switch(kind){
      case CompletionItemKind.Function:
      case CompletionItemKind.Method:
        return "function"
      case CompletionItemKind.Class:
        return "class"
      case CompletionItemKind.Interface:
        return "interface"
      case CompletionItemKind.Variable:
        return "variable"
      case CompletionItemKind.Constant:
        return "constant"
      default:
        return "text"
    }
}

function to_set(chars: Set<string>){
    let preamble = ""
    let flat = Array.from(chars).join("")
    const words = /\w/.test(flat)
    if(words){
        preamble += "\\w"
        flat.replace(/\w/g, "")
    }
    return `[${preamble}${flat.replace(/[^\w\s]/g, "\\$&")}]`
}
  
export function match_prefix(items: CompletionItem[]){
    const first = new Set<string>()
    const rest = new Set<string>()
  
    for(const item of items){
      const [initial, ...rest_string] = item.textEdit?.newText || item.label
      first.add(initial)
      for(const char of rest_string){
        rest.add(char)
    }
  }

    const source = to_set(first) + to_set(rest) + "$"

    return [new RegExp("^" + source), new RegExp(source)]
}

export function is_lsp_text_edit(text_edit?: TextEdit | InsertReplaceEdit): text_edit is TextEdit{
  return (text_edit as TextEdit)?.range !== undefined
}