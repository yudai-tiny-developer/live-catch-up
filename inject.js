let _live_catch_up_interval;

const app = document.querySelector('ytd-app');

document.addEventListener('_live_catch_up_start', e => {
    const playbackRate = e.detail.playbackRate;
    const smoothRate = e.detail.smoothRate;
    const smoothThreathold = e.detail.smoothThreathold;

    clearInterval(_live_catch_up_interval);

    _live_catch_up_interval = setInterval(() => {
        const player = app.querySelector('div#movie_player');
        if (!player || !player.getVideoStats || !player.isAtLiveHead) {
            return;
        }

        const media = player.querySelector('video.video-stream');
        if (!media) {
            return;
        }

        const stats = player.getVideoStats();
        if (stats.live) {
            const newPlaybackRate = player.isAtLiveHead() && stats.lat < smoothThreathold ? 1.0 : playbackRate;
            if (media.playbackRate !== newPlaybackRate) {
                media.playbackRate = newPlaybackRate;
            }
        }
    }, smoothRate);
});

document.addEventListener('_live_catch_up_stop', e => {
    clearInterval(_live_catch_up_interval);
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));