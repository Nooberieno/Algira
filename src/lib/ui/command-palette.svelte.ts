import type { FileEntry } from "./directory.svelte"
import { create_tab_from_file } from "./tabs.svelte"

export interface PaletteItem{
    id: string,
    label: string,
    description?: string,
    type: "command" | "file"
    action: () => void
}

export interface SearchResult{
    item: PaletteItem,
    score: number
}

export function fuzzy_search(pattern: string, str: string): number{
    const text = str.toLowerCase()
    const search_str = pattern.toLowerCase()
    let score = 0
    let prev_match_index = -1

    for(let i = 0; i < search_str.length; i++){
        const char = search_str[i]
        const index = text.indexOf(char, prev_match_index + 1)

        if(index === -1) return 0

        score += 1
        if(index === prev_match_index + 1) score += 2
        if(index === 0 || text[index - 1] === "/" || text[index - 1] === "_") score += 3

        prev_match_index = index
    }
    return score
}

export function create_file_items(entries: FileEntry[], basePath: string = ""): PaletteItem[]{
    let items: PaletteItem[] = []

    for(const entry of entries){
        if(!entry.is_directory){
            items.push({
                id: entry.path,
                label: entry.name,
                description: entry.path,
                type: "file",
                action: () => create_tab_from_file(entry.path)
            })
        }
        if(entry.children){
            items = items.concat(create_file_items(entry.children))
        }
    }
    return items
}