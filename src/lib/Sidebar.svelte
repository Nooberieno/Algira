<script lang="ts">
  // Style sheet
  import '../style/sidebar/general.css';
  import '../style/terminal.css'
  
  import type { Component } from "svelte";
  //Component imports that will dedicate the content of the sidebar based on what button is active
  import LangChange from "./sidebar/Lang-Change.svelte";
  import Directory from "./sidebar/Directory.svelte";
  import RunAndDebug from './sidebar/Run&Debug.svelte';
  import Extension from './sidebar/Extension.svelte';
  import Git from './sidebar/Git.svelte';
  import AlgiraUser from './sidebar/AlgiraUser.svelte';
  import AlgiraSettings from './sidebar/Settings.svelte'

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
      <button class="sidebar-button" onclick={() => {toggle_sidebar(Git)}}>&#xea68;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(Extension)}}>&#xeae6;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(RunAndDebug)}}>&#xebdc;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(LangChange)}}>&#xf100d</button>
    </div>
    <div class="sidebar-buttons-top">
      <button class="sidebar-button down" onclick={() => {document.querySelector(".terminal")?.classList.toggle("expanded")}}>&#xea85</button>
      <button class="sidebar-button down" onclick={() => toggle_sidebar(AlgiraUser)}>&#xf2be</button>
      <button class="sidebar-button down" onclick={() => toggle_sidebar(AlgiraSettings)}>&#xeb51</button>
    </div>
  </div>
  <div class="sidebar-item-content">
      <SidebarContent />
  </div>
</div>