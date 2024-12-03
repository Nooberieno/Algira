<script lang="ts">
    import LangChange from "./sidebar/Lang-Change.svelte"

    import '../style/sidebar/general.css'

    let sidebar_content = $state("sidebar content")

    function change_sidebar_content(new_content: any){
      sidebar_content = new_content
    }
    function toggle_sidebar(){
        const sidebar = document.querySelector(".sidebar")
        sidebar?.classList.toggle("expanded")
    }
</script>

<div class="sidebar">
  <div class="sidebar-buttons">
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xea83;</button>
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xea68;</button>
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xeae6;</button>
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xebdc;</button>
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xf100d</button>
    <button class="sidebar-button down" onclick={toggle_sidebar}>&#xea85</button>
    <button class="sidebar-button down" onclick={toggle_sidebar}>&#xf2be</button>
    <button class="sidebar-button down" onclick={toggle_sidebar}>&#xeb51</button>
  </div>
  <div class="sidebar-item-content">
    {#if sidebar_content === "sidebar content"}
      <p>{sidebar_content}</p>
      <button onclick={() => change_sidebar_content("banaan")}>click me</button>
    {:else}
      <LangChange />
    {/if}
  </div>
</div>