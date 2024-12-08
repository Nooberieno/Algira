<script lang='ts'>
    import '../style/cm_styles.css'
    import type { Unsubscriber } from 'svelte/store';
    import { onMount } from "svelte";
    import { EditorState, Compartment, type Extension } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { basicSetup } from "codemirror";
    import { read_file, write_file, current_file_path } from "../utils/filesystem";
    import { open_file_dialog, save_file_dialog } from '../utils/dialog';
    import { open_dialog_bindings, save_existing_file } from "../utils/keybinds";
    import { change_language, current_lang, get_language_by_extension } from "../utils/language" 
    import { oneDark } from '@codemirror/theme-one-dark'

    let view:EditorView;
    let current_filepath: string
    const language_compartment: Compartment =  new Compartment;
    const theme_compartment: Compartment = new Compartment;
    let unsubscribe_lang: Unsubscriber
    let unsubscribe_file: Unsubscriber


    onMount(() => {
        view = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [
                    basicSetup,
                    language_compartment.of([]),
                    theme_compartment.of(oneDark),
                ],
            }),
            parent: document.getElementById('editor')!
        });

        unsubscribe_lang = current_lang.subscribe(async (lang) => {
            if (lang) {
                let lang_func: Extension | null = await change_language(lang)
                if (lang_func){
                    view.dispatch({
                        effects: language_compartment.reconfigure(lang_func)
                    })
                }
            }
        })

        unsubscribe_file = current_file_path.subscribe(async (path) => {
            console.log("path updated to: ", path)
            if (path) {
                const text = await read_file(path as string);
                if (text){
                    console.log("Content loaded succesfully", text)
                    view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: text}
                })
                }
            }
        })

        const open_file = async () => {
            const file_path = await open_file_dialog();
            if (file_path) {
                const text = await read_file(file_path as string);
                if (text){
                    console.log("Content loaded succesfully", text)
                    current_filepath = file_path
                    view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: text}
                })
            }
                if (current_filepath){
                    let lang_func:string|null = get_language_by_extension(current_filepath)
                    if (lang_func){
                        current_lang.set(lang_func)
                    }
                }
            }
        }
        open_dialog_bindings(view, open_file)

        const save_file = async () => {
            if (current_filepath) {
                write_file(current_filepath as string, view.state.doc.toString())
            }else {
                let file_path = await save_file_dialog()
                if (file_path){
                    write_file(file_path as string, view.state.doc.toString())
                    current_lang.set(get_language_by_extension(file_path))
                    current_filepath = file_path
                }
            }
        }
        save_existing_file(view, save_file)

        return () => {
            if (view){
                view.destroy()
            }
            unsubscribe_lang()
            unsubscribe_file()
        };
    })
</script>