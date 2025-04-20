<script lang="ts">
    import Die from "$lib/Die.svelte";
    import {Interval} from "$lib/Timer";
    import {onMount} from "svelte";
    import Swatches from "$lib/Swatches.svelte";

    // Dice Setup
    let die1: Die, die2: Die;
    let dice: DieValue[] = $state([0, 0] as unknown as DieValue[]);
    let total = $state(0), sevens = $state(0);
    let deckType = $state("Balanced");
    let Deck: DieValue[][] = $derived(createDeck(deckType));

    // Timer Setup
    const CONFIG = $state({ turn: 5, });    // Why is this here?
    let turnTime = $state(CONFIG.turn), turnCount = $state(0);
    let interval = new Interval(CONFIG.turn * 1000, turn, 1500);
    let wakeLock: WakeLockSentinel | null = null;

    // Elements
    let audio: HTMLAudioElement;
    let progressBar: HTMLDivElement;
    let progressAnimation: Animation;
    let diceTotal: HTMLElement;
    let showTooltip = $state(false);
    let revealLog = $state(false);


    function wakeLockRequest() {
        try {
            if ("wakeLock" in navigator) {
                navigator.wakeLock.request("screen").then((lock) => {
                    wakeLock = lock;
                });
                console.log("Wake lock acquired");
            } else {
                console.log("Wave lock not available");
            }
        } catch (error) {
            console.error("Wake lock request failed:", error);
        }
    }

    function wakeLockRelease() {
        if (wakeLock) {
            wakeLock.release().then(() => {
                wakeLock = null;
            });
        }
    }

    // Progress Bar
    onMount(() => {
        progressAnimation = progressBar.animate(
            [{width: "0"}, {width: "100%"}],
            {duration: CONFIG.turn * 1000, iterations: Infinity},
        );
        progressAnimation.pause();
    });

    function createDeck(type: string) {
        let deck = [];
        const randDie = () => ((Math.random() * 6 + 1) | 0)
        switch (type) {
            case "Chaos":
                deck.push([randDie(), randDie()]);
                break;
            case "Balanced":
                // Create deck, shuffle, then select only first 24
                for (let i = 1; i <= 6; i++)
                    for (let j = 1; j <= 6; j++)
                        deck.push([i, j]);
                deck.sort(() => Math.random() - 0.5);
                deck.splice(24);
                break;
            case "Double Deck":
                for (let i = 1; i <= 6; i++)
                    for (let j = 1; j <= 6; j++)
                        deck.push([i, j], [i, j])
                deck.sort(() => Math.random() - 0.5);
                break;
            case "Deck":
                for (let i = 1; i <= 6; i++)
                    for (let j = 1; j <= 6; j++)
                        deck.push([i, j])
                break;
        }
        console.log("Deck created:", type);
        return deck as DieValue[][];
    }

    const deckLog: DieValue[][] = $state([]);

    // // Effect: create deck on FAIR_DICE change
    // $effect(() => {
    //     console.log("FAIR_DICE changed to", FAIR_DICE);
    //     if (FAIR_DICE) {
    //         createDeck();
    //     }
    // });

    async function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function rollDice() {
        if (Deck.length === 0) Deck = createDeck(deckType);

        dice = Deck.pop()!;
        die1.rollDie(dice[0]);
        die2.rollDie(dice[1]);
        deckLog.push(dice);

        total = "--" as unknown as number;      // Adds some suspense
        progressAnimation.pause();
        await sleep(die1.ROLL_TIME);

        total = dice[0] + dice[1];
        if (dice[0] + dice[1] == 7) {
            diceTotal.style.backgroundColor = colors[sevens++ % colors.length];
            diceTotal.style.opacity = "0.8";
            diceTotal.style.color = "white";
            stopTimer();
        }

        if (timer) progressAnimation.play();
        if (turnCount === 1 && timer) startTimer();
    }

    let colors = $state(["red", "blue", "green"]);

    let timer = $state(false);

    function startTimer() {
        timer = true;
        if (turnCount === 0) {
            turn();
            return;
        }

        diceTotal.style = "";
        progressAnimation.play();
        wakeLockRequest();
        interval.start();
    }

    function stopTimer() {
        timer = false;
        interval.pause();
        wakeLockRelease();
        progressAnimation.pause();
    }

    function turn() {
        audio.play();
        rollDice();

        turnCount++;
        CONFIG.turn = turnTime;
        interval.setTime(CONFIG.turn * 1000);

        progressAnimation.cancel();
        progressAnimation.playbackRate = 5 / CONFIG.turn; // 5 is the default turn time
    }

    function skipTurn() {
        interval.pause();
        interval.reset();
        startTimer();
        turn();
    }
</script>

<audio src="ding.mp3" bind:this={audio}></audio>

<main class="flex flex-col items-center min-h-full gap-3">
    <h1 class="text-3xl mt-6 font-mono font-bold">REAL TIME CATAN</h1>
    <a
        class="text-gray-500 hover:underline"
        href="https://www.capinski.dev"
    >
        by Theodore Capinski
    </a>

    <div
            id="turnCount"
            class="w-24 text-center bg-white border border-gray-300 shadow-lg rounded-lg p-4"
    >
        Turn: <strong>{turnCount}</strong>
    </div>

    <div
            class="bg-white border border-gray-300 shadow-lg rounded-lg flex flex-col items-center"
    >
        <div class="flex gap-3">
            <Die bind:this={die1}/>
            <Die bind:this={die2}/>
        </div>
        <div
                id="diceTotal"
                bind:this={diceTotal}
                class="w-16 text-center bg-white border border-gray-300 shadow-lg rounded-lg p-4 text-2xl"
        >
            {total}
        </div>
        <div
                bind:this={progressBar}
                class="p-1 bg-blue-600 rounded-lg m-2"
        ></div>
    </div>

    <div
            id="buttons"
            class={`${timer ? "scale-125" : ""} transition duration-300`}
    >
        <button
                class={`w-24 p-4 text-center font-bold active:scale-90 hover:brightness-90 border border-gray-300 shadow-lg rounded-lg transition duration-200 ${timer ? "bg-red-100" : "bg-white"}`}
                onclick={() => (timer ? stopTimer() : startTimer())}
        >
            {timer ? "Stop" : "Start"}
        </button>

        <button
                class={`w-24 p-4 text-center font-bold active:scale-90 hover:brightness-90 border border-gray-300 shadow-lg rounded-lg transition duration-200 ${timer ? "bg-green-100" : "bg-white"}`}
                onclick={skipTurn}
        >
            Skip >>
        </button>
    </div>

    <div
            id="config"
            class="grid grid-cols-2 gap-3 w-72 items-center bg-white border border-gray-300 shadow-lg rounded-lg p-4"
    >
        <label for="playerOrder" class="text-lg">Player Order</label>
        <Swatches bind:colors/>

        <label for="fairDice" class="text-lg">Fair Dice</label>
        <div class="flex items-center">
            <select id="fairDice"
                    bind:value={deckType}
                    class="border border-gray-300 rounded-lg p-1 -ml-1 text-lg focus:outline-none transition duration-200"
            >
                {#each ["Chaos", "Dice Deck", "Balanced", "Double Deck"] as option}
                    <option value={option}>
                        {option}
                    </option>
                {/each}
            </select>
            <div class="relative ml-3">
                <button
                        class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 focus:outline-none transition duration-100"
                        aria-label="Dice Explanation"
                        onclick={() => showTooltip = !showTooltip}
                        onblur={() => showTooltip = false}
                >?</button>
                {#if showTooltip}
                    <div class="absolute bottom-9 right-0 bg-white border border-gray-300 shadow-lg rounded-lg p-4 w-64 z-10">
                        <strong> Chaos </strong> <span>Each roll is completely random</span> <br>
                        <strong> Dice Deck </strong> <span>Uses a deck of all possible rolls (36)</span> <br>
                        <strong> Balanced </strong> <span>Uses a deck, but resets after (24) <a
                                class="text-blue-500 hover:underline"
                                href="https://blog.colonist.io/designing-balanced-dice/"
                                ontouchend  = { () => window.open("https://blog.colonist.io/designing-balanced-dice/", "_blank")}
                                onmousedown = { () => window.open("https://blog.colonist.io/designing-balanced-dice/", "_blank")}
                        >to mix it up</a></span> <br>
                        <strong> Double Deck </strong> <span>Combines two decks (72) for an even spread over an average game</span>
                    </div>
                {/if}
            </div>
        </div>

        <label for="turn" class="text-lg">Turn Time</label>
        <input
                type="number"
                step="5"
                bind:value={turnTime}
                id="turn"
                class="border border-gray-300 rounded-lg p-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
    </div>

    <div id="deckLog" class="bg-white border border-gray-300 shadow-lg rounded-lg p-4">
        Reveal Log: &nbsp;
        <input
                type="checkbox"
                bind:checked={revealLog}
                class="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />

        {#if revealLog}
            {#each deckLog.toReversed() as [d1, d2], i}
                <div class="flex gap-3">
                    <strong>{deckLog.length - i}.</strong>
                    {d1 + d2} &nbsp;&nbsp; [{d1}, {d2}]
                </div>
            {/each}
        {/if}
    </div>
</main>