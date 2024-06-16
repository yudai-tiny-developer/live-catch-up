let _live_catch_up_interval;
let _live_catch_up_player;
let _live_catch_up_media;

document.addEventListener('_live_catch_up_start', e => {
    const playbackRate = e.detail.playbackRate;
    const smoothRate = e.detail.smoothRate;
    const smoothThreathold = e.detail.smoothThreathold;

    clearInterval(_live_catch_up_interval);

    _live_catch_up_interval = setInterval(() => {
        if (!_live_catch_up_media || !_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
            _live_catch_up_media = undefined;
            _live_catch_up_player = document.querySelector('div#movie_player');
            if (!_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
                return;
            }

            _live_catch_up_media = _live_catch_up_player.querySelector('video.video-stream');
            if (!_live_catch_up_media) {
                return;
            }
        }

        const stats = _live_catch_up_player.getVideoStats();
        if (stats && stats.live) {
            const newPlaybackRate = _live_catch_up_player.isAtLiveHead() && stats.lat < smoothThreathold ? 1.0 : playbackRate;
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