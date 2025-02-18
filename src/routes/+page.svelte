<script lang="ts">
  import "../styles/main.css"
  import Editor from "../components/Editor.svelte";
  import TabBar from "../components/TabBar.svelte";
  import TabContent from "../components/TabContent.svelte";
  import { createTab } from "../lib/tabs.svelte";

  createTab(Editor)
</script>

<main class="container">
  <TabBar></TabBar>
  <TabContent></TabContent>
</main>
