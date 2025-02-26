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
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);

            sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showEstimation, smooth, smoothThreathold);

            badge_observer?.disconnect();
            container_observer?.disconnect();

            if (enabled) {
                if (smooth) {
                    setPlaybackRate(playbackRate);
                } else {
                    container_observer = is_embedded_player ? observe_player(document, playbackRate) : observe_app(document, playbackRate);
                }
            } else {
                setPlaybackRate();
            }
        });
    }

    function sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showEstimation, smooth, smoothThreathold) {
        const detailObject = {
            enabled: enabled && smooth,
            playbackRate,
            showPlaybackRate,
            showLatency,
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

    function observe(node, query, callback, param) {
        const target = node.querySelector(query);
        if (target) {
            return callback(target, param);
        } else {
            const observer = new MutationObserver((mutations, observer) => {
                const target = node.querySelector(query);
                if (target && callback(target, param)) {
                    observer.disconnect();
                }
            });
            observer.observe(node, { childList: true, subtree: true });
            return observer;
        }
    }

    function observe_app(node, param) {
        return observe(node, 'ytd-app', observe_player, param);
    }

    function observe_player(node, param) {
        return observe(node, 'div#movie_player', observe_main, param);
    }

    function observe_main(node, param) {
        video = node.querySelector('video.html5-main-video');
        badge = node.querySelector('button.ytp-live-badge');
        if (badge) {
            setPlaybackRate(param);
            badge_observer = new MutationObserver(() => {
                setPlaybackRate(param);
            });
            badge_observer.observe(badge, { attributeFilter: ['disabled'] })
            return badge_observer;
        }
    }

    function inject() {
        const s = document.createElement('script');
        s.id = '_live_catch_up';
        s.src = chrome.runtime.getURL('inject.js');
        s.onload = () => s.remove();
        (document.head || document.documentElement).append(s);
    }

    let video;
    let badge;
    let container_observer;
    let badge_observer;
    let is_embedded_player;

    chrome.storage.onChanged.addListener(loadSettings);

    document.addEventListener('_live_catch_up_init', loadSettings);

    const init_interval = setInterval(() => {
        if (document.readyState === 'complete') {
            const app = document.querySelector('ytd-app');
            if (app) { // YouTube.com Player
                clearInterval(init_interval);
                is_embedded_player = false;
                inject();
                return;
            }

            const player = document.querySelector('div#movie_player');
            if (player) { // Embedded Player
                clearInterval(init_interval);
                is_embedded_player = true;
                inject();
                return;
            }
        }
    }, 200);
}