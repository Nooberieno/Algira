<script lang="ts">
    import LangChange from "./sidebar/Lang-Change.svelte"
    import Directory from "./sidebar/Directory.svelte"
    import '../style/sidebar/general.css'
    import type { Component } from "svelte";

    let SidebarContent = $state<Component>()

    function toggle_sidebar(){
        const sidebar = document.querySelector(".sidebar")
        sidebar?.classList.toggle("expanded")
    }

</script>

<div class="sidebar">
  <div class="sidebar-buttons">
    <div class="sidebar-buttons-top">
      <button class="sidebar-button" onclick={toggle_sidebar}>&#xea83;</button>
      <button class="sidebar-button" onclick={toggle_sidebar}>&#xea68;</button>
      <button class="sidebar-button" onclick={toggle_sidebar}>&#xeae6;</button>
      <button class="sidebar-button" onclick={toggle_sidebar}>&#xebdc;</button>
      <button class="sidebar-button" onclick={() => {toggle_sidebar(); SidebarContent = LangChange}}>&#xf100d</button>
    </div>
    <div class="sidebar-buttons-top">
      <button class="sidebar-button down" onclick={toggle_sidebar}>&#xea85</button>
      <button class="sidebar-button down" onclick={toggle_sidebar}>&#xf2be</button>
      <button class="sidebar-button down" onclick={toggle_sidebar}>&#xeb51</button>
    </div>
  </div>
  <div class="sidebar-item-content">
      <SidebarContent />
  </div>
</div>