const file_extension_lang_map: Map<string, string> = new Map<string, string>();

export function add_file_extension_with_language(file_extension: string, language: string){
    file_extension_lang_map.set(file_extension, language)
}

export function get_language_from_file_extension(file_path: string){
    const extension = file_path.split(".").pop()
    if(extension) return file_extension_lang_map.get(extension)
    return undefined
}