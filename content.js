import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(common);
    }
});

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            const enabled = common.value(data.enabled, common.defaultEnabled);
            playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const showPlaybackRate = common.value(data.showPlaybackRate, common.defaultShowPlaybackRate);
            const showLatency = common.value(data.showLatency, common.defaultShowLatency);
            const showHealth = common.value(data.showHealth, common.defaultShowHealth);
            const showEstimation = common.value(data.showEstimation, common.defaultShowEstimation);
            const smooth = common.value(data.smooth, common.defaultSmooth);
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);

            sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showHealth, showEstimation, smooth, smoothThreathold);

            if (enabled) {
                if (smooth) {
                    setPlaybackRate(playbackRate);
                }
            } else {
                setPlaybackRate();
            }
        });
    }

    function sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showHealth, showEstimation, smooth, smoothThreathold) {
        const detailObject = {
            enabled: enabled && smooth,
            playbackRate,
            showPlaybackRate,
            showLatency,
            showHealth,
            showEstimation,
            smoothThreathold,
        };
        const detail = navigator.userAgent.includes('Firefox') ? cloneInto(detailObject, document.defaultView) : detailObject;
        document.dispatchEvent(new CustomEvent('_live_catch_up_load_settings', { detail }));
    }

    function setPlaybackRate(playbackRate) {
        if (playbackRate === undefined) { // force reset
            if (is_live()) {
                sendResetPlaybackRateEvent();
            } else {
                // do nothing
            }
        } else if (is_live()) {
            if (is_live_head()) {
                sendResetPlaybackRateEvent();
            } else {
                sendSetPlaybackRateEvent(playbackRate);
            }
        } else {
            sendResetPlaybackRateEvent();
        }
    }

    function is_live() {
        return badge?.parentNode.classList.contains('ytp-live');
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
    let playbackRate;

    chrome.storage.onChanged.addListener(loadSettings);
    document.addEventListener('_live_catch_up_init', loadSettings);

    const detect_interval = setInterval(() => {
        badge = app.querySelector('button.ytp-live-badge');
        if (badge) {
            clearInterval(detect_interval);
            new MutationObserver(() => {
                setPlaybackRate(playbackRate);
            }).observe(badge, { attributeFilter: ['disabled'] })
        }
    }, 200);

    const s = document.createElement('script');
    s.id = '_live_catch_up';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}