<script lang="ts">
	import Die from "$lib/Die.svelte";

	let die1: Die, die2: Die;
	let dice: DieValue[] = $state([0, 0] as unknown as DieValue[]);
	const FAIRDICE = true

	const deck: DieValue[][] = [];
	function createDeck() {
		for (let i = 1; i <= 6; i++) {
			for (let j = 1; j <= 6; j++) {
				deck.push([i, j] as DieValue[]);
			}
		}
	}

	function rollDice(){
		if (deck.length === 0) {
			createDeck();
		}
		if (FAIRDICE)
			dice = deck.splice(Math.random() * deck.length | 0, 1)[0];
		else
			dice = deck.slice(Math.random() * deck.length | 0, 1)[0]

		die1.rollDie(dice[0]);
		die2.rollDie(dice[1]);
	}

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button onclick={()=>rollDice()} class="border-2 border-yellow-400 bg-yellow-300 rounded p-1 transition">
	Roll the dice
</button>

<main class="flex flex-col items-center gap-3">
	<div class="flex gap-3">
		<Die bind:this={die1}/>
		<Die bind:this={die2}/>
	</div>

	<div id="diceTotal" class="w-16 text-center bg-white border border-gray-300 shadow-lg rounded-lg p-4 text-2xl">
		{dice[0] + dice[1]}
	</div>
</main>

<style>
	button:active {
		transform: scale(0.90);
	}
</style>