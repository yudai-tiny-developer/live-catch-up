import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(common);
    }
});

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            const enabled = common.value(data.enabled, common.defaultEnabled);
            const playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const showPlaybackRate = common.value(data.showPlaybackRate, common.defaultShowPlaybackRate);
            const showLatency = common.value(data.showLatency, common.defaultShowLatency);
            const showEstimation = common.value(data.showEstimation, common.defaultShowEstimation);
            const smooth = common.value(data.smooth, common.defaultSmooth);

            sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showEstimation, smooth);

            badge_observer?.disconnect();

            if (enabled) {
                setPlaybackRate(playbackRate);
                if (!smooth) {
                    observe_app(document, playbackRate);
                }
            } else {
                setPlaybackRate();
            }
        });
    }

    function sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showEstimation, smooth) {
        const detailObject = {
            enabled: enabled && smooth,
            playbackRate,
            showPlaybackRate,
            showLatency,
            showEstimation,
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

    function observe(node, query, callback, param) {
        new MutationObserver((mutations, observer) => {
            const target = document.querySelector(query);
            if (target && callback(target, param)) {
                observer.disconnect();
            }
        }).observe(node, { childList: true, subtree: true });
    }

    function observe_app(node, param) {
        observe(node, 'ytd-app', observe_player, param);
        return true;
    }

    function observe_player(node, param) {
        observe(node, 'div#movie_player', observe_main, param);
        return true;
    }

    function observe_main(node, param) {
        video = node.querySelector('video.html5-main-video');
        badge = node.querySelector('button.ytp-live-badge');
        if (badge) {
            badge_observer = new MutationObserver(() => {
                setPlaybackRate(param);
            });
            badge_observer.observe(badge, { attributeFilter: ['disabled'] })
            return true;
        } else {
            return false;
        }
    }

    let video;
    let badge;
    let badge_observer;

    chrome.storage.onChanged.addListener(loadSettings);

    document.addEventListener('_live_catch_up_init', loadSettings);

    const s = document.createElement('script');
    s.id = '_live_catch_up';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}