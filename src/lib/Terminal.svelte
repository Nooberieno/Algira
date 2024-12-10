<script lang="ts">
    import "../style/terminal.css"

    let input = $state("")
    let output = $state("")

    async function execute_command(){
        output += `Your input was ${input} \n`
        input = ""
    }

    $effect(() => {
        const terminal = document.getElementById('terminal-output')
        if (terminal){
            terminal.scrollTop = terminal.scrollHeight
        }
    })
</script>

<div class="terminal">
    <div id="terminal-ouput" class="output">{output}</div>
    <div class="input-line">
        <span class="prompt">$</span>
        <input
        type="text"
        bind:value={input}
        onkeydown={(e) => e.key === "Enter" && execute_command()}
        placeholder = "Enter command"
        />
    </div>
</div>