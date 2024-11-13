<script>
  import AlgiraEditor from '$lib/Editor.svelte'
  import { invoke } from '@tauri-apps/api/core';
</script>

<main>
  <AlgiraEditor />
</main>

<style>
  main{
    padding: 1em;
    max-width: 800 px;
    margin: 0 auto;
  }
</style>