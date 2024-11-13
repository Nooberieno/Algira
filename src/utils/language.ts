import { javascript, typescriptLanguage } from "@codemirror/lang-javascript"
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
        "cpp": "C++",
        "ts": "typescript",
        "jsx": "jsx"
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
    switch(lang){
        case "javascript":
            return javascript()
        case "python":
            return python()
        case "rust":
            return rust()
        case "html":
            return html()            
        case "css": 
            return css()
        case "C++":
            return cpp()
        case "markdown":
            return markdown()
        case "typescript":
            return javascript({typescript: true})
        case "jsx":
            return javascript({jsx: true})
    }
    return null
}