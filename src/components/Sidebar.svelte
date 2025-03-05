<script lang="ts">
    import "../styles/sidebar/sidebar.css"
    
    import type { Component } from "svelte";

    import Directory from "./sidebar/Directory.svelte";

    import { toggle_terminal_simple } from '$lib/ui/terminal.svelte';
  
    let SidebarContent = $state<Component>()

    async function toggle_sidebar(component: Component){
    const sidebar = document.querySelector(".sidebar")
    const is_expanded = sidebar?.classList.contains("expanded")

    if (SidebarContent === component){
        if(is_expanded){
        sidebar?.classList.remove("expanded")
        await new Promise(r => setTimeout(r, 300))
        SidebarContent = undefined
        }else{
        sidebar?.classList.add("expanded")
        }
    }else{
        sidebar?.classList.add("expanded")
        SidebarContent = component
    }
    }
  
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