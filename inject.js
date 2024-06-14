let _live_catch_up_interval;

document.addEventListener('_live_catch_up_start', e => {
    clearInterval(_live_catch_up_interval);
    const player = document.querySelector('div#movie_player');
    if (player && player.getVideoStats && player.getVideoStats().live) {
        const media = player.querySelector('video');
        if (media) {
            _live_catch_up_interval = setInterval(() => {
                const stats = player.getVideoStats();
                media.playbackRate = stats.isAtLiveHead() || stats.lat < e.detail.smoothThreathold ? 1.0 : e.detail.playbackRate;
            }, e.detail.smoothRate);
        }
    }
});

document.addEventListener('_live_catch_up_stop', e => {
    clearInterval(_live_catch_up_interval);
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));