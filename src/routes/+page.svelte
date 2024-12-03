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
