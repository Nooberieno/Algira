<script lang="ts">

    function toggle_sidebar(){
        const sidebar = document.querySelector(".sidebar")
        sidebar?.classList.toggle("expanded")
    }
</script>

<div class="sidebar">
    <div class="sidebar-button">yooo
      <button onclick={toggle_sidebar}>toggle</button>
    </div>
    <div class="sidebar-item-content">sidebar content</div>
  </div>