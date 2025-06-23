<script lang="ts">
    import MdiMute from 'virtual:icons/mdi/mute';
    import MdiPerson from 'virtual:icons/mdi/person';
    import MdiChildToy from 'virtual:icons/mdi/child-toy';
    import {onMount} from "svelte";

    let pref = $state(2);

    const SCALE = 29;
    let epic_count: HTMLAudioElement = null;
    let child_count: HTMLAudioElement = null;
    onMount(()=>{
        epic_count = new Audio('/epic_count.wav');
        child_count = new Audio('/child_count.m4a');
    })
    const timestamps = [
        [], // mute
        [0, 1.07, 2.4, 3.9, 5.2, 6.3, 7.7, 9.2, 10.3, 11.6, 12.9, 14.3, 15.8], // epic count
        [0, 0, 1.37, 2.7, 4, 5.3, 6.6, 8, 9.2, 10.5, 11.8, 13.1, 14.2] // child count
    ]

    function togglePref() {
        pref = (pref + 1) % 3;
    }

    async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    export async function playSound(n: number | '2/12') {
        if (n === '2/12') {
            await playSound(2);
            // and sound?
            await playSound(12);
            return;
        }
        if (pref == 1) {
            epic_count.currentTime = timestamps[1][n as number];
            epic_count.play();
            await sleep(1300);
            epic_count.pause();
        }
        if (pref == 2) {
            child_count.currentTime = timestamps[2][n as number];
            child_count.play();
            await sleep(1300);
            child_count.pause();
        }
    }

    export function setPref(new_pref: number) {
        if (new_pref < 0 || new_pref > 2) {
            throw new Error("Preference must be between 0 and 2");
        }
        pref = new_pref;
    }

    onMount(() => {
        // On mount, check local storage for sound preference
        const storedPref = localStorage.getItem('readPref');
        if (storedPref) pref = JSON.parse(storedPref);

        $effect(() => {
            // On preference change, store the preference in local storage
            localStorage.setItem('readPref', JSON.stringify(pref));
        });
    })
</script>

<button
    class="flex items-center justify-center h-10"
    aria-label="Toggle Read"
    id="sounds"
    onclick={togglePref}
>
    <span class=" w-full flex flex-row gap-4 relative items-center justify-center rounded-lg bg-gray-100 border-gray-300 border-solid border transition hover:bg-gray-200 h-full py-2 px-4">
        <MdiMute />
        <MdiPerson/>
        <MdiChildToy />


        <span style="left: {pref * SCALE + (50-SCALE)}%; transform: translateX(-50%)" class="mx-auto transition-all absolute w-1/3 h-5/6 rounded-lg bg-gray-800 opacity-25"></span>
    </span>
</button>
