<script lang="ts">
    import Die from "$lib/Die.svelte";
    import {Interval, Timer} from "$lib/Timer";
    import {onMount} from "svelte";
    import Swatches from "$lib/Swatches.svelte";
    import Audio from "$lib/Audio.svelte";
    import SoundSwitch from "$lib/SoundSwitch.svelte";

    // Dice Setup
    let die1: Die, die2: Die;
    let dice: DieValue[] = $state([0, 0] as unknown as DieValue[]);
    let total = $state(0), sevens = $state(0);
    let deckType = $state("Balanced");
    let Deck: DieValue[][] = $derived(createDeck(deckType));

    // Timer Setup
    const CONFIG = $state({turn: 5,});    // Why is this here?
    let turnTime = $state(CONFIG.turn), turnCount = $state(0);
    let wakeLock: WakeLockSentinel | null = null;
    let interval = new Interval(CONFIG.turn * 1000, turn, 1500);
    let soundTimer: Timer;

    // Elements
    let audio: Audio;
    let progressBar: HTMLDivElement;
    let progressAnimation: Animation;
    let diceTotal: HTMLElement;
    let showTooltip = $state(false);
    let revealLog = $state(false);

    function wakeLockRequest() { // TODO test on mobile
        try {
            if ("wakeLock" in navigator) {
                navigator.wakeLock.request("screen").then((lock) => {
                    wakeLock = lock;
                });
                // console.log("Wake lock (allegedly) acquired");
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
        window.addEventListener("keydown", handleKeydown);

        soundTimer = new Timer(CONFIG.turn * 1000 - 4990, audio.playBuildUp);
        interval.on("pause", () => {
            audio.pauseBuildUp()
        })
        interval.on("resume", () => {
            interval.getTimeRemaining() < 5000 && audio.playBuildUp()
        }) // Resumes the sound only if it should be playing
    });

    function createDeck(type: string) {
        let deck = [];
        const randDie = () => ((Math.random() * 6 + 1) | 0)
        switch (type) {
            case "Chaos":
                deck.push([randDie(), randDie()]);
                break;
            case "Balanced":
                // Create the deck, shuffle, then select only the first 24
                for (let i = 1; i <= 6; i++)
                    for (let j = 1; j <= 6; j++)
                        deck.push([i, j]);
                shuffle(deck);
                deck.splice(24);
                break;
            case "Double Deck":
                for (let i = 1; i <= 6; i++)
                    for (let j = 1; j <= 6; j++)
                        deck.push([i, j], [i, j])
                shuffle(deck)
                break;
            case "Deck":
                for (let i = 1; i <= 6; i++)
                    for (let j = 1; j <= 6; j++)
                        deck.push([i, j])
                break;
        }
        return deck as DieValue[][];
    }

    function shuffle<T>(array: T[]): T[] {
        // https://bost.ocks.org/mike/shuffle/

        let m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }



    const deckLog: DieValue[][] = $state([]);

    async function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function rollDice() {
        if (Deck.length === 0) Deck = createDeck(deckType);

        dice = Deck.pop()!;
        die1.rollDie(dice[0]);
        die2.rollDie(dice[1]);
        deckLog.push(dice);

        total = "--" as unknown as number;                   // Adds some suspense
        progressAnimation.pause();
        await sleep(die1.ROLL_TIME - 5);                     // Needs to catch a 7 during the delay or everything breaks i guess
        if (CONFIG.turn >= 5 && timer) soundTimer.start();   // Build up only plays if there is at least 5 seconds
        audio.stopBuildUp();

        total = dice[0] + dice[1];
        if (dice[0] + dice[1] == 7) {
            diceTotal.style.backgroundColor = colors[sevens++ % colors.length];
            diceTotal.style.opacity = "0.8";
            diceTotal.style.color = "white";
            if (timer) stopTimer();
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
        if (turnCount != 1) soundTimer.start();
        interval.start();

        diceTotal.style = "";
        if (interval.isRunning()) progressAnimation.play();
        wakeLockRequest();
    }

    function stopTimer() {
        timer = false;
        interval.pause();
        if (soundTimer.isRunning()) soundTimer.pause();
        wakeLockRelease();
        progressAnimation.pause();
    }

    function turn() {
        if (turnCount !== 0) audio.playSound()
        rollDice();

        turnCount++;
        CONFIG.turn = turnTime;
        interval.setInitialTime(CONFIG.turn * 1000);
        interval.setTime(CONFIG.turn * 1000);
        soundTimer.setInitialTime(CONFIG.turn * 1000 - 4990);
        soundTimer.setTime(CONFIG.turn * 1000 - 4990);

        progressAnimation.cancel();
        progressAnimation.playbackRate = 5 / CONFIG.turn; // 5 is the default turn time
    }

    function skipTurn() {
        if (!interval.isRunning()) startTimer();
        interval.setTime(5);
        if (soundTimer.isRunning()) soundTimer.pause();
        soundTimer.reset();
        audio.stopBuildUp();
    }

    // If the space bar is pressed, toggle the timer
    function handleKeydown(event: KeyboardEvent) {
        if (event.code === "Space") {
            event.preventDefault();
            timer ? stopTimer() : startTimer();
        }
    }
</script>

<Audio bind:this={audio}/>

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
        <pre id="debug"></pre>
    </div>

    <div
            id="buttons"
            class={`${timer ? "scale-125" : ""} transition duration-300`}
    >
        <button
                class={`w-24 p-4 text-center font-bold active:scale-90 hover:brightness-90 border border-gray-300 shadow-lg rounded-lg transition duration-200 ${timer ? "bg-red-100" : "bg-white"}`}
                onclick={() => (timer ? stopTimer() : startTimer())}
                title="Starts or pauses the timer"
        >
            {timer ? "Stop" : "Start"}
        </button>

        <button
                class={`w-24 p-4 text-center font-bold active:scale-90 hover:brightness-90 border border-gray-300 shadow-lg rounded-lg transition duration-200 ${timer ? "bg-green-100" : "bg-white"}`}
                onclick={skipTurn}
                title="Skips the waiting time and rolls the dice"
        >
            Next >>
        </button>
    </div>

    <div
            id="config"
            class="grid grid-cols-2 gap-3 w-72 items-center bg-white border border-gray-300 shadow-lg rounded-lg p-4"
    >
        <label for="playerOrder" class="text-lg cursor-help" title="Settlement Placement Order and Robber Order">Player Order</label>
        <Swatches bind:colors/>

        <label for="sounds" class="text-lg cursor-help" title="Sounds: Mute, Ding, or Drumroll with Build-up">Sounds</label>
        <SoundSwitch/>

        <label for="fairDice" class="text-lg cursor-help" title="The fair dice deck determines how random the rolls are">Fair Dice</label>
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

        <label for="turn" class="text-lg cursor-help" title="Strongly Recommended Turn Time: 30s">Turn Time</label>
        <input
                type="number"
                step="5"
                bind:value={turnTime}
                id="turn"
                class="border border-gray-300 rounded-lg p-2 text-lg h-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-center"
        />
    </div>

    <div
            id="config"
            class="flex flex-col gap-3 w-72 bg-white border border-gray-300 shadow-lg rounded-lg p-4"
    >
        <h2 class="text-xl w-full text-center">Description</h2>

        <details>
            <summary class="font-bold">Overview</summary>
            <p>
                This is a tool for playing Catan in real time.
                The concept is simple:
            </p><br>
            <ul class="list-disc list-inside">
                <li>There are no turns, the dice are rolled automatically</li>
                <li>Players can build and trade at any time, including ports</li>
                <li>The game ends immediately when someone reaches 10 points</li>
            </ul>
        </details>

        <details>
            <summary class="font-bold">Player Order & Robber</summary>
            <p>
                To begin, roll a real die for settlement placement order,
                then use the <strong>Player Order</strong> selector.
            </p><br>
            <ul class="list-disc list-inside">
                <li>The Robber rotates based on this starting player order</li>
                <li>On a 7, the game pauses; hit start again after the steal</li>
                <li>You still can lose half your cards. Trade fast!</li>
            </ul>
        </details>

        <details>
            <summary class="font-bold">Development Cards</summary>
            <p>
                You can also buy and use development cards as normal.
            </p><br>
            <ul class="list-disc list-inside">
                <li>Pause the game as needed, e.g. knights or monopoly</li>
                <li>Each person can only play one development card per roll</li>
                <li>Further, only one knight can be played (by anybody) per roll</li>
            </ul>
        </details>
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