<script lang='ts'>
    import '../style/cm_styles.css'
    import { onMount } from "svelte";
    import { EditorState, Compartment, type Extension } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { basicSetup } from "codemirror";
    import { read_file, write_file } from "../utils/filesystem";
    import { open, save } from "@tauri-apps/plugin-dialog";
    import { open_dialog_bindings, save_existing_file } from "../utils/keybinds";
    import { change_language, get_language_by_extension } from "../utils/language" 
    import { oneDark } from '@codemirror/theme-one-dark'

    let view:EditorView;
    let current_filepath: string;
    const language_compartment: Compartment =  new Compartment;
    const theme_compartment: Compartment = new Compartment;


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

        const open_file = async () => {
            const file_path = await open({
                multiple: false,
                title: "Open",
            })
            if (file_path) {
                const text = await read_file(file_path as string);
                if (text){
                    current_filepath = file_path
                    view.dispatch({
                    changes: { from: 0, to: view.state.doc.length, insert: text}
                })
                if (current_filepath){
                    let lang_func:Extension|null = await change_language(get_language_by_extension(current_filepath))
                    if (lang_func){
                    view.dispatch({
                    effects: language_compartment.reconfigure(lang_func)
                            })
                        } 
                    }
                }
            }
        }
        open_dialog_bindings(view, open_file)

        const save_file = async () => {
            if (current_filepath) {
                write_file(current_filepath as string, view.state.doc.toString())
            }else {
                let file_path = await save({
                    title: "Save as"
                })
                if (file_path != null){
                    write_file(file_path as string, view.state.doc.toString())
                    let lang_func:Extension|null = await change_language(file_path)
                    if (lang_func){
                    view.dispatch({
                    effects: language_compartment.reconfigure(lang_func)
                        })
                    }
                    current_filepath = file_path
                }
            }
        }
        save_existing_file(view, save_file)

        return () => {
            if (view){
                view.destroy()
            }
        };
    });
</script>