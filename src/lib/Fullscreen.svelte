<script lang="ts">

    import MdiFullscreen from 'virtual:icons/mdi/fullscreen';

    let isFullscreen = $state(false);

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
        const element = document.getElementById('dicediv')!;
        console.log(isFullscreen);
        if (isFullscreen) {
            // scale the element to fit the screen
            // let winmax = Math.max(window.innerWidth, window.innerHeight);
            // let scale = winmax / 500;
            let scale = 1;
            if (window.innerWidth < window.innerHeight) {
                scale = window.innerWidth / 400;
            } else {
                scale = window.innerHeight / 500;
            }
            element.style.transformOrigin = 'top';
            element.style.transform = `scale(${scale})`;
            element.style.marginBottom = `${(500 * (scale - 1))}px`;
            scrollTo(0, 100);
        } else {
            // reset the element to its original size
            element.style = ""
        }
    }

</script>

<button
    class="z-10 w-12 h-12 rounded-full border sticky top-10 left-10 border-gray-300 flex items-center justify-center cursor-pointer bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 focus:outline-none transition text-2xl duration-100"
    aria-label="Fullscreen"
    id="fullscreen"
    onclick={toggleFullscreen}
    >
    <MdiFullscreen />
</button>