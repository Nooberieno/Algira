<script lang="ts">
  import "../styles/sidebar/sidebar.css"

  import type { Unsubscriber } from "svelte/store";

  import { onMount, tick, type Component } from "svelte";

  import Directory from "./sidebar/Directory/Directory.svelte";

  import { toggle_terminal_simple } from '$lib/ui/terminal.svelte';
  import { working_directory } from "$lib/ui/directory.svelte";

  let SidebarContent = $state<Component>()
  let unsub_working_dir: Unsubscriber

  async function toggle_sidebar(component: Component){
    const sidebar = document.querySelector(".sidebar")
    const container = document.querySelector(".container")
    const is_expanded = sidebar?.classList.contains("expanded")

    if (SidebarContent === component){
        if(is_expanded){
        sidebar?.classList.remove("expanded")
        container?.classList.remove("sidebar-expanded")
        await new Promise(r => setTimeout(r, 300))
        SidebarContent = undefined
        }else{
        sidebar?.classList.add("expanded")
        container?.classList.add("sidebar-expanded")
        }
    }else{
        sidebar?.classList.add("expanded")
        container?.classList.add("sidebar-expanded")
        SidebarContent = component
    }
    await new Promise(r => setTimeout(() => window.dispatchEvent(new Event("resize")), 300))
  }

  onMount(() => {
    unsub_working_dir = working_directory.subscribe((folder) => {
      if(folder === undefined) return
      if(document.querySelector(".sidebar")?.classList.contains("expanded")) return
      toggle_sidebar(Directory)
    })

    return () => {
      unsub_working_dir()
    } 
  })
  
  </script>
  
  <div class="sidebar">
    <div class="sidebar-buttons">
      <div class="sidebar-buttons-top">
        <button class="sidebar-button" onclick={() => {toggle_sidebar(Directory)}}>&#xea83;</button>
      </div>
      <div class="sidebar-buttons-top">
        <button class="sidebar-button down" onclick={toggle_terminal_simple}>&#xea85</button>
      </div>
    </div>
    <div class="sidebar-item-content">
        <SidebarContent />
    </div>
  </div>