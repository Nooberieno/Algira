<script lang='ts'>
    //Style sheets
    import '../style/editor/cm_styles.css';
    import '../style/editor/tab.css'
    //Type Imports
    import type { Unsubscriber } from 'svelte/store';
    import type { Extension } from '@codemirror/state';
    //Library imports
    import { onMount, tick } from "svelte";
    import { get } from 'svelte/store';
    import { EditorState, Compartment } from "@codemirror/state";
    import { EditorView } from "codemirror";
    import { basicSetup } from "codemirror";
    import { oneDark } from '@codemirror/theme-one-dark';
    import { path } from '@tauri-apps/api'
    //Utility functionality
    import { read_file, write_file, current_file_path } from "../utils/filesystem";
    import { open_file_dialog, save_file_dialog } from '../utils/dialog';
    import { open_dialog_bindings, save_existing_file, tab_switch_bind } from "../utils/keybinds";
    import { change_language, current_lang, get_language_by_extension } from "../utils/language"; 
    import { tab_from_path } from '../utils/tab';

    interface Tab {
        id: string
        name: string
        modified: boolean
        saving?: boolean
        path?: string
    }

    //Custom extensions for CodeMirror editor
    const focus_tracker = EditorView.updateListener.of((update) => {
    let lastCursorPos: number | null = null;
    if (update.focusChanged) {
        if (update.view.hasFocus) {
            if (lastCursorPos !== null) {
                update.view.dispatch({
                    selection: { anchor: lastCursorPos },
                });
            }
        }
    }
    if (update.selectionSet) {
        lastCursorPos = update.state.selection.main.head;
    }
});

    let suppress_mod_notifer: boolean = false //Suppressor to make sure that opening a file doesnt count as modifying it
    const mod_notifier = EditorView.updateListener.of((update) => {
        if (update.docChanged && !suppress_mod_notifer){
            const tab = tabs[active_tab_index]
            if (tab && !tab.modified){
                tab.modified = true
                tabs = [...tabs]
            }
        }
    })

    //Variable declarations
    let active_tab_index = $state(0)
    let editors: Map<string, EditorView> = $state(new Map)
    let tabs: Tab[] = $state([])
    let untitled = $state(0)
    const language_compartment: Compartment = new Compartment();
    const theme_compartment: Compartment = new Compartment();
    let unsubscribe_lang: Unsubscriber;
    let unsubscribe_file: Unsubscriber;
    let unsubscribe_tab: Unsubscriber;

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
                    focus_tracker,
                    mod_notifier
                ]
            }),
            parent: document.getElementById(`editor-${id}`)!
        })
        editors.set(id, editor)
    }

    async function create_tab(){
        const new_tab: Tab = {
            id: crypto.randomUUID(),
            name: `untitled-${untitled}`,
            modified: false
        }
        untitled++
        tabs.push(new_tab)
        await tick()
        create_editor(new_tab.id)
        set_active_tab(new_tab)
    }

    async function set_active_tab(tab: Tab){
        const index = tabs.findIndex((t) => t.id === tab.id)
        if (index !== -1){
            active_tab_index = index
            if (tab.path === undefined){
                current_file_path.set(null)
            }else{
                current_file_path.set(tab.path)
            }
            await tick()
            const editor = editors.get(tab.id)
            if (editor){
                editor.focus()
            }else{
                console.log("Did not find editor")
            }
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
        set_active_tab(tabs[Math.min(index, tabs.length - 1)])
    } else if (index < active_tab_index) {
        const temp_index = active_tab_index - 1
        set_active_tab(tabs[temp_index])
    }
    const editor = editors.get(tab.id)
    if (editor) {
        editor.destroy()
    }
    editors.delete(tab.id)
}



    onMount(() => {
        create_tab()

        unsubscribe_tab = tab_from_path.subscribe(async (path) => {
            if (path === ""){
                return
            }else{
                const new_tab: Tab = {
                    id: crypto.randomUUID(),
                    name: "",
                    path: path,
                    modified: false
                }
                tabs.push(new_tab)
                await tick()
                create_editor(new_tab.id)
                set_active_tab(new_tab)
            }
        })

        unsubscribe_lang = current_lang.subscribe(async (lang) => {
            const editor = editors.get(tabs[active_tab_index].id)
            if (lang) {
                let lang_func: Extension | null = await change_language(lang);
                if (lang_func && editor) {
                    await tick()
                    editor.dispatch({
                        effects: language_compartment.reconfigure(lang_func)
                    });
                }
            }
        });

        unsubscribe_file = current_file_path.subscribe(async (file_path) => {
            console.log("path updated to: ", file_path);
            const active_tab: Tab = tabs[active_tab_index]
            const editor = editors.get(tabs[active_tab_index].id)
            if (file_path) {
                const filename = await path.basename(file_path)
                console.log(filename)
                const text = await read_file(file_path as string);
                current_lang.set(get_language_by_extension(file_path))
                if (filename !== active_tab.name && active_tab.path !== file_path){
                    tabs[active_tab_index].name  = filename
                    tabs[active_tab_index].path = file_path
                    if (text && editor) {
                        suppress_mod_notifer = true
                        editor.dispatch({
                            changes: { from: 0, to: editor.state.doc.length, insert: text }
                        });
                        suppress_mod_notifer = false
                    }
                }
            }
        });

        const open_file = async () => {
            const file_path = await open_file_dialog();
            if (file_path) {
                    const tab = tabs.find((t) => t.path === file_path)
                    if (tab){
                        set_active_tab(tab)
                    }else{
                        current_file_path.set(file_path);
                        tabs[active_tab_index].modified = false
                        tabs = [...tabs]
                    }
                }
        }
        open_dialog_bindings(open_file);

        const save_file = async () => {
            let file_path: string | null = get(current_file_path)
            const editor = editors.get(tabs[active_tab_index].id)
            if (file_path && editor) {
                tabs[active_tab_index].modified = false
                tabs[active_tab_index].saving = true
                tabs = [...tabs]
                await write_file(file_path as string, editor.state.doc.toString());
                setTimeout(() => {
                        tabs[active_tab_index].saving = false
                        tabs = [...tabs]                        
                    }, 500);
            } else {
                file_path = await save_file_dialog();
                if (file_path && editor) {
                    tabs[active_tab_index].modified = false
                    tabs[active_tab_index].saving = true
                    tabs = [...tabs]
                    await write_file(file_path as string, editor.state.doc.toString());
                    current_file_path.set(file_path)
                    setTimeout(() => {
                        tabs[active_tab_index].saving = false
                        tabs = [...tabs]                        
                    }, 500);
                }
            }
        };
        save_existing_file(save_file);

        const tab_keyboard = () => {
            if (tabs.length === 1){
                return
            }else if (active_tab_index === tabs.length - 1){
                set_active_tab(tabs[0])
                return
            }else{
                const temp_index = active_tab_index + 1
                set_active_tab(tabs[temp_index])
            }
        }
        tab_switch_bind(tab_keyboard)

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
    <div 
    class={`tab-container ${active_tab_index === tabs.indexOf(tab) ? "active" : ""}`} 
    role="button" 
    tabindex="0" 
    onclick={() => set_active_tab(tab)}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') set_active_tab(tab); }}>
        <span class={`tab ${active_tab_index === tabs.indexOf(tab) ? "active" : ""}`} id={`tab-${tab.id}`}>{tab.name}</span>
        <span class="tab-modified" id={`tabmodified-${tab.id}`}>
            {#if tab.modified}
                {"\uf06a"}
            {:else if tab.saving}
                {"\ueba4"}
            {:else}
                {""}
            {/if}
        </span>
        <button class="close-tab" onclick={(e) => { e.stopPropagation(); close_tab(tab); }}>x</button>
    </div>
    {/each}
    <button onclick={() => create_tab()} class="add-tab">+</button>
</div>

{#each tabs as tab (tab.id)}
        <div class={`editor ${active_tab_index === tabs.indexOf(tab) ? "active": ""}`} id={`editor-${tab.id}`}></div>
{/each}