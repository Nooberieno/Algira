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
    import { path } from '@tauri-apps/api'
    //Utility functionality
    import { read_file, write_file, current_file_path } from "../utils/filesystem";
    import { open_file_dialog, save_file_dialog } from '../utils/dialog';
    import { open_dialog_bindings, save_existing_file } from "../utils/keybinds";
    import { change_language, current_lang, get_language_by_extension } from "../utils/language"; 

    let editors: EditorView[] = $state([])
    let current_tab: number = $state(0)
    let untitled: number = $state(1)
    let tabs: string[] = $state([`untitled-0`])
    let paths: Map<string, string> = new Map();
    let tab_count = $state(tabs.length)
    const language_compartment: Compartment = new Compartment();
    const theme_compartment: Compartment = new Compartment();
    let unsubscribe_lang: Unsubscriber;
    let unsubscribe_file: Unsubscriber;

    function add_tab(){
        tabs.push(`untitled-${untitled}`)
        untitled += 1
        tab_count = tabs.length

        setTimeout(() => create_editor_from_tab(tab_count - 1), 0)
    }

    const switch_tab = (index: number) => {
            editors.forEach((editor, i) => {
                editor.dom.style.display = i === index ? 'block' : 'none'
            })
            current_tab = index
            const path_check = paths.has(tabs[current_tab])
            if (path_check){
                const value = paths.get(tabs[current_tab])
                if (value){
                    current_file_path.set(value)
                }
            }else{
                current_file_path.set(null)
            }
        }

    const create_editor_from_tab = (index: number) => {
        const parent_element = document.getElementById(`editor-${index}`)
        if (!parent_element){
            console.error("parent element of editor does not exist")
            return
        }
        const editor = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [
                    basicSetup,
                    language_compartment.of([]),
                    theme_compartment.of(oneDark),
                ],
            }),
            parent: document.getElementById(`editor-${index}`)!
        });
        editors.push(editor)
    }
    onMount(() => {
        tabs.forEach((tab, index) => {
            const editor = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [
                    basicSetup,
                    language_compartment.of([]),
                    theme_compartment.of(oneDark),
                ],
            }),
            parent: document.getElementById(`editor-${index}`)!
        });
        editors.push(editor)
        }) 

        editors.forEach((editor, index) => {
            if (index !== current_tab){
                editor.dom.style.display = 'none'
            }
        })

        tabs.forEach((tab, index) => {
            const tab_element = document.getElementById(`tab-${index}`)
            if(tab_element){
                tab_element.addEventListener('click', () => switch_tab(index))
            }
        })

        unsubscribe_lang = current_lang.subscribe(async (lang) => {
            if (lang) {
                let lang_func: Extension | null = await change_language(lang);
                if (lang_func) {
                    editors[current_tab].dispatch({
                        effects: language_compartment.reconfigure(lang_func)
                    });
                }
            }
        });

        unsubscribe_file = current_file_path.subscribe(async (file_path) => {
            console.log("path updated to: ", file_path);
            if (file_path) {
                const filename = await path.basename(file_path)
                console.log(filename)
                const text = await read_file(file_path as string);
                current_lang.set(get_language_by_extension(file_path))
                if (filename){
                     tabs[current_tab] = filename
                     paths.set(filename, file_path)
                    }
                if (text) {
                    editors[current_tab].dispatch({
                        changes: { from: 0, to: editors[current_tab].state.doc.length, insert: text }
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
                write_file(file_path as string, editors[current_tab].state.doc.toString());
            } else {
                file_path = await save_file_dialog();
                if (file_path) {
                    write_file(file_path as string, editors[current_tab].state.doc.toString());
                    current_file_path.set(file_path);
                }
            }
        };
        save_existing_file(save_file);

        return () => {
            if (editors) {
                editors.forEach(editor => {
                    editor.destroy()
                })
            }
            unsubscribe_lang();
            unsubscribe_file();
        };
    });
</script>

<style>
  </style>

<div class="tab-bar">
    {#each tabs as tab, index}
      <button  onclick={() => {switch_tab(index)}} class={`tab ${current_tab === index ? 'active' : ''}`} id={`tab-${index}`}>{tab}</button>
    {/each}
    <button onclick={() => {add_tab()}} class='tab-bar'>&xoplus;</button>
  </div>
  
  {#each tabs as _, index}
    <div class={`editor ${current_tab === index ? 'active' : ''}`} id={`editor-${index}`}></div>
  {/each} 