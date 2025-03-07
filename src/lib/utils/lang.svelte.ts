import type { LanguageSupport } from "@codemirror/language";

import { add_active_extensions } from "./cm-extensions.svelte";

const file_extension_lang_map: Map<string, string> = new Map<string, string>();
const language_extensions: Map<string, LanguageSupport> = new Map<string, LanguageSupport>();

export function register_language(file_extension: string, language: string, language_support: LanguageSupport){
    language_extensions.set(language, language_support)
    file_extension_lang_map.set(file_extension, language)
}

export function get_language_from_file_extension(file_path: string){
    const extension = file_path.split(".").pop()
    if(extension) return file_extension_lang_map.get(extension)
    return undefined
}

export function add_file_association(file_extension: string, language: string){
    if(!language_extensions.has(language)) return
    file_extension_lang_map.set(file_extension, language)

}

export function language_handler(tab_id: string, language: string | undefined){
    if(!language) return

    const lang_extension = language_extensions.get(language)
    if(lang_extension){
        console.log(lang_extension)
        add_active_extensions(tab_id, [lang_extension])
    }
}

export function check_language(language: string){
    return language_extensions.has(language)
}