const _live_catch_up_app = document.body.querySelector('ytd-app');
if (_live_catch_up_app) {
    const _LIVE_CATCH_UP_TIMEOUT = 250;
    const _LIVE_CATCH_UP_OPTIONS_INIT = {
        enabled: false,
        playbackRate: 1.0,
        showPlaybackRate: false,
        showLatency: false,
        smoothThreathold: 43200.0,
        slowdownAtLiveHead: false,
        disablePremiere: false,
    };

    let _live_catch_up_options = _LIVE_CATCH_UP_OPTIONS_INIT;

    let _live_catch_up_player_element;
    let _live_catch_up_media_element;
    let _live_catch_up_badge_element;
    let _live_catch_up_playbackrate_element;
    let _live_catch_up_latency_element;

    function _live_catch_up_detectElement() {
        if (!_live_catch_up_player_element || !_live_catch_up_player_element.getVideoStats || !_live_catch_up_player_element.isAtLiveHead) {
            _live_catch_up_player_element = _live_catch_up_app.querySelector('div#movie_player');
            if (!_live_catch_up_player_element || !_live_catch_up_player_element.getVideoStats || !_live_catch_up_player_element.isAtLiveHead) {
                return false;
            }
        }

        if (!_live_catch_up_media_element) {
            _live_catch_up_media_element = _live_catch_up_player_element.querySelector('video.video-stream');
            if (!_live_catch_up_media_element) {
                return false;
            }
        }

        if (!_live_catch_up_badge_element) {
            _live_catch_up_badge_element = _live_catch_up_player_element.querySelector('button.ytp-live-badge');
            if (!_live_catch_up_badge_element) {
                return false;
            }
        }

        if (!_live_catch_up_latency_element) {
            _live_catch_up_latency_element = _live_catch_up_player_element.querySelector('button._live_catch_up_latency');
            if (!_live_catch_up_latency_element) {
                _live_catch_up_latency_element = document.createElement('button');
                _live_catch_up_latency_element.classList.add('_live_catch_up_latency', 'ytp-button');
                _live_catch_up_latency_element.style.display = 'none';
                _live_catch_up_latency_element.style.cursor = 'default';
                _live_catch_up_latency_element.style.textAlign = 'center';
                _live_catch_up_latency_element.style.fill = 'var(--yt-spec-text-primary)';
                _live_catch_up_badge_element.parentElement.parentElement.insertBefore(_live_catch_up_latency_element, _live_catch_up_badge_element.parentElement.nextSibling);
            }
        }

        if (!_live_catch_up_playbackrate_element) {
            _live_catch_up_playbackrate_element = _live_catch_up_player_element.querySelector('button._live_catch_up_playbackrate');
            if (!_live_catch_up_playbackrate_element) {
                _live_catch_up_playbackrate_element = document.createElement('button');
                _live_catch_up_playbackrate_element.classList.add('_live_catch_up_playbackrate', 'ytp-button');
                _live_catch_up_playbackrate_element.style.display = 'none';
                _live_catch_up_playbackrate_element.style.cursor = 'default';
                _live_catch_up_playbackrate_element.style.textAlign = 'center';
                _live_catch_up_badge_element.parentElement.parentElement.insertBefore(_live_catch_up_playbackrate_element, _live_catch_up_badge_element.parentElement.nextSibling);
            }
        }

        return true;
    }

    function _live_catch_up_calcPlaybackRate(isAtLiveHead, latency, useNormalPlaybackRate) {
        if (isAtLiveHead) {
            if (useNormalPlaybackRate || latency < _live_catch_up_options.smoothThreathold) {
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

    function _live_catch_up_setPlaybackRate(stats_live, isAtLiveHead, latency) {
        if (_live_catch_up_player_element.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const useNormalPlaybackRate = _live_catch_up_options.disablePremiere && stats_live === 'lp';
            const newPlaybackRate = _live_catch_up_calcPlaybackRate(isAtLiveHead, latency, useNormalPlaybackRate);
            if (_live_catch_up_media_element.playbackRate !== newPlaybackRate) {
                _live_catch_up_media_element.playbackRate = newPlaybackRate;
            }
        }
    }

    function _live_catch_up_setDisplayPlaybackRate(stats_live) {
        if (_live_catch_up_options.showPlaybackRate && stats_live) {
            _live_catch_up_playbackrate_element.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${_live_catch_up_media_element.playbackRate.toFixed(2)}x</text></svg>`;
            if (_live_catch_up_media_element.playbackRate > 1.0) {
                _live_catch_up_playbackrate_element.style.fill = 'var(--yt-spec-red-30)';
                _live_catch_up_playbackrate_element.style.fontWeight = 'bold';
            } else {
                _live_catch_up_playbackrate_element.style.fill = 'var(--yt-spec-text-primary)';
                _live_catch_up_playbackrate_element.style.fontWeight = 'normal';
            }
            _live_catch_up_playbackrate_element.style.display = '';
        } else {
            _live_catch_up_playbackrate_element.style.display = 'none';
        }
    }

    function _live_catch_up_setDisplayLatency(stats_live, isAtLiveHead, latency) {
        if (_live_catch_up_options.showLatency && stats_live) {
            if (isAtLiveHead) {
                _live_catch_up_latency_element.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${latency.toFixed(2)}s</text></svg>`;
            } else {
                _live_catch_up_latency_element.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">(DVR)</text></svg>`;
            }
            _live_catch_up_latency_element.style.display = '';
        } else {
            _live_catch_up_latency_element.style.display = 'none';
        }
    }

    setInterval(() => {
        if (_live_catch_up_detectElement()) {
            let stats_live;
            let isAtLiveHead;
            let latency;

            if (_live_catch_up_options.enabled || _live_catch_up_options.showPlaybackRate || _live_catch_up_options.showLatency) {
                const stats = _live_catch_up_player_element.getVideoStats();
                if (stats && (stats.live === 'live' || stats.live === 'dvr' || stats.live === 'lp')) { // stats.live: live, dvr, lp (Premiere), post (Archive), undefined
                    stats_live = stats.live;
                    isAtLiveHead = _live_catch_up_player_element.isAtLiveHead();
                    latency = stats.lat;

                    if (_live_catch_up_options.enabled) {
                        _live_catch_up_setPlaybackRate(stats_live, isAtLiveHead, latency);
                    }
                }
            }

            _live_catch_up_setDisplayPlaybackRate(stats_live);
            _live_catch_up_setDisplayLatency(stats_live, isAtLiveHead, latency);
        }
    }, _LIVE_CATCH_UP_TIMEOUT);

    document.addEventListener('_live_catch_up_activate', e => {
        _live_catch_up_options = e.detail;
    });

    document.addEventListener('_live_catch_up_deactivate', e => {
        _live_catch_up_options = _LIVE_CATCH_UP_OPTIONS_INIT;
        if (_live_catch_up_detectElement()) {
            _live_catch_up_media_element.playbackRate = _live_catch_up_player_element.getPlaybackRate();
            _live_catch_up_playbackrate_element.style.display = 'none';
            _live_catch_up_latency_element.style.display = 'none';
        }
    });

    document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
}