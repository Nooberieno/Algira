
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

export async function change_language(file_path: string){
    const lang = get_language_by_extension(file_path)
    console.log(lang)
    if (lang === null){
        return null
    }
    const { javascript } = await import('@codemirror/lang-javascript')
    switch(lang){
        case "javascript":
            return javascript()
        case "python":
            const { python } = await import('@codemirror/lang-python')
            return python()
        case "rust":
            const { rust } = await import('@codemirror/lang-rust')
            return rust()
        case "html":
            const { html } = await import('@codemirror/lang-html')
            return html()            
        case "css":
            const { css } = await import('@codemirror/lang-css') 
            return css()
        case "C++":
            const { cpp } = await import('@codemirror/lang-cpp')
            return cpp()
        case "markdown":
            const { markdown } = await import('@codemirror/lang-markdown')
            return markdown()
        case "typescript":
            return javascript({typescript: true})
        case "jsx":
            return javascript({jsx: true})
    }
    return null
}