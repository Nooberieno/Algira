<script>
  import AlgiraEditor from '$lib/Editor.svelte'
  import '../style/style.css'

  function toggle_sidebar(){
    const sidebar = document.querySelector(".sidebar")
    sidebar?.classList.toggle("expanded")
  }
</script>

<main>
  <div class="sidebar">
    <div class="sidebar-button">yooo
      <button onclick={toggle_sidebar}>toggle</button>
    </div>
    <div class="sidebar-item-content">git content i guess</div>
  </div>
  <div id="editor">
    <AlgiraEditor />
  </div>
</main>

<style>
  main{
    font-family: "Hack Nerd Font" monospace;
    position: absolute;
    display: flex;
    padding: none;
    max-width: 100%;
    height: 100%;
    width: 100%;
    flex-direction: row;
  }
</style>