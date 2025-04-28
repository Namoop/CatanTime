<script lang="ts">
    let { getPref } = $props();

    let ding: HTMLAudioElement;
    let drum_loop: HTMLAudioElement;
    let drum_hit: HTMLAudioElement;

    export function playSound() {
        if (getPref() == 1) ding.play()
        if (getPref() == 2) drum_hit.play()
    }

    export function playBuildUp() {
        if (getPref() >= 2) {
            drum_loop.play();
        }
    }

    export function pauseBuildUp() {
        if (getPref() >= 2) {
            drum_loop.pause();
        }
    }

    export function stopBuildUp() {
        if (getPref() >= 2) {
            drum_loop.pause();
            drum_loop.currentTime = 0;
            drum_hit.pause();
            drum_hit.currentTime = 0;
        }
    }
</script>

<audio src="ding.mp3" bind:this={ding}></audio>
<audio src="drum_loop.mp3" bind:this={drum_loop}></audio>
<audio src="drum_hit.mp3" bind:this={drum_hit}></audio>