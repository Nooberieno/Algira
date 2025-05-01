<script lang="ts">
  import "$lib/lsp/lsp.svelte"
  import "../styles/main.css"
  import "../styles/tooltips.css"

  import { onMount, onDestroy } from "svelte";
  import { python } from "@codemirror/lang-python"

  import TabBar from "../components/TabBar.svelte";
  import TabContent from "../components/TabContent.svelte";
  import Terminal from "../components/Terminal.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import Algira from "../components/Algira.svelte";
  import CommandPalette from "../components/CommandPalette.svelte";

  import { setup_keymap_listener } from "../lib/keybindings/keymap.svelte";
  import { register_language } from "$lib/utils/lang.svelte";
  import { AlgiraKeymap } from "../lib/keybindings/algira-keybinds.svelte";
  import { AlgiraKeymapManager } from "../lib/keybindings/keymap.svelte";

  register_language("py", "python", python())
  
  onMount(() => {
    setup_keymap_listener()
    AlgiraKeymapManager.register_keymap(AlgiraKeymap)
  })

  onDestroy(() => {
    AlgiraKeymapManager.unregister_keymap(AlgiraKeymap)
  })
</script>

<div class="app-container">
  <Sidebar></Sidebar>
  <main class="container">
    <Algira></Algira>
    <TabBar></TabBar>
    <TabContent></TabContent>
    <Terminal></Terminal>
  </main>
  <CommandPalette></CommandPalette>
</div>
