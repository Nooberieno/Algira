<script lang='ts'>
    import { onMount } from "svelte";
    import { EditorState, Compartment, type Extension } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { defaultKeymap } from "@codemirror/commands";
    import { keymap, placeholder } from "@codemirror/view";
    import { basicSetup } from "codemirror";
    import { read_file } from "../utils/filesystem";
    import { open } from "@tauri-apps/plugin-dialog";
    import { setup_bindings } from "../utils/keybinds";
    import { change_language } from "../utils/language"
    import { light_theme, dark_theme } from "../utils/theme";

    // language import for codemirror
    import { javascript } from "@codemirror/lang-javascript";
  
   

    let view:EditorView;
    let current_filepath: string;
    const language_compartment: Compartment =  new Compartment;
    const theme_compartment: Compartment = new Compartment;

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
                }
            }
        }
        setup_bindings(view, open_file)
    })
</script>