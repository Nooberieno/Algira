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

    let SidebarContent = $state<Component>()

    function toggle_sidebar(){
        const sidebar = document.querySelector(".sidebar")
        sidebar?.classList.toggle("expanded")
        
    }

</script>

<div class="sidebar">
  <div class="sidebar-buttons">
    <div class="sidebar-buttons-top">
      <button class="sidebar-button" onclick={() => {toggle_sidebar(); SidebarContent = Directory}}>&#xea83;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(); SidebarContent = Git}}>&#xea68;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(); SidebarContent = Extension}}>&#xeae6;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(); SidebarContent = RunAndDebug}}>&#xebdc;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(); SidebarContent = LangChange}}>&#xf100d</button>
    </div>
    <div class="sidebar-buttons-top">
      <button class="sidebar-button down" onclick={() => {document.querySelector(".terminal")?.classList.toggle("expanded")}}>&#xea85</button>
      <button class="sidebar-button down" onclick={toggle_sidebar}>&#xf2be</button>
      <button class="sidebar-button down" onclick={toggle_sidebar}>&#xeb51</button>
    </div>
  </div>
  <div class="sidebar-item-content">
      <SidebarContent />
  </div>
</div>