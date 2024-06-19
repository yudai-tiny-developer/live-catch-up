const _live_catch_up_app = document.body.querySelector('ytd-app');
if (_live_catch_up_app) {
    let _live_catch_up_interval;
    let _live_catch_up_interval_processing;
    let _live_catch_up_start_processing;
    let _live_catch_up_stop_processing;
    let _live_catch_up_player;
    let _live_catch_up_media;

    function _live_catch_up_calcPlaybackRate(isAtLiveHead, stats_lat, playbackRate, smoothThreathold, slowdownAtLiveHead) {
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

    function _live_catch_up_detectPlayer() {
        if (!_live_catch_up_media || !_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
            _live_catch_up_player = _live_catch_up_app.querySelector('div#movie_player');
            if (!_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
                _live_catch_up_media = undefined;
                return false;
            }

            _live_catch_up_media = _live_catch_up_player.querySelector('video.video-stream');
            if (!_live_catch_up_media) {
                return false;
            }
        }

        return true;
    }

    document.addEventListener('_live_catch_up_start', e => {
        const startInterval = setInterval(() => {
            if (!_live_catch_up_stop_processing) {
                _live_catch_up_start_processing = true;

                const playbackRate = e.detail.playbackRate;
                const smoothRate = e.detail.smoothRate;
                const smoothThreathold = e.detail.smoothThreathold;
                const slowdownAtLiveHead = e.detail.slowdownAtLiveHead;

                clearInterval(_live_catch_up_interval);

                _live_catch_up_interval = setInterval(() => {
                    _live_catch_up_interval_processing = true;
                    if (_live_catch_up_detectPlayer()) {
                        const stats = _live_catch_up_player.getVideoStats();
                        if (stats && stats.live) {
                            const newPlaybackRate = _live_catch_up_calcPlaybackRate(_live_catch_up_player.isAtLiveHead(), stats.lat, playbackRate, smoothThreathold, slowdownAtLiveHead);
                            if (_live_catch_up_media.playbackRate !== newPlaybackRate) {
                                _live_catch_up_media.playbackRate = newPlaybackRate;
                            }
                        }
                    }
                    _live_catch_up_interval_processing = false;
                }, smoothRate);

                clearInterval(startInterval);
                _live_catch_up_start_processing = false;
            }
        });
    });

    document.addEventListener('_live_catch_up_stop', e => {
        const stopInterval = setInterval(() => {
            if (!_live_catch_up_start_processing) {
                _live_catch_up_stop_processing = true;

                const resetPlaybackRate = e.detail.resetPlaybackRate;

                clearInterval(_live_catch_up_interval);

                if (resetPlaybackRate && _live_catch_up_detectPlayer()) {
                    const resetInterval = setInterval(() => {
                        if (!_live_catch_up_interval_processing) {
                            _live_catch_up_media.playbackRate = _live_catch_up_player.getPlaybackRate();
                            clearInterval(resetInterval);
                        }
                    }, 100);
                }

                clearInterval(stopInterval);
                _live_catch_up_stop_processing = false;
            }
        });
    });

    document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
}