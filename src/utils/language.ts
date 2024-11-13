function get_language_by_extension (file_path: string) {
    const extension_map: { [key: string]: string } = {
        "js": "javascript",
        "py": "python",
        "rs": "rust",
        "html": "html",
        "css": "css",
        "md": "markdown"
    }
    const extension = file_path.split(".").pop()
    if (extension !== undefined){
        return extension_map[extension.toLowerCase()] || null
    }
    return null
}