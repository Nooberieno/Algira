<script lang="ts">
  import "../styles/main.css"
  import Editor from "../components/Editor.svelte";
  import TabBar from "../components/TabBar.svelte";
  import TabContent from "../components/TabContent.svelte";
  import { createTab } from "../lib/tabs.svelte";
  import { tabs } from "../lib/tabs.svelte";
  import { active_extensions } from "$lib/cm-extensions.svelte";
  import { python } from "@codemirror/lang-python";
  createTab(Editor)
  active_extensions[tabs[0].id] = [python()]
</script>

<main class="container">
  <TabBar></TabBar>
  <TabContent></TabContent>
</main>
