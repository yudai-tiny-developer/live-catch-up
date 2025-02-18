let badge_element_observer;
let badge_attribute_observer;
let player;
let media;
let badge;

import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(document.querySelector('ytd-app') || document.body, common);
    }
});

function main(app, common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            const enabled = common.value(data.enabled, common.defaultEnabled);
            const playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const showPlaybackRate = common.value(data.showPlaybackRate, common.defaultShowPlaybackRate);
            const showLatency = common.value(data.showLatency, common.defaultShowLatency);
            const showEstimation = common.value(data.showEstimation, common.defaultShowEstimation);
            const smooth = common.value(data.smooth, common.defaultSmooth);
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);
            const slowdownAtLiveHead = common.value(data.slowdownAtLiveHead, common.defaultSlowdownAtLiveHead);
            const keepBufferHealth = common.value(data.keepBufferHealth, common.defaultKeepBufferHealth);

            disconnectBadgeElementObserver();
            disconnectBadgeAttributeObserver();

            sendSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showEstimation, smooth, smoothThreathold, slowdownAtLiveHead, keepBufferHealth);

            if (enabled) {
                if (!smooth) {
                    observeBadgeElement(playbackRate);
                }
            } else {
                setPlaybackRate();
            }
        });
    }

    function observeBadgeElement(playbackRate) {
        badge_element_observer = new MutationObserver(() => {
            observeBadgeAttributeIfVisibled(playbackRate);
        });
        badge_element_observer.observe(app, { childList: true, subtree: true });
        observeBadgeAttributeIfVisibled(playbackRate);
    }

    function detectElements() {
        if (!player) {
            player = app.querySelector('div#movie_player');
            if (!player) {
                sendResetPlaybackRateEvent();
                return false;
            }
        }

        if (!media) {
            media = player.querySelector('video.video-stream');
            if (!media) {
                sendResetPlaybackRateEvent();
                return false;
            }
        }

        if (!badge) {
            badge = player.querySelector('button.ytp-live-badge');
            if (!badge) {
                sendResetPlaybackRateEvent();
                return false;
            }
        }

        if (badge && is_DisplayNone(badge)) {
            sendResetPlaybackRateEvent();
            return false;
        }

        return true;
    }

    function observeBadgeAttributeIfVisibled(playbackRate) {
        if (detectElements()) {
            if (badge.checkVisibility()) {
                disconnectBadgeElementObserver();
                observeBadgeAttribute(playbackRate);
            }
        }
    }

    function disconnectBadgeElementObserver() {
        badge_element_observer?.disconnect();
        badge_element_observer = undefined;
    }

    function observeBadgeAttribute(playbackRate) {
        if (detectElements()) {
            badge_attribute_observer = new MutationObserver(() => {
                setPlaybackRate(playbackRate);
            });
            badge_attribute_observer.observe(badge, { attributeFilter: ['disabled'] });
            setPlaybackRate(playbackRate);
        }
    }

    function setPlaybackRate(playbackRate) {
        if (detectElements()) {
            if (badge.hasAttribute('disabled') || !playbackRate) {
                sendResetPlaybackRateEvent();
            } else {
                media.playbackRate = playbackRate;
            }
        }
    }

    function disconnectBadgeAttributeObserver() {
        badge_attribute_observer?.disconnect();
        badge_attribute_observer = undefined;
    }

    function sendSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showEstimation, smooth, smoothThreathold, slowdownAtLiveHead, keepBufferHealth) {
        const detailObject = {
            enabled: enabled && smooth,
            playbackRate,
            showPlaybackRate,
            showLatency,
            showEstimation,
            smoothThreathold,
            slowdownAtLiveHead,
            keepBufferHealth
        };
        const detail = navigator.userAgent.includes('Firefox') ? cloneInto(detailObject, document.defaultView) : detailObject;
        document.dispatchEvent(new CustomEvent('_live_catch_up_settings', { detail }));
    }

    function sendResetPlaybackRateEvent() {
        document.dispatchEvent(new CustomEvent('_live_catch_up_reset_playback_rate'));
    }

    function is_DisplayNone(node) {
        const compStyles = getComputedStyle(node);
        const propertyValue = compStyles.getPropertyValue('display');
        return propertyValue === 'none';
    }

    document.addEventListener('_live_catch_up_init', () => {
        loadSettings();
    });

    chrome.storage.onChanged.addListener(() => {
        loadSettings();
    });

    const s = document.createElement('script');
    s.id = '_live_catch_up';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}