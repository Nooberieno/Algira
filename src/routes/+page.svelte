<script>
  import AlgiraEditor from '$lib/Editor.svelte'
  import { invoke } from '@tauri-apps/api/core';
  import '../style/style.css'
</script>

<main>
  <AlgiraEditor />
</main>

<style>
  main{
    padding: none;
    max-width: 800 px;
    margin: 0 auto;
  }
</style>