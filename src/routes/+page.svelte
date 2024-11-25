<script>
  import AlgiraEditor from '$lib/Editor.svelte'
  import Sidebar from '$lib/Sidebar.svelte'
  import '../style/style.css'
</script>

<main>
  <Sidebar />
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