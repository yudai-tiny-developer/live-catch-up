window.addEventListener('message', event => {
    document.querySelector('div#movie_player')?.setPlaybackRate(event.data.playbackRate);
});
