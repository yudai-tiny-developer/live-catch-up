const app = document.querySelector('ytd-app');
if (app) {
    import(chrome.runtime.getURL('common.js')).then(common => {
        main(common);
    });
}

function main(common) {
    function initSettings() {
        chrome.storage.local.get(common.storage, data => {
            const enabled = common.value(data.enabled, common.defaultEnabled);
            const playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const smooth = common.value(data.smooth, common.defaultSmooth);
            const smoothRate = common.limitValue(data.smoothRate, common.defaultSmoothRate, common.minSmoothRate, common.maxSmoothRate, common.stepSmoothRate);
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);

            if (enabled) {
                observeBadgeElement(smooth, playbackRate, smoothRate, smoothThreathold);
            } else {
                // do nothing
            }
        });
    }

    document.addEventListener('_live_catch_up_init', e => {
        initSettings();
    });

    document.addEventListener('_live_catch_up_reinit', e => {
        reset();
        initSettings();
    });

    chrome.storage.onChanged.addListener(() => {
        reset();
        initSettings();
    });

    let badge_element_observer;
    let badge_attribute_observer;

    function observeBadgeElement(smooth, playbackRate, smoothRate, smoothThreathold) {
        badge_element_observer = new MutationObserver(() => {
            startPlaybackRateChanging(smooth, playbackRate, smoothRate, smoothThreathold);
        });
        badge_element_observer.observe(app, { childList: true, subtree: true });
        startPlaybackRateChanging(smooth, playbackRate, smoothRate, smoothThreathold);
    }

    function disconnectBadgeElementObserver() {
        badge_element_observer?.disconnect();
        badge_element_observer = undefined;
    }

    function startPlaybackRateChanging(smooth, playbackRate, smoothRate, smoothThreathold) {
        const player = app.querySelector('div#movie_player');
        if (player) {
            const media = player.querySelector('video');
            const badge = player.querySelector('button.ytp-live-badge');
            if (media && badge) {
                disconnectBadgeElementObserver();
                if (smooth) {
                    sendStartEvent(playbackRate, smoothRate, smoothThreathold);
                } else {
                    observeBadgeAttribute(playbackRate, media, badge);
                }
            } else {
                // continue observing
            }
        } else {
            // continue observing
        }
    }

    function observeBadgeAttribute(playbackRate, media, badge) {
        badge_attribute_observer = new MutationObserver(() => {
            media.playbackRate = badge.hasAttribute('disabled') ? 1.0 : playbackRate;
        });
        badge_attribute_observer.observe(badge, { attributeFilter: ['disabled'] });
        media.playbackRate = badge.hasAttribute('disabled') ? 1.0 : playbackRate;
    }

    function disconnectBadgeAttributeObserver() {
        badge_attribute_observer?.disconnect();
        badge_attribute_observer = undefined;
    }

    function sendStartEvent(playbackRate, smoothRate, smoothThreathold) {
        if (navigator.userAgent.includes('Firefox')) {
            document.dispatchEvent(new CustomEvent('_live_catch_up_start',
                {
                    detail: cloneInto(
                        {
                            playbackRate,
                            smoothRate,
                            smoothThreathold
                        },
                        document.defaultView)
                }
            ));
        } else {
            document.dispatchEvent(new CustomEvent('_live_catch_up_start',
                {
                    detail: {
                        playbackRate,
                        smoothRate,
                        smoothThreathold
                    }
                }
            ));
        }
    }

    function sendStopEvent() {
        document.dispatchEvent(new CustomEvent('_live_catch_up_stop'));
    }

    function reset() {
        disconnectBadgeElementObserver();
        disconnectBadgeAttributeObserver();
        sendStopEvent();
        resetPlaybackRate();
    }

    function resetPlaybackRate() {
        for (const media of app.querySelectorAll('video')) {
            media.playbackRate = 1.0;
        }
    }

    const s = document.createElement('script');
    s.id = '_live_catch_up';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}