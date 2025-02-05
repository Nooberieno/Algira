import { writable } from "svelte/store";

export interface Tab {
    id: string,
    title: string,
    path?: string,
    language?: string,
    element: any
}

export const tabs = writable<Tab[]>([])

export const active_id = writable<string>()

export function setActiveTab(tabId: string) {
    active_id.set(tabId);
}

export function closeTab(tabId: string) {
    tabs.update((currentTabs) => {
        const index = currentTabs.findIndex((t) => t.id === tabId);
        if (index === -1) return currentTabs;

        const newTabs = [...currentTabs];
        newTabs.splice(index, 1);

        if (newTabs.length > 0) {
            active_id.set(newTabs[Math.min(index, newTabs.length - 1)].id);
        } else {
            active_id.set("0");
        }

        return newTabs;
    });
}

export function createTab(tab_element: any) {
    const newTab = {
        id: crypto.randomUUID(),
        title: `Untitled`,
        modified: false,
        element: tab_element,
    };
    tabs.update((t) => [...t, newTab]);
    active_id.set(newTab.id);
}