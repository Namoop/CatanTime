<script lang="ts">
    import {onMount} from "svelte";

    let { deckType = $bindable("Balanced") } = $props();

    let showTooltip = $state(false);

    onMount(() => {
        // Load deck type from local storage
        const storedDeckType = localStorage.getItem('deckType');
        if (storedDeckType) deckType = JSON.parse(storedDeckType);

        $effect(() => {
            // On deck type change, store the deck type in local storage
            localStorage.setItem('deckType', JSON.stringify(deckType));
        });
    })
</script>

<div class="flex items-center relative">
    <select id="fairDice"
            bind:value={deckType}
            class="border border-gray-300 bg-gray-100 rounded-lg p-1 h-10 w-full text-lg focus:outline-none transition duration-200"
    >
        {#each ["Chaos", "Dice Deck", "Balanced", "Double Deck"] as option}
            <option value={option}>
                {option}
            </option>
        {/each}
    </select>
    <div class="absolute -right-14">
        <button
                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 focus:outline-none transition duration-100"
                aria-label="Dice Explanation"
                onclick={() => showTooltip = !showTooltip}
                onblur={() => showTooltip = false}
        >?
        </button>
        {#if showTooltip}
            <div class="absolute bottom-9 right-0 bg-white border border-gray-300 shadow-lg rounded-lg p-4 w-64 z-10">
                <strong> Chaos </strong> <span>Each roll is completely random</span> <br>
                <strong> Dice Deck </strong> <span>Uses a deck of all possible rolls (36)</span> <br>
                <strong> Balanced </strong> <span>Uses a deck, but resets after (24) <a
                    class="text-blue-500 hover:underline"
                    href="https://blog.colonist.io/designing-balanced-dice/"
                    ontouchend={ () => window.open("https://blog.colonist.io/designing-balanced-dice/", "_blank")}
                    onmousedown={ () => window.open("https://blog.colonist.io/designing-balanced-dice/", "_blank")}
            >to mix it up</a></span> <br>
                <strong> Double Deck </strong> <span>Combines two decks (72) for an even spread over an average game</span>
            </div>
        {/if}
    </div>
</div>