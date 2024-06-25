const _live_catch_up_app = document.body.querySelector('ytd-app');
if (_live_catch_up_app) {
    const _LIVE_CATCH_UP_TIMEOUT = 250;
    const _LIVE_CATCH_UP_OPTIONS_INIT = {
        enabled: false,
        playbackRate: 1.0,
        smoothThreathold: 43200.0,
        slowdownAtLiveHead: true,
        disablePremiere: true,
    };

    let _live_catch_up_options = _LIVE_CATCH_UP_OPTIONS_INIT;

    let _live_catch_up_player;
    let _live_catch_up_media;
    let _live_catch_up_badge;
    let _live_catch_up_playbackrate;
    let _live_catch_up_lat;

    function _live_catch_up_calcPlaybackRate(isAtLiveHead, stats_lat, useNormalPlaybackRate) {
        if (isAtLiveHead) {
            if (useNormalPlaybackRate || stats_lat < _live_catch_up_options.smoothThreathold) {
                return 1.0;
            } else if (_live_catch_up_options.slowdownAtLiveHead) {
                return 1.05;
            } else {
                return _live_catch_up_options.playbackRate;
            }
        } else {
            return _live_catch_up_options.playbackRate;
        }
    }

    function _live_catch_up_detectPlayer() {
        if (!_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
            _live_catch_up_player = _live_catch_up_app.querySelector('div#movie_player');
            if (!_live_catch_up_player || !_live_catch_up_player.getVideoStats || !_live_catch_up_player.isAtLiveHead) {
                return false;
            }
        }

        if (!_live_catch_up_media) {
            _live_catch_up_media = _live_catch_up_player.querySelector('video.video-stream');
            if (!_live_catch_up_media) {
                return false;
            }
        }

        if (!_live_catch_up_badge) {
            _live_catch_up_badge = _live_catch_up_player.querySelector('button.ytp-live-badge');
            if (!_live_catch_up_badge) {
                return false;
            }
        }

        if (!_live_catch_up_lat) {
            _live_catch_up_lat = _live_catch_up_player.querySelector('button._live_catch_up_lat');
            if (!_live_catch_up_lat) {
                _live_catch_up_lat = document.createElement('button');
                _live_catch_up_lat.classList.add('_live_catch_up_lat', 'ytp-button');
                _live_catch_up_lat.style.cursor = 'default';
                _live_catch_up_lat.style.textAlign = 'center';
                _live_catch_up_badge.parentElement.insertBefore(_live_catch_up_lat, _live_catch_up_badge.nextSibling);
            }
        }

        if (!_live_catch_up_playbackrate) {
            _live_catch_up_playbackrate = _live_catch_up_player.querySelector('button._live_catch_up_playbackrate');
            if (!_live_catch_up_playbackrate) {
                _live_catch_up_playbackrate = document.createElement('button');
                _live_catch_up_playbackrate.classList.add('_live_catch_up_playbackrate', 'ytp-button');
                _live_catch_up_playbackrate.style.cursor = 'default';
                _live_catch_up_playbackrate.style.textAlign = 'center';
                _live_catch_up_badge.parentElement.insertBefore(_live_catch_up_playbackrate, _live_catch_up_badge.nextSibling);
            }
        }

        return true;
    }

    setInterval(() => {
        if (_live_catch_up_detectPlayer()) {
            let playbackrate_text, lat_text;

            const stats = _live_catch_up_player.getVideoStats();
            if (stats && stats.live) {
                const isAtLiveHead = _live_catch_up_player.isAtLiveHead();

                if (_live_catch_up_options.enabled) {
                    const useNormalPlaybackRate = _live_catch_up_options.disablePremiere && stats.live === 'lp';
                    const newPlaybackRate = _live_catch_up_calcPlaybackRate(isAtLiveHead, stats.lat, useNormalPlaybackRate);
                    if (_live_catch_up_media.playbackRate !== newPlaybackRate) {
                        _live_catch_up_media.playbackRate = newPlaybackRate;
                    }
                }

                playbackrate_text = 'x' + _live_catch_up_media.playbackRate.toFixed(2);

                if (isAtLiveHead) {
                    lat_text = stats.lat.toFixed(2) + 's';
                } else {
                    lat_text = '(DVR)';
                }
            } else {
                playbackrate_text = '&nbsp;';
                lat_text = '&nbsp;';
            }

            _live_catch_up_playbackrate.innerHTML = playbackrate_text;
            _live_catch_up_lat.innerHTML = lat_text;
        }
    }, _LIVE_CATCH_UP_TIMEOUT);

    document.addEventListener('_live_catch_up_start', e => {
        _live_catch_up_options = e.detail;
    });

    document.addEventListener('_live_catch_up_stop', e => {
        _live_catch_up_options = _LIVE_CATCH_UP_OPTIONS_INIT;
        if (e.detail.resetPlaybackRate && _live_catch_up_detectPlayer()) {
            _live_catch_up_media.playbackRate = _live_catch_up_player.getPlaybackRate();
        }
    });

    document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
}