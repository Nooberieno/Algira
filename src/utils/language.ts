import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { rust } from "@codemirror/lang-rust";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { cpp } from "@codemirror/lang-cpp";
import { markdown } from "@codemirror/lang-markdown";
import type { Extension } from "@codemirror/state";

function get_language_by_extension (file_path: string) {
    const extension_map: { [key: string]: string } = {
        "js": "javascript",
        "py": "python",
        "rs": "rust",
        "html": "html",
        "css": "css",
        "md": "markdown",
        "cpp": "C++"
    }
    const extension = file_path.split(".").pop()
    console.log(extension)
    if (extension !== undefined){
        return extension_map[extension.toLowerCase()] || null
    }
    return null
}

export function change_language(file_path: string){
    const lang = get_language_by_extension(file_path)
    console.log(lang)
    if (lang === null){
        return null
    }
    let lang_func:Extension
    switch(lang){
        case "javascript":
            lang_func = javascript()
            return lang_func
        case "python":
            lang_func = python()
            return lang_func
        case "rust":
            lang_func = rust()
            return lang_func
        case "html":
            lang_func = html()
            return lang_func
        case "css": 
            lang_func = css()
            return lang_func
        case "C++":
            lang_func = cpp()
            return lang_func
        case "markdown":
            lang_func = markdown()
            return lang_func
    }
    return null
}