<script lang='ts'>
    import { onMount } from "svelte";
    import { EditorState, Compartment, type Extension } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { defaultKeymap } from "@codemirror/commands";
    import { keymap } from "@codemirror/view";
    import { basicSetup } from "codemirror";
    import { read_file, stat_file, write_file } from "../utils/filesystem";
    import { open } from "@tauri-apps/plugin-dialog";
    import { open_dialog_bindings, save_existing_file } from "../utils/keybinds";
    import { change_language } from "../utils/language"
    import { light_theme, dark_theme } from "../utils/theme";

    // language import for codemirror
    import { javascript } from "@codemirror/lang-javascript";  
   

    let view:EditorView;
    let current_filepath: string;
    const language_compartment: Compartment =  new Compartment;
    const theme_compartment: Compartment = new Compartment;
    let time:Date

    onMount(() => {
        const init_text = "console.log('Hello World!');";
        view = new EditorView({
            state: EditorState.create({
                doc: init_text,
                extensions: [
                    basicSetup,
                    language_compartment.of(javascript()),
                    keymap.of(defaultKeymap),
                    theme_compartment.of(dark_theme)
                ],
            }),
            parent: document.getElementById('editor')!
        });
        // Listen for keydown events
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
                    let lang_func:Extension|null = change_language(current_filepath)
                    if (lang_func){
                    view.dispatch({
                    effects: language_compartment.reconfigure(lang_func)
                            })
                        } 
                    }
                    let stat = await stat_file(current_filepath as string)
                    if (stat) {
                        if (stat.mtime){
                            console.log(stat.mtime)
                            time = stat.mtime
                        }
                    }
                }
            }
        }
        open_dialog_bindings(view, open_file)

        const save_file = async () => {
            let stat = await stat_file(current_filepath as string)
            if (stat){
                if(stat.mtime){
                    if (stat.mtime !== time){
                        //TODO give a textbox asking if the user wants to override the existing file
                    }
                }
                
            }
            write_file(current_filepath as string, view.state.doc.toString())
        }
        save_existing_file(view, save_file)
    })
</script>