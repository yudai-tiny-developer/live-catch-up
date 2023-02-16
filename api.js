window.addEventListener('message', event => {
    const player = document.querySelector('div#movie_player');
    if (player) {
        player.setPlaybackRate(event.data.playbackRate);
    }
});
