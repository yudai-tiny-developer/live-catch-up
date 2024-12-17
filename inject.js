const _live_catch_up_app = document.body.querySelector('ytd-app') || document.body;
const _LIVE_CATCH_UP_TIMEOUT = 500;

let _live_catch_up_player_element;
let _live_catch_up_media_element;
let _live_catch_up_badge_element;
let _live_catch_up_playbackrate_element;
let _live_catch_up_latency_element;

let _live_catch_up_current_interval;

const _live_catch_up_HTMLPolicy = window.trustedTypes ? window.trustedTypes.createPolicy("_live_catch_up_HTMLPolicy", {
    createHTML: (string) => string,
}) : {
    createHTML: (string) => string,
};

function _live_catch_up_detectElements() {
    if (!_live_catch_up_player_element || !_live_catch_up_player_element.getPlaybackRate || !_live_catch_up_player_element.getVideoData || !_live_catch_up_player_element.isAtLiveHead || !_live_catch_up_player_element.getStatsForNerds) {
        _live_catch_up_player_element = _live_catch_up_app.querySelector('div#movie_player');
        if (!_live_catch_up_player_element || !_live_catch_up_player_element.getPlaybackRate || !_live_catch_up_player_element.getVideoData || !_live_catch_up_player_element.isAtLiveHead || !_live_catch_up_player_element.getStatsForNerds) {
            _live_catch_up_resetPlaybackRate();
            return false;
        }
    }

    if (!_live_catch_up_media_element) {
        _live_catch_up_media_element = _live_catch_up_player_element.querySelector('video.video-stream');
        if (!_live_catch_up_media_element) {
            _live_catch_up_resetPlaybackRate();
            return false;
        }
    }

    if (!_live_catch_up_badge_element) {
        _live_catch_up_badge_element = _live_catch_up_player_element.querySelector('button.ytp-live-badge');
        if (!_live_catch_up_badge_element) {
            _live_catch_up_resetPlaybackRate();
            return false;
        }
    }

    if (_live_catch_up_badge_element && _live_catch_up_is_DisplayNone(_live_catch_up_badge_element)) {
        _live_catch_up_resetPlaybackRate();
        return false;
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

    if (!_live_catch_up_player_element.getAttribute('_live_catch_up')) {
        _live_catch_up_player_element.setAttribute('_live_catch_up', true);
        _live_catch_up_player_element.addEventListener('onPlaybackRateChange', e => {
            if (e === 1.0) { // Keep the playback rate if it has been manually changed.
                document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
            }
        });
    }

    return true;
}

function _live_catch_up_get_segduration() {
    if (_live_catch_up_detectElements()) {
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
}

function _live_catch_up_is_low_buffer_health(stats) {
    if (_live_catch_up_detectElements()) {
        const buffer_health = Number.parseFloat(stats.buffer_health_seconds);
        const threathold = _live_catch_up_player_element.getVideoStats ? _live_catch_up_player_element.getVideoStats().segduration : _live_catch_up_get_segduration();
        return buffer_health < threathold;
    }
}

function _live_catch_up_calcPlaybackRate(settings, isAtLiveHead, latency, stats) {
    if (isAtLiveHead) {
        if (latency < settings.smoothThreathold || (settings.keepBufferHealth && _live_catch_up_is_low_buffer_health(stats))) {
            return 1.0;
        } else if (settings.slowdownAtLiveHead) {
            return 1.05;
        } else {
            return settings.playbackRate;
        }
    } else {
        return settings.playbackRate;
    }
}

function _live_catch_up_setPlaybackRate(settings, isAtLiveHead, latency, stats) {
    if (_live_catch_up_detectElements()) {
        if (_live_catch_up_player_element.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = _live_catch_up_calcPlaybackRate(settings, isAtLiveHead, latency, stats);
            if (_live_catch_up_media_element.playbackRate !== newPlaybackRate) {
                _live_catch_up_media_element.playbackRate = newPlaybackRate;
            }
        }
    }
}

function _live_catch_up_showPlaybackRate() {
    if (_live_catch_up_detectElements()) {
        _live_catch_up_playbackrate_element.innerHTML = _live_catch_up_HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${_live_catch_up_media_element.playbackRate.toFixed(2)}x</text></svg>`);
        if (_live_catch_up_media_element.playbackRate > 1.0) {
            _live_catch_up_playbackrate_element.style.fill = '#ff8983';
            _live_catch_up_playbackrate_element.style.fontWeight = 'bold';
        } else {
            _live_catch_up_playbackrate_element.style.fill = '#eee';
            _live_catch_up_playbackrate_element.style.fontWeight = 'normal';
        }
        _live_catch_up_playbackrate_element.style.display = '';
    }
}

function _live_catch_up_hidePlaybackRate() {
    if (_live_catch_up_detectElements()) {
        _live_catch_up_playbackrate_element.style.display = 'none';
    }
}

function _live_catch_up_showLatency(isAtLiveHead, latency) {
    if (_live_catch_up_detectElements()) {
        if (isAtLiveHead) {
            _live_catch_up_latency_element.innerHTML = _live_catch_up_HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${latency.toFixed(2)}s</text></svg>`);
        } else {
            _live_catch_up_latency_element.innerHTML = _live_catch_up_HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">(DVR)</text></svg>`);
        }
        _live_catch_up_latency_element.style.display = '';
    }
}

function _live_catch_up_hideLatency() {
    if (_live_catch_up_detectElements()) {
        _live_catch_up_latency_element.style.display = 'none';
    }
}

function _live_catch_up_runInterval(settings) {
    const interval = _live_catch_up_current_interval = setInterval(() => {
        if (interval !== _live_catch_up_current_interval) {
            clearInterval(interval);
        } else if (settings.enabled || settings.showPlaybackRate || settings.showLatency) {
            if (_live_catch_up_detectElements()) {
                const data = _live_catch_up_player_element.getVideoData();
                if (data.isLive) {
                    const isAtLiveHead = _live_catch_up_player_element.isAtLiveHead();
                    const stats = _live_catch_up_player_element.getStatsForNerds();
                    const latency = Number.parseFloat(stats.live_latency_secs);

                    if (settings.enabled) {
                        _live_catch_up_setPlaybackRate(settings, isAtLiveHead, latency, stats);
                    }

                    if (settings.showPlaybackRate) {
                        _live_catch_up_showPlaybackRate();
                    } else {
                        _live_catch_up_hidePlaybackRate();
                    }

                    if (settings.showLatency) {
                        _live_catch_up_showLatency(isAtLiveHead, latency);
                    } else {
                        _live_catch_up_hideLatency();
                    }
                } else {
                    _live_catch_up_hidePlaybackRate();
                    _live_catch_up_hideLatency();
                }
            }
        } else {
            clearInterval(interval);
            _live_catch_up_hidePlaybackRate();
            _live_catch_up_hideLatency();
        }
    }, _LIVE_CATCH_UP_TIMEOUT);
}

function _live_catch_up_is_DisplayNone(node) {
    const compStyles = getComputedStyle(node);
    const propertyValue = compStyles.getPropertyValue('display');
    return propertyValue === 'none';
}

function _live_catch_up_resetPlaybackRate() {
    if (_live_catch_up_media_element) {
        _live_catch_up_media_element.playbackRate = _live_catch_up_player_element.getPlaybackRate();
    }
}

document.addEventListener('_live_catch_up_settings', e => {
    _live_catch_up_runInterval(e.detail);
});

document.addEventListener('_live_catch_up_reset_playback_rate', () => {
    if (_live_catch_up_detectElements()) {
        _live_catch_up_media_element.playbackRate = _live_catch_up_player_element.getPlaybackRate();
    }
});

document.dispatchEvent(new CustomEvent('_live_catch_up_init'));