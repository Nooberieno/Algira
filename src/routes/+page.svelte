<script>
  import AlgiraEditor from '$lib/Editor.svelte'
  import Sidebar from '$lib/Sidebar.svelte'
  import Terminal from '$lib/Terminal.svelte';
  import '../style/style.css'
</script>

<main>
  <Sidebar />
  <div class="container">
    <div id="editor">
      <AlgiraEditor />
    </div>
    <Terminal />
  </div>
</main>
