<script lang='ts'>
    //Style sheets
    import '../style/cm_styles.css';
    //Type Imports
    import type { Unsubscriber } from 'svelte/store';
    import type { Extension } from '@codemirror/state';
    //Library imports
    import { onMount } from "svelte";
    import { EditorState, Compartment } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { basicSetup } from "codemirror";
    import { oneDark } from '@codemirror/theme-one-dark';
    //Utility functionality
    import { read_file, write_file, current_file_path } from "../utils/filesystem";
    import { open_file_dialog, save_file_dialog } from '../utils/dialog';
    import { open_dialog_bindings, save_existing_file } from "../utils/keybinds";
    import { change_language, current_lang, get_language_by_extension } from "../utils/language"; 

    let view: EditorView;
    const language_compartment: Compartment = new Compartment();
    const theme_compartment: Compartment = new Compartment();
    let unsubscribe_lang: Unsubscriber;
    let unsubscribe_file: Unsubscriber;

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
                let lang_func: Extension | null = await change_language(lang);
                if (lang_func) {
                    view.dispatch({
                        effects: language_compartment.reconfigure(lang_func)
                    });
                }
            }
        });

        unsubscribe_file = current_file_path.subscribe(async (path) => {
            console.log("path updated to: ", path);
            if (path) {
                const text = await read_file(path as string);
                current_lang.set(get_language_by_extension(path))
                if (text) {
                    view.dispatch({
                        changes: { from: 0, to: view.state.doc.length, insert: text }
                    });
                }
            }
        });

        const open_file = async () => {
            const file_path = await open_file_dialog();
            if (file_path) {
                    current_file_path.set(file_path);
                }
        }
        open_dialog_bindings(open_file);

        const save_file = async () => {
            let file_path: string | null = null
            const unsubscribe: Unsubscriber = current_file_path.subscribe(path => {file_path = path});
            unsubscribe();
            if (file_path) {
                write_file(file_path as string, view.state.doc.toString());
            } else {
                file_path = await save_file_dialog();
                if (file_path) {
                    write_file(file_path as string, view.state.doc.toString());
                    current_file_path.set(file_path);
                }
            }
        };
        save_existing_file(save_file);

        return () => {
            if (view) {
                view.destroy();
            }
            unsubscribe_lang();
            unsubscribe_file();
        };
    });
</script>
