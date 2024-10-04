<script lang="ts">
	let dice: HTMLDivElement;
	let outputDiv: HTMLDivElement;
	let result = $state(1);
	let reRoll = $state(false);

	export function rollDie(num?: DieValue) {
		result = num ?? Math.floor(Math.random() * (6 - 1 + 1)) + 1;
		reRoll = !reRoll;
	}

	const TransformData = [
		{ base: "transform: rotateX(360deg) rotateY(360deg) rotateZ(720deg);", reRoll: "transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);" },
		{ base: "transform: rotateX(360deg) rotateY(540deg) rotateZ(720deg);", reRoll: "transform: rotateX(0deg) rotateY(180deg) rotateZ(0deg);" },
		{ base: "transform: rotateX(360deg) rotateY(630deg) rotateZ(720deg);", reRoll: "transform: rotateX(0deg) rotateY(270deg) rotateZ(0deg);" },
		{ base: "transform: rotateX(360deg) rotateY(450deg) rotateZ(720deg);", reRoll: "transform: rotateX(0deg) rotateY(90deg) rotateZ(0deg);" },
		{ base: "transform: rotateX(630deg) rotateY(360deg) rotateZ(720deg);", reRoll: "transform: rotateX(270deg) rotateY(0deg) rotateZ(0deg);" },
		{ base: "transform: rotateX(450deg) rotateY(360deg) rotateZ(720deg);", reRoll: "transform: rotateX(90deg) rotateY(0deg) rotateZ(0deg);" }
	]

	const SideData = [
		["transform: translateZ(45px);", "top: 50%; left: 50%;"],
		["transform: rotateX(-180deg) translateZ(45px);", "top: 25%; left: 25%;", "top: 75%; left: 75%;"],
		["transform: rotateY(90deg) translateZ(45px);", "top: 25%; left: 25%;", "top: 75%; left: 75%;", "top: 50%; left: 50%;"],
		["transform: rotateY(-90deg) translateZ(45px);", "top: 25%; left: 25%;", "top: 25%; left: 75%;", "top: 75%; left: 25%;", "top: 75%; left: 75%;"],
		["transform: rotateX(90deg) translateZ(45px);", "top: 25%; left: 25%;", "top: 25%; left: 75%;", "top: 75%; left: 25%;", "top: 75%; left: 75%;", "top: 50%; left: 50%;"],
		["transform: rotateX(-90deg) translateZ(45px);", "top: 25%; left: 25%;", "top: 25%; left: 75%;", "top: 75%; left: 25%;", "top: 75%; left: 75%;", "top: 50%; left: 25%;", "top: 50%; left: 75%;"]
	]
</script>

<main class="flex h-40 w-40 items-center justify-center flex-col gap-2 border-2">
	<div id="dice" bind:this={dice} style={TransformData[result-1][reRoll ? "reRoll" : "base"]}>

		{#each Array.from({ length: 6 }, (_, i) => i + 1) as side}
			<div class="sides" style={SideData[side-1][0]}>
				{#each Array.from({ length: side }, (_, i) => i + 1) as dot}
					<span class="dot" style={SideData[side-1][dot]}></span>
				{/each}
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		perspective: 1000px;
	}

	#dice {
		width: 90px;
		height: 90px;
		transform-style: preserve-3d;
		transition: transform 1.5s ease-out;
	}

	.sides{
		background-color: #EFE5DC;
		display: block;
		position: absolute;
		width: 100%;
		height: 100%;
		box-shadow: inset 0 0 5px rgba(0,0,0,0.25);
	}

	.dot {
		display: block;
		position: absolute;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: black;
		transform: translate(-50%, -50%);
	}

</style>