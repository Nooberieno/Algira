<script lang="ts">
    import "../styles/cm-styles.css"

    import type { Tab } from "../lib/tabs";

    import { onMount } from "svelte";
    import { EditorState } from "@codemirror/state";
    import { EditorView} from "codemirror";
    import { basicSetup } from "codemirror";
    import { oneDark } from "@codemirror/theme-one-dark";
</script>
