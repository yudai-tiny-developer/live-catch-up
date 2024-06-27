const _live_catch_up_app = document.body.querySelector('ytd-app') || document.body;
const _LIVE_CATCH_UP_TIMEOUT = 250;

let _live_catch_up_options = {
    enabled: false,
    playbackRate: 1.0,
    showPlaybackRate: false,
    showLatency: false,
    smoothThreathold: 43200.0,
    slowdownAtLiveHead: false,
    keepBufferHealth: false,
};

let _live_catch_up_player_element;
let _live_catch_up_media_element;
let _live_catch_up_badge_element;
let _live_catch_up_playbackrate_element;
let _live_catch_up_latency_element;

function _live_catch_up_detectElement() {
    if (!_live_catch_up_player_element || !_live_catch_up_player_element.getPlaybackRate || !_live_catch_up_player_element.getVideoData || !_live_catch_up_player_element.isAtLiveHead || !_live_catch_up_player_element.getStatsForNerds) {
        _live_catch_up_player_element = _live_catch_up_app.querySelector('div#movie_player');
        if (!_live_catch_up_player_element || !_live_catch_up_player_element.getPlaybackRate || !_live_catch_up_player_element.getVideoData || !_live_catch_up_player_element.isAtLiveHead || !_live_catch_up_player_element.getStatsForNerds) {
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
            _live_catch_up_latency_element.style.fill = '#eee';
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

function _live_catch_up_get_segduration() {
    const latencyClass = _live_catch_up_player_element.getPlayerResponse ? _live_catch_up_player_element.getPlayerResponse().videoDetails.latencyClass : 'MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_UNKNOWN';
    switch (latencyClass) {
        case 'MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_ULTRA_LOW':
            return 1.0;
        case 'MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_LOW':
            return 2.0;
        default:
            return 5.0;
    }
}

function _live_catch_up_is_low_buffer_health(stats) {
    const buffer_health = Number.parseFloat(stats.buffer_health_seconds);
    const threathold = _live_catch_up_player_element.getVideoStats ? _live_catch_up_player_element.getVideoStats().segduration : _live_catch_up_get_segduration();
    return buffer_health < threathold;
}

function _live_catch_up_calcPlaybackRate(isAtLiveHead, latency, stats) {
    if (isAtLiveHead) {
        if (latency < _live_catch_up_options.smoothThreathold || (_live_catch_up_options.keepBufferHealth && _live_catch_up_is_low_buffer_health(stats))) {
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

function _live_catch_up_setPlaybackRate(isAtLiveHead, latency, stats) {
    if (_live_catch_up_player_element.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
        const newPlaybackRate = _live_catch_up_calcPlaybackRate(isAtLiveHead, latency, stats);
        if (_live_catch_up_media_element.playbackRate !== newPlaybackRate) {
            _live_catch_up_media_element.playbackRate = newPlaybackRate;
        }
    }
}

function _live_catch_up_setDisplayPlaybackRate(isLive) {
    if (_live_catch_up_options.showPlaybackRate && isLive) {
        _live_catch_up_playbackrate_element.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${_live_catch_up_media_element.playbackRate.toFixed(2)}x</text></svg>`;
        if (_live_catch_up_media_element.playbackRate > 1.0) {
            _live_catch_up_playbackrate_element.style.fill = '#ff8983';
            _live_catch_up_playbackrate_element.style.fontWeight = 'bold';
        } else {
            _live_catch_up_playbackrate_element.style.fill = '#eee';
            _live_catch_up_playbackrate_element.style.fontWeight = 'normal';
        }
        _live_catch_up_playbackrate_element.style.display = '';
    } else {
        _live_catch_up_playbackrate_element.style.display = 'none';
    }
}

function _live_catch_up_setDisplayLatency(isLive, isAtLiveHead, latency) {
    if (_live_catch_up_options.showLatency && isLive) {
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
        let isLive;
        let isAtLiveHead;
        let latency;

        if (_live_catch_up_options.enabled || _live_catch_up_options.showPlaybackRate || _live_catch_up_options.showLatency) {
            const data = _live_catch_up_player_element.getVideoData();
            isLive = data.isLive;
            if (isLive) {
                isAtLiveHead = _live_catch_up_player_element.isAtLiveHead();
                const stats = _live_catch_up_player_element.getStatsForNerds();
                latency = Number.parseFloat(stats.live_latency_secs);
                if (_live_catch_up_options.enabled) {
                    _live_catch_up_setPlaybackRate(isAtLiveHead, latency, stats);
                }
            }
        }

        _live_catch_up_setDisplayPlaybackRate(isLive);
        _live_catch_up_setDisplayLatency(isLive, isAtLiveHead, latency);
    }
}, _LIVE_CATCH_UP_TIMEOUT);

document.addEventListener('_live_catch_up_activate', e => {
    _live_catch_up_options = e.detail;
});

document.addEventListener('_live_catch_up_deactivate', e => {
    _live_catch_up_options = e.detail;
    if (_live_catch_up_detectElement()) {
        _live_catch_up_media_element.playbackRate = _live_catch_up_player_element.getPlaybackRate();
    }
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));