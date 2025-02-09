import { writable } from "svelte/store";
import type { Component } from "svelte";
import { active_extensions } from "./cm-extensions.svelte";

export interface Tab {
    id: string,
    title: string,
    path?: string,
    language?: string,
    element: Component
}

export const tabs: Tab[] = $state([])

export const active_id = writable<string>()

export function setActiveTab(tabId: string) {
    active_id.set(tabId);
}

export function closeTab(tab_id: string) {
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

export function createTab(tab_element: any) {
    const new_tab = {
        id: crypto.randomUUID(),
        title: `Untitled`,
        element: tab_element,
    };
    tabs.push(new_tab)
    active_id.set(new_tab.id);
}