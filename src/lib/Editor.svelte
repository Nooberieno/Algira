<script lang='ts'>
    //Style sheets
    import '../style/cm_styles.css';
    //Type Imports
    import { get, type Unsubscriber } from 'svelte/store';
    import type { Extension } from '@codemirror/state';
    //Library imports
    import { onMount } from "svelte";
    import { EditorState, Compartment } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { basicSetup } from "codemirror";
    import { oneDark } from '@codemirror/theme-one-dark';
    import { path } from '@tauri-apps/api'
    import { tick } from 'svelte';
    //Utility functionality
    import { read_file, write_file, current_file_path } from "../utils/filesystem";
    import { open_file_dialog, save_file_dialog } from '../utils/dialog';
    import { open_dialog_bindings, save_existing_file } from "../utils/keybinds";
    import { change_language, current_lang, get_language_by_extension } from "../utils/language"; 

    interface Tab {
        id: string
        name: string
        path?: string
    }

    let active_tab_index = $state(0)
    let editors: Map<string, EditorView> = $state(new Map)
    let tabs: Tab[] = $state([])
    let untitled = $state(0)
    const language_compartment: Compartment = new Compartment();
    const theme_compartment: Compartment = new Compartment();
    let unsubscribe_lang: Unsubscriber;
    let unsubscribe_file: Unsubscriber;

    function create_editor(id: string){
        const parent_element = document.getElementById(`editor-${id}`)
        if (!parent_element){
            console.error("Parent element doesnt exist")
        }
        const editor = new EditorView({
            state: EditorState.create({
                doc: '',
                extensions: [
                    basicSetup,
                    language_compartment.of([]),
                    theme_compartment.of(oneDark),
                ]
            }),
            parent: document.getElementById(`editor-${id}`)!
        })
        editors.set(id, editor)
    }

    async function create_tab(){
        const new_tab: Tab = {
            id: crypto.randomUUID(),
            name: `untitled-${untitled}`
        }
        untitled++
        tabs.push(new_tab)
        await tick()
        create_editor(new_tab.id)
        set_active_tab(new_tab)
    }

    function set_active_tab(tab: Tab){
        const index = tabs.findIndex((t) => t.id === tab.id)
        if (index !== -1){
            active_tab_index = index
        }else{
            console.log("Tab not found: ", tab)
        }
    }

    function close_tab(tab: Tab) {
    const index = tabs.findIndex((t) => t.id === tab.id)
    if (index === -1) {
        console.error("Tab not found:", tab)
        return;
    }
    tabs.splice(index, 1)
    tabs = [...tabs]
    if (tabs.length === 0) {
        create_tab()
        return;
    }
    
    if (index === active_tab_index) {
        active_tab_index = Math.min(index, tabs.length - 1)
    } else if (index < active_tab_index) {
        active_tab_index--
    }
    const editor = editors.get(tab.id)
    if (editor) {
        editor.destroy()
    }
    editors.delete(tab.id)
}



    onMount(() => {
        create_tab()

        unsubscribe_lang = current_lang.subscribe(async (lang) => {
            const editor = editors.get(tabs[active_tab_index].id)
            if (lang) {
                let lang_func: Extension | null = await change_language(lang);
                if (lang_func && editor) {
                    editor.dispatch({
                        effects: language_compartment.reconfigure(lang_func)
                    });
                }
            }
        });

        unsubscribe_file = current_file_path.subscribe(async (file_path) => {
            console.log("path updated to: ", file_path);
            const editor = editors.get(tabs[active_tab_index].id)
            if (file_path) {
                const filename = await path.basename(file_path)
                console.log(filename)
                const text = await read_file(file_path as string);
                current_lang.set(get_language_by_extension(file_path))
                if (filename){
                    tabs[active_tab_index].name  = filename
                    tabs[active_tab_index].path = file_path
                    }
                if (text && editor) {
                    editor.dispatch({
                        changes: { from: 0, to: editor.state.doc.length, insert: text }
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
            let file_path: string | null = get(current_file_path)
            const editor = editors.get(tabs[active_tab_index].id)
            if (file_path && editor) {
                write_file(file_path as string, editor.state.doc.toString());
            } else {
                file_path = await save_file_dialog();
                if (file_path && editor) {
                    write_file(file_path as string, editor.state.doc.toString());
                    current_file_path.set(file_path);
                }
            }
        };
        save_existing_file(save_file);

        return () => {
            if (editors){
                editors.forEach((editor) => {
                    editor.destroy()
                })
            }
        }
    })    
</script>

<div class="tab-bar">
    {#each tabs as tab}
    <div class="tab-container">
        <button onclick={() => set_active_tab(tab)} class={`tab ${active_tab_index === tabs.indexOf(tab) ? "active" : ""}`} id={`tab-${tab.id}`}>{tab.name}</button>
        <button class="close-tabs" onclick={() => close_tab(tab)}>x</button>
    </div>
    {/each}
    <button onclick={() => create_tab()} class="tab-bar">+</button>
</div>

{#each tabs as tab (tab.id)}
        <div class={`editor ${active_tab_index === tabs.indexOf(tab) ? "active": ""}`} id={`editor-${tab.id}`}></div>
{/each}