<script lang="ts">
  import "../styles/main.css"

  import { onMount } from "svelte";

  import Editor from "../components/Editor.svelte";
  import TabBar from "../components/TabBar.svelte";
  import TabContent from "../components/TabContent.svelte";
  import Terminal from "../components/Terminal.svelte";

  import "../lib/keybindings/algira-keybinds.svelte"
  import { create_tab } from "../lib/ui/tabs.svelte";
  import { setup_keymap_listener } from "../lib/keybindings/keymap.svelte";
  import { add_file_extension_with_language } from "$lib/utils/lang.svelte";

  create_tab(Editor)
  add_file_extension_with_language("py", "python")

  onMount(() => {
    setup_keymap_listener()
  })
</script>

<main class="container">
  <TabBar></TabBar>
  <TabContent></TabContent>
  <Terminal></Terminal>
</main>
