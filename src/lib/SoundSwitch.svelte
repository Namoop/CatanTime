<script lang="ts">
    import MdiMute from 'virtual:icons/mdi/mute';
    import MdiNotificationsActive from 'virtual:icons/mdi/notifications-active';
    import LucideDrum from 'virtual:icons/lucide/drum';
    import {onMount} from "svelte";

    let pref = $state(2);

    const SCALE = 29;

    function togglePref() {
        pref = (pref + 1) % 3;
    }

    export function getPref() {
        return pref;
    }

    export function setPref(new_pref: number) {
        if (new_pref < 0 || new_pref > 2) {
            throw new Error("Preference must be between 0 and 2");
        }
        pref = new_pref;
    }

    onMount(() => {
        // On mount, check local storage for sound preference
        const storedPref = localStorage.getItem('soundPref');
        if (storedPref) pref = JSON.parse(storedPref);

        $effect(() => {
            // On preference change, store the preference in local storage
            localStorage.setItem('soundPref', JSON.stringify(pref));
        });
    })
</script>

<button
    class="flex items-center justify-center h-10"
    aria-label="Toggle Sound"
    id="sounds"
    onclick={togglePref}
>
    <span class=" w-full flex flex-row gap-4 relative items-center justify-center rounded-lg bg-gray-100 border-gray-300 border-solid border transition hover:bg-gray-200 h-full py-2 px-4">
        <MdiMute />
        <MdiNotificationsActive />
        <LucideDrum />


        <span style="left: {pref * SCALE + (50-SCALE)}%; transform: translateX(-50%)" class="mx-auto transition-all absolute w-1/3 h-5/6 rounded-lg bg-gray-800 opacity-25"></span>
    </span>
</button>
