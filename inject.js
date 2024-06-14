let _live_catch_up_interval;

document.addEventListener('_live_catch_up_start', e => {
    const player = document.querySelector('div#movie_player');
    if (player && player.isAtLiveHead && player.getVideoStats && player.getVideoStats().live) {
        const media = player.querySelector('video');
        if (media) {
            clearInterval(_live_catch_up_interval);
            _live_catch_up_interval = setInterval(() => {
                media.playbackRate = player.isAtLiveHead() && player.getVideoStats().lat < e.detail.smoothThreathold ? 1.0 : e.detail.playbackRate;
            }, e.detail.smoothRate);
        } else {
            console.warn('video not found');
        }
    } else {
        console.warn('div#movie_player not found');
    }
});

document.addEventListener('_live_catch_up_stop', e => {
    clearInterval(_live_catch_up_interval);
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));