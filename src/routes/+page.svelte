<script>
  import AlgiraEditor from '$lib/Editor.svelte'
  import '../style/style.css'
</script>

<main>
  <div class="test"> je moeder</div>
  <div id="editor">
    <AlgiraEditor />
  </div>
</main>

<style>
  main{
    display: flex;
    padding: none;
    max-width: 100%;
    height: 100%;
  }
</style>