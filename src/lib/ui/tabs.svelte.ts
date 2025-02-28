import type { Component } from "svelte";

import { writable, get } from "svelte/store";

import { active_extensions } from "../utils/cm-extensions.svelte";

export interface Tab {
    id: string,
    title: string,
    path?: string,
    language?: string,
    element: Component
}

export const tabs: Tab[] = $state([])

export const active_id = writable<string>()

export function set_active_tab(tab_id: string) {
    active_id.update(() => tab_id);
}

export function close_tab(tab_id: string) {
    const index = tabs.findIndex((t) => t.id === tab_id);
    if (index === -1) return tabs;
    tabs.splice(index, 1);
    delete active_extensions[tab_id]

    if (tabs.length > 0) {
        active_id.set(tabs[Math.min(index, tabs.length - 1)].id);
    } else {
        active_id.set("0");
    }
}

export function create_tab(tab_element: any) {
    const new_tab = {
        id: crypto.randomUUID(),
        title: `Untitled`,
        element: tab_element,
    };
    tabs.push(new_tab)
    active_id.set(new_tab.id);
}

export function tab_switcher(){
    console.log(get(active_id))
    if(tabs.length === 1) return
    else if(get(active_id) === tabs[tabs.length - 1].id){
        set_active_tab(tabs[0].id)
        return
    }else{
        const tab = tabs.find((t) => t.id === get(active_id))
        if(tab){
            const index = tabs.indexOf(tab)
            set_active_tab(tabs[index + 1].id)
        }
    }
}