<script lang="ts">
    import { tabs } from "$lib/ui/tabs.svelte";
</script>


{#if tabs.length === 0}
    <div id="landing-page">
        <h1>
            Welcome to Algira
        </h1>
        <p>press ctrl+k ctrl+o to open a folder </p>
        <p>press ctrl+n to open a new editor</p>
        <p>press ctrl+o to open an existing file</p>
    </div>
{/if}