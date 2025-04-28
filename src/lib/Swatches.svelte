<script lang="ts">

    import {onMount} from "svelte";

    let { colors = $bindable(["red", "blue", "green"]) } = $props();
    let activeSwatch = $state(-1); // -1 means no active swatch
    const availableColors = ["red", "green", "blue", "white", "yellow", "saddlebrown", "purple", "orange"];

    onMount(() => {
        // Load player colors from local storage
        const storedColors = localStorage.getItem('playerColors');
        if (storedColors) colors = JSON.parse(storedColors);

        $effect(() => {
            // On color change, store the colors in local storage
            localStorage.setItem('playerColors', JSON.stringify(colors));
        })
    });

</script>

<div id="playerOrder" class="flex flex-wrap gap-2 items-center">
    {#each colors as color, i}
        <button
                hidden
                aria-label="Edit player"
                title="Edit player"
                id="playerSwatch{i}"
                onclick={() => {
                            activeSwatch = activeSwatch === i ? -1 : i;
                            if (activeSwatch !== -1) {
                                setTimeout(() => {
                                    document.getElementById(`playerPicker${i}`)?.focus();
                                }, 0);
                            }
                        }}
        >

        </button>
        <label
                style="background-color: {color};"
                class="w-8 h-8 rounded-full border border-gray-300 cursor-pointer relative"
                for="playerSwatch{i}">
            {#if activeSwatch === i}
                <div
                        class="relative top-full left-0 mt-1 bg-white shadow-lg rounded p-2 z-10 flex flex-wrap gap-1 focus:outline-none cursor-default"
                        style="width: 120px;"
                        tabindex="-1"
                        id="playerPicker{i}"
                        onblur={() => activeSwatch = -1}
                >
                    {#each availableColors as c}
                        <button
                                class="w-6 h-6 rounded-full cursor-pointer border border-gray-300"
                                style="background-color: {c};"
                                aria-label="Select {c}"
                                title="Select {c}"
                                onmousedown={() => {colors[i] = c;
                                activeSwatch = -1;
                            }}
                        ></button>
                    {/each}
                    <button
                            class={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-red-500 ${colors.length <= 3 ? 'text-gray-600 opacity-50 !cursor-not-allowed' : ''} cursor-pointer`}
                            aria-label="Remove player"
                            title="Remove player"
                            onmousedown={() => {
                            if (colors.length > 3) {
                                colors = colors.filter((_, index) => index !== i);
                                activeSwatch = -1;
                            }
                        }}
                    >
                        <span>✕</span>
                    </button>
                </div>
            {/if}
        </label>
    {/each}

    {#if colors.length < 6}
        <button
                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer bg-gray-100"
                aria-label="Add player"
                title="Add player"
                onclick={() => {
                const unused = availableColors.find(c => !colors.includes(c)) || "gray";
                colors = [...colors, unused];
            }}
        >
            <span>+</span>
        </button>
    {/if}
</div>