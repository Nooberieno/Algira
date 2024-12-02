<script lang="ts">

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
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xf2c0</button>
    <button class="sidebar-button" onclick={toggle_sidebar}>&#xeb51</button>
  </div>
  <div class="sidebar-item-content">sidebar content</div>
</div>