let uninitialized = true;
let badge_element_observer;
let badge_attribute_observer;

const app = document.querySelector('ytd-app');
if (app) {
    import(chrome.runtime.getURL('common.js')).then(common => {
        main(common);
    });
}

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            const enabled = common.value(data.enabled, common.defaultEnabled);
            const playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const smooth = common.value(data.smooth, common.defaultSmooth);
            const smoothRate = common.limitValue(data.smoothRate, common.defaultSmoothRate, common.minSmoothRate, common.maxSmoothRate, common.stepSmoothRate);
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);

            reset();

            if (enabled) {
                observeBadgeElement(playbackRate, smooth, smoothRate, smoothThreathold);
            }
        });
    }

    function observeBadgeElement(playbackRate, smooth, smoothRate, smoothThreathold) {
        badge_element_observer = new MutationObserver(() => {
            checkBadgeElement(playbackRate, smooth, smoothRate, smoothThreathold);
        });
        badge_element_observer.observe(app, { childList: true, subtree: true });
        checkBadgeElement(playbackRate, smooth, smoothRate, smoothThreathold);
    }

    function checkBadgeElement(playbackRate, smooth, smoothRate, smoothThreathold) {
        const player = document.querySelector('div#movie_player');
        if (!player) {
            return;
        }

        const media = player.querySelector('video');
        if (!media) {
            return;
        }

        const badge = player.querySelector('button.ytp-live-badge');
        if (!badge || !badge.checkVisibility()) {
            return;
        }

        disconnectBadgeElementObserver();

        if (smooth) {
            sendStartEvent(playbackRate, smoothRate, smoothThreathold);
        } else {
            sendStopEvent();
            observeBadgeAttribute(playbackRate, media, badge);
        }
    }

    function disconnectBadgeElementObserver() {
        badge_element_observer?.disconnect();
        badge_element_observer = undefined;
    }

    function observeBadgeAttribute(playbackRate, media, badge) {
        badge_attribute_observer = new MutationObserver(() => {
            setPlaybackRate(playbackRate, media, badge);
        });
        badge_attribute_observer.observe(badge, { attributeFilter: ['disabled'] });
        setPlaybackRate(playbackRate, media, badge);
    }

    function setPlaybackRate(playbackRate, media, badge) {
        media.playbackRate = badge.hasAttribute('disabled') ? 1.0 : playbackRate;
        media.classList.add('_live_catch_up');
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
        for (const media of app.querySelectorAll('video._live_catch_up')) {
            media.playbackRate = 1.0;
            media.classList.remove('_live_catch_up');
        }
    }

    document.addEventListener('_live_catch_up_init', e => {
        if (uninitialized) {
            uninitialized = false;
            loadSettings();
        }
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