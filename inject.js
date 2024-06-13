let _live_catch_up_interval;

document.addEventListener('_live_catch_up_start', e => {
    clearInterval(_live_catch_up_interval);
    const player = document.querySelector('div#movie_player');
    if (player) {
        const media = player.querySelector('video');
        if (media) {
            _live_catch_up_interval = setInterval(() => {
                const mediaReferenceTime = player.getMediaReferenceTime() * 1000;
                if (mediaReferenceTime > 0 && Date.now() - mediaReferenceTime > e.detail.smoothThreathold) {
                    media.playbackRate = e.detail.playbackRate;
                } else {
                    media.playbackRate = 1.0;
                }
            }, e.detail.smoothRate);
        }
    }
});

document.addEventListener('_live_catch_up_stop', e => {
    clearInterval(_live_catch_up_interval);
    const player = document.querySelector('div#movie_player');
    if (player) {
        const media = player.querySelector('video');
        if (media) {
            media.playbackRate = 1.0;
        }
    }
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));