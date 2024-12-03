<script lang="ts">
    import { change_language, current_lang } from "../../utils/language";
    import "../../style/sidebar/content.css"

    function update_lang_extension(new_lang: string){
        current_lang.set(new_lang)
    }
</script>

<div id="content-container">
    <button class="content-button" onclick={() => update_lang_extension("python")}>Python</button>
    <button class="content-button" onclick={() => update_lang_extension("javascript")}>Javascript</button>
    <button class="content-button" onclick={() => update_lang_extension("rust")}>Rust</button>
    <button class="content-button" onclick={() => update_lang_extension("css")}>CSS</button>
    <button class="content-button" onclick={() => update_lang_extension("html")}>HTML</button>
    <button class="content-button" onclick={() => update_lang_extension("C++")}>C++</button>
    <button class="content-button" onclick={() => update_lang_extension("markdown")}>Markdown</button>
    <button class="content-button" onclick={() => update_lang_extension("typescript")}>Typescript</button>
    <button class="content-button" onclick={() => update_lang_extension("jsx")}>jsx</button>


</div>