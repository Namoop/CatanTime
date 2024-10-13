<script lang="ts">
	import Die from "$lib/Die.svelte";
	import {Interval} from "$lib/Timer";

	let die1: Die, die2: Die;
	let dice: DieValue[] = $state([0, 0] as unknown as DieValue[]);
	let total = $state(0);
	let timeout = 0;
	let turnCount = $state(0);
	let FAIR_DICE = $state(true)
	const CONFIG = $state({
		fair: true,
		turn: 5,
	});
	let interval = new Interval(CONFIG.turn * 1000, turn);
	interval.setDelay(1500)
	let progressWidth = $state(0);
	let progressInterval = 0;


	let audio: HTMLAudioElement;
	let revealLog = $state(false);

	const deck: DieValue[][] = $state([]);
	function createDeck() {
		for (let i = 1; i <= 6; i++)
			for (let j = 1; j <= 6; j++)
				deck.push([i, j] as DieValue[]);
	}
	const deckLog: DieValue[][] = $state([]);

	function rollDice(){
		if (deck.length === 0)
			createDeck();

		audio.play();

		if (FAIR_DICE)
			dice = deck.splice(Math.random() * deck.length | 0, 1)[0];
		else
			dice = [Math.random() * 6 + 1 | 0, Math.random() * 6 + 1 | 0] as DieValue[];
		die1.rollDie(dice[0]);
		die2.rollDie(dice[1]);
		deckLog.push(dice);

		if (dice[0] + dice[1] == 7)
			stopTimer();

		total = "--" as unknown as number;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			total = dice[0] + dice[1];
		}, die1.ROLL_TIME);
	}

	let timer = $state(false);
	function startTimer(){
		timer = true;
		interval.start()

		progressInterval = setInterval(() => {
			progressWidth = (1- interval.getTimeRemaining() / interval.getInitialTime()) * 100
		}, 10);
	}

	function stopTimer(){
		timer = false;
		interval.pause();
		clearTimeout(timeout);
		clearInterval(progressInterval);
	}

	function turn () {
		rollDice();
		turnCount++;
		interval.setTime(CONFIG.turn * 1000);
	}

	function skipTurn(){
		interval.pause()
		interval.reset()
		startTimer()
		turn();
	}

</script>

<audio src="/tap.mp3" bind:this={audio}></audio>

<main class="flex flex-col items-center gap-3 h-lvh bg-gray-200">

	<h1 class="text-3xl m-6 font-mono font-bold">REAL TIME CATAN</h1>

	<div id="turnCount" class="w-24 text-center bg-white border border-gray-300 shadow-lg rounded-lg p-4">
		Turn: <strong>{turnCount}</strong>
	</div>

	<div class="bg-white border border-gray-300 shadow-lg rounded-lg flex flex-col items-center">
		<div class="flex gap-3">
			<Die bind:this={die1}/>
			<Die bind:this={die2}/>
		</div>
		<div id="diceTotal" class="w-16 text-center bg-white border border-gray-300 shadow-lg rounded-lg p-4 text-2xl">
			{total}
		</div>
		<div id="turn_progress" style={`width: ${progressWidth}%`} class="p-1 bg-blue-600 rounded-lg m-2"></div>
	</div>


	<div id="buttons">

		<button onclick={()=>timer ? stopTimer() : startTimer()} class={`w-24 p-4 transition active:scale-90 text-center font-bold ${timer ? "bg-red-100" : "bg-white"} hover:bg-gray-200 border border-gray-300 shadow-lg rounded-lg duration-200}`}>
			{timer ? "Stop" : "Start"}
		</button>

		<button onclick={skipTurn} class={`w-24 p-4 text-center font-bold active:scale-90 ${timer ? "bg-green-100" : "bg-white"}  hover:bg-gray-200 border border-gray-300 shadow-lg rounded-lg transition duration-200`}>
			Skip >>
		</button>
	</div>

	<div id="config" class="grid grid-cols-2 gap-3 w-56 items-center bg-white border border-gray-300 shadow-lg rounded-lg p-4">
		<label for="fairDice" class="text-lg">Fair Dice</label>
		<input type="checkbox" bind:checked={FAIR_DICE} id="fairDice" class="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>

		<label for="turn" class="text-lg">Turn Time</label>
		<input type="number" step="5" bind:value={CONFIG.turn} id="turn" class="border border-gray-300 rounded-lg p-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" />
	</div>

	<div id="deckLog" class="bg-white border border-gray-300 shadow-lg rounded-lg p-4">
		Reveal Log: &nbsp;
		<input type="checkbox" bind:checked={revealLog} class="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>

		{#if revealLog}
			{#each deckLog.toReversed() as [d1, d2], i}
				<div class="flex gap-3">
					<strong>{deckLog.length - i}.</strong>
					{d1 + d2} &nbsp;&nbsp;
					[{d1}, {d2}]
				</div>
			{/each}
		{/if}
	</div>
</main>