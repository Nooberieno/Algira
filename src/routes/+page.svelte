<script lang="ts">
  import "../styles/main.css"

  import { onMount, onDestroy } from "svelte";
  import { python } from "@codemirror/lang-python";

  import Editor from "../components/Editor.svelte";
  import TabBar from "../components/TabBar.svelte";
  import TabContent from "../components/TabContent.svelte";
  import Terminal from "../components/Terminal.svelte";

  import { create_tab } from "../lib/ui/tabs.svelte";
  import { setup_keymap_listener } from "../lib/keybindings/keymap.svelte";
  import { register_language } from "$lib/utils/lang.svelte";
  import { AlgiraKeymap } from "../lib/keybindings/algira-keybinds.svelte";
  import { AlgiraKeymapManager } from "../lib/keybindings/keymap.svelte";

  create_tab(Editor)
  register_language("py", "python", python())
  
  onMount(() => {
    setup_keymap_listener()
    AlgiraKeymapManager.register_keymap(AlgiraKeymap)
  })

  onDestroy(() => {
    AlgiraKeymapManager.unregister_keymap(AlgiraKeymap)
  })
</script>

<main class="container">
  <TabBar></TabBar>
  <TabContent></TabContent>
  <Terminal></Terminal>
</main>
