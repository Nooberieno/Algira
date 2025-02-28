<script lang="ts">
  import "../styles/main.css"

  import { onMount } from "svelte";

  import Editor from "../components/Editor.svelte";
  import TabBar from "../components/TabBar.svelte";
  import TabContent from "../components/TabContent.svelte";

  import "../lib/keybindings/algira-keybinds.svelte"
  import { create_tab } from "../lib/ui/tabs.svelte";
  import { setup_keymap_listener } from "../lib/keybindings/keymap.svelte";

  create_tab(Editor)

  onMount(() => {
    setup_keymap_listener()
  })
</script>

<main class="container">
  <TabBar></TabBar>
  <TabContent></TabContent>
</main>
