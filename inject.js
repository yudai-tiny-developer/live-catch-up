let _live_catch_up_interval;

document.addEventListener('_live_catch_up_start', e => {
    const playbackRate = e.detail.playbackRate;
    const smoothRate = e.detail.smoothRate;
    const smoothThreathold = e.detail.smoothThreathold;

    clearInterval(_live_catch_up_interval);
    _live_catch_up_interval.push(setInterval(() => {
        const player = document.querySelector('div#movie_player');
        if (player && player.getVideoStats && player.isAtLiveHead) {
            const media = player.querySelector('video');
            if (media) {
                const stats = player.getVideoStats();
                if (stats.live) {
                    media.playbackRate = player.isAtLiveHead() && stats.lat < smoothThreathold ? 1.0 : playbackRate;
                } else {
                    clearInterval(_live_catch_up_interval);
                }
            }
        }
    }, smoothRate));
});

document.addEventListener('_live_catch_up_stop', e => {
    clearInterval(_live_catch_up_interval);
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));