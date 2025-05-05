<script lang="ts">
    import { tabs } from "$lib/ui/tabs.svelte";
</script>


{#if tabs.length === 0}
    <div id="landing-page">
        <img alt="Algira's Logo" id="logo"/>
        <p class="gradient-text">press ctrl+k ctrl+o to open a folder </p>
        <p class="gradient-text">press ctrl+n to open a new editor</p>
        <p class="gradient-text">press ctrl+o to open an existing file</p>
    </div>
{/if}