<script lang="ts">
    //Style Sheet
    import "../../style/sidebar/directory.css";

    import { onMount } from "svelte";
    //Imported types
    import type { DirEntry } from "@tauri-apps/plugin-fs";
    //Imported utility functions/functionailty
    import { current_file_path, load_dir_structure } from "../../utils/filesystem";
    import { open_dir_dialog } from "../../utils/dialog";

    let path = $state('')
    let files = $state<DirEntry[]>()

    function handle_element_click(element: DirEntry) {
        const full_path = path + "/" + element.name
        console.log("Chosen path: ", full_path)
        if (element.isDirectory){
            load_dir_structure(full_path)
        }else{
            current_file_path.set(full_path)
        }
    }

    onMount(async() => {
        if(path && !files){
            files = await load_dir_structure(path)
        }else{
            let path_check = await open_dir_dialog()
            if (path_check) { path = path_check}
            files = await load_dir_structure(path)
        }
    })
</script>

<div class="file-explorer">
    {#if path}
    {#if  files}
        <h2>{path}</h2>
        <ul>
            {#each files as file}
              <button onclick={() => handle_element_click(file)}>
                {file.name} {file.isDirectory ? 'folder': 'file'}
              </button>  
            {/each}
        </ul>
    {/if}
    {/if}
</div>