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
        // Early exit for empty strings
    if (!pattern) return 0;
    if (!str) return 0;

    const text = str.toLowerCase();
    const search_str = pattern.toLowerCase();
    
    // Quick reject if first char isn't found
    if (text.indexOf(search_str[0]) === -1) return 0;
    
    let score = 0;
    let prev_match_index = -1;
    let consecutive_matches = 0;

    // Pre-calculate string lengths to avoid repeated property access
    const pattern_len = search_str.length;
    const text_len = text.length;

    for (let i = 0; i < pattern_len; i++) {
        const char = search_str[i];
        let found = false;
        
        // Only search the remaining part of the string
        for (let j = prev_match_index + 1; j < text_len; j++) {
            if (text[j] === char) {
                found = true;
                
                // Scoring heuristics
                score += 1;
                
                // Bonus for consecutive matches
                if (j === prev_match_index + 1) {
                    consecutive_matches++;
                    score += consecutive_matches;
                } else {
                    consecutive_matches = 0;
                }
                
                // Bonus for matches after separators
                if (j === 0 || text[j - 1] === '/' || text[j - 1] === '_') {
                    score += 3;
                }
                
                prev_match_index = j;
                break;
            }
        }
        
        // If any character isn't found, reject the match
        if (!found) return 0;
    }
    
    return score;
}