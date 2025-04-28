import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(common);
    }
});

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            enabled = common.value(data.enabled, common.defaultEnabled);
            playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const showPlaybackRate = common.value(data.showPlaybackRate, common.defaultShowPlaybackRate);
            const showLatency = common.value(data.showLatency, common.defaultShowLatency);
            const showHealth = common.value(data.showHealth, common.defaultShowHealth);
            const showEstimation = common.value(data.showEstimation, common.defaultShowEstimation);
            const showCurrent = common.value(data.showCurrent, common.defaultShowCurrent);
            smooth = common.value(data.smooth, common.defaultSmooth);
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);
            const smoothAuto = common.value(data.smoothAuto, common.defaultSmoothAuto);

            sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showHealth, showEstimation, showCurrent, smooth, smoothThreathold, smoothAuto);

            if (enabled) {
                if (smooth) {
                    badge_observer?.disconnect();
                } else {
                    setPlaybackRate(playbackRate);
                    badge_observer?.observe(badge, { attributeFilter: ['disabled'] });
                }
            } else {
                resetPlaybackRate();
            }
        });
    }

    function sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showHealth, showEstimation, showCurrent, smooth, smoothThreathold, smoothAuto) {
        const detailObject = {
            enabled: enabled && smooth,
            playbackRate,
            showPlaybackRate,
            showLatency,
            showHealth,
            showEstimation,
            showCurrent,
            smoothThreathold,
            smoothAuto,
        };
        const detail = navigator.userAgent.includes('Firefox') ? cloneInto(detailObject, document.defaultView) : detailObject;
        document.dispatchEvent(new CustomEvent('_live_catch_up_load_settings', { detail }));
    }

    function setPlaybackRate(playbackRate) {
        if (is_live()) {
            if (is_live_head()) {
                sendResetPlaybackRateEvent();
            } else {
                sendSetPlaybackRateEvent(playbackRate);
            }
        }
    }

    function resetPlaybackRate() {
        if (is_live()) {
            sendResetPlaybackRateEvent();
        }
    }

    function is_live() {
        return badge?.parentNode?.classList.contains('ytp-live');
    }

    function is_live_head() {
        return badge?.hasAttribute('disabled');
    }

    function sendSetPlaybackRateEvent(playbackRate) {
        const detailObject = {
            playbackRate,
        };
        const detail = navigator.userAgent.includes('Firefox') ? cloneInto(detailObject, document.defaultView) : detailObject;
        document.dispatchEvent(new CustomEvent('_live_catch_up_set_playback_rate', { detail }));
    }

    function sendResetPlaybackRateEvent() {
        document.dispatchEvent(new CustomEvent('_live_catch_up_reset_playback_rate'));
    }

    const app = document.querySelector('ytd-app') ?? document.body; // YouTube.com or Embedded Player

    let badge;
    let badge_observer;
    let enabled;
    let playbackRate;
    let smooth;

    chrome.storage.onChanged.addListener(loadSettings);

    document.addEventListener('_live_catch_up_init', () => {
        const detect_interval = setInterval(() => {
            const player = app.querySelector('div#movie_player');
            if (!player) {
                return;
            }

            badge = player.querySelector('button.ytp-live-badge');
            if (!badge) {
                return;
            }

            clearInterval(detect_interval);

            badge_observer?.disconnect();
            badge_observer = new MutationObserver(() => {
                setPlaybackRate(playbackRate);
            });

            loadSettings();
        }, 500);
    });

    document.addEventListener('_live_catch_up_onPlaybackRateChange', () => {
        if (enabled && !smooth) {
            setPlaybackRate(playbackRate);
        }
    });

    const s = document.createElement('script');
    s.id = '_live_catch_up';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}