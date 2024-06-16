let _live_catch_up_interval;
let _live_catch_up_app = document.body.querySelector('ytd-app');
let _live_catch_up_player;
let _live_catch_up_media;

function calcPlaybackRate(isAtLiveHead, stats_lat, playbackRate, smoothThreathold, slowdownAtLiveHead) {
    if (isAtLiveHead) {
        if (stats_lat < smoothThreathold) {
            return 1.0;
        } else if (slowdownAtLiveHead) {
            return 1.05;
        } else {
            return playbackRate;
        }
    } else {
        return playbackRate;
    }

}

document.addEventListener('_live_catch_up_start', e => {
    const playbackRate = e.detail.playbackRate;
    const smoothRate = e.detail.smoothRate;
    const smoothThreathold = e.detail.smoothThreathold;
    const slowdownAtLiveHead = e.detail.slowdownAtLiveHead;

    clearInterval(_live_catch_up_interval);

    _live_catch_up_interval = setInterval(() => {
        if (!_live_catch_up_app) {
            _live_catch_up_app = document.body.querySelector('ytd-app');
            if (!_live_catch_up_app) {
                return;
            }
        }

        if (!_live_catch_up_media || !_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
            _live_catch_up_player = _live_catch_up_app.querySelector('div#movie_player');
            if (!_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
                _live_catch_up_media = undefined;
                return;
            }

            _live_catch_up_media = _live_catch_up_player.querySelector('video.video-stream');
            if (!_live_catch_up_media) {
                return;
            }
        }

        const stats = _live_catch_up_player.getVideoStats();
        if (stats && stats.live) {
            const newPlaybackRate = calcPlaybackRate(_live_catch_up_player.isAtLiveHead(), stats.lat, playbackRate, smoothThreathold, slowdownAtLiveHead);
            if (_live_catch_up_media.playbackRate !== newPlaybackRate) {
                _live_catch_up_media.playbackRate = newPlaybackRate;
            }
        }
    }, smoothRate);
});

document.addEventListener('_live_catch_up_stop', e => {
    clearInterval(_live_catch_up_interval);
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));