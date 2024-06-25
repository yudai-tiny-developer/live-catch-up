let badge_element_observer;
let badge_attribute_observer;
let player;
let media;
let badge;

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
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);
            const slowdownAtLiveHead = common.value(data.slowdownAtLiveHead, common.defaultSlowdownAtLiveHead);
            const disablePremiere = common.value(data.disablePremiere, common.defaultDisablePremiere);

            if (enabled) {
                reset();
                observeBadgeElement(playbackRate, smooth, smoothThreathold, slowdownAtLiveHead, disablePremiere);
            } else {
                reset(true);
            }
        });
    }

    function observeBadgeElement(playbackRate, smooth, smoothThreathold, slowdownAtLiveHead, disablePremiere) {
        badge_element_observer = new MutationObserver(() => {
            checkBadgeElement(playbackRate, smooth, smoothThreathold, slowdownAtLiveHead, disablePremiere);
        });
        badge_element_observer.observe(app, { childList: true, subtree: true });
        checkBadgeElement(playbackRate, smooth, smoothThreathold, slowdownAtLiveHead, disablePremiere);
    }

    function checkBadgeElement(playbackRate, smooth, smoothThreathold, slowdownAtLiveHead, disablePremiere) {
        if (!badge || !media || !player) {
            player = app.querySelector('div#movie_player');
            if (!player) {
                media = undefined;
                badge = undefined;
                return;
            }

            media = player.querySelector('video.video-stream');
            if (!media) {
                badge = undefined;
                return;
            }

            badge = player.querySelector('button.ytp-live-badge');
            if (!badge) {
                return;
            }
        }

        if (badge.checkVisibility()) {
            disconnectBadgeElementObserver();
            if (smooth) {
                sendStartEvent(playbackRate, smoothThreathold, slowdownAtLiveHead, disablePremiere);
            } else {
                sendStopEvent();
                observeBadgeAttribute(playbackRate, media, badge);
            }
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
    }

    function disconnectBadgeAttributeObserver() {
        badge_attribute_observer?.disconnect();
        badge_attribute_observer = undefined;
    }

    function sendStartEvent(playbackRate, smoothThreathold, slowdownAtLiveHead, disablePremiere) {
        if (navigator.userAgent.includes('Firefox')) {
            document.dispatchEvent(new CustomEvent('_live_catch_up_start',
                {
                    detail: cloneInto(
                        {
                            enabled: true,
                            playbackRate,
                            smoothThreathold,
                            slowdownAtLiveHead,
                            disablePremiere
                        },
                        document.defaultView)
                }
            ));
        } else {
            document.dispatchEvent(new CustomEvent('_live_catch_up_start',
                {
                    detail: {
                        enabled: true,
                        playbackRate,
                        smoothThreathold,
                        slowdownAtLiveHead,
                        disablePremiere
                    }
                }
            ));
        }
    }

    function sendStopEvent(resetPlaybackRate = false) {
        if (navigator.userAgent.includes('Firefox')) {
            document.dispatchEvent(new CustomEvent('_live_catch_up_stop', { detail: cloneInto({ resetPlaybackRate }, document.defaultView) }));
        } else {
            document.dispatchEvent(new CustomEvent('_live_catch_up_stop', { detail: { resetPlaybackRate } }));
        }
    }

    function reset(resetPlaybackRate = false) {
        badge = undefined;
        media = undefined;
        player = undefined;
        disconnectBadgeElementObserver();
        disconnectBadgeAttributeObserver();
        sendStopEvent(resetPlaybackRate);
    }

    document.addEventListener('_live_catch_up_init', e => {
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