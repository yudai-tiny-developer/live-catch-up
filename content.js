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
                if (smooth) {
                    search_badge_interval(playbackRate, smoothRate, smoothThreathold * 1000);
                } else {
                    search_badge_observer(playbackRate);
                }
            } else {
                reset_search();
            }
        });
    }

    document.addEventListener('_live_catch_up_init', e => {
        initSettings();
    });

    chrome.storage.onChanged.addListener(() => {
        initSettings();
    });

    function changePlaybackRate(disabled, playbackRate) {
        const media = app.querySelector('video');
        if (media) {
            media.playbackRate = disabled ? 1.0 : playbackRate;
        }
    }

    let parent_observer;
    let badge_observer;

    function reset_search() {
        parent_observer?.disconnect();
        parent_observer = undefined;

        badge_observer?.disconnect();
        badge_observer = undefined;

        document.dispatchEvent(new CustomEvent('_live_catch_up_stop'));
    }

    function observe_badge(playbackRate) {
        const target = app.querySelector('button.ytp-live-badge');
        if (target) {
            changePlaybackRate(target.hasAttribute('disabled'), playbackRate);
            parent_observer?.disconnect();
            parent_observer = undefined;
            badge_observer = new MutationObserver(() => {
                changePlaybackRate(target.hasAttribute('disabled'), playbackRate);
            });
            badge_observer.observe(target, { attributeFilter: ['disabled'] });
        }
    }

    function search_badge_observer(playbackRate) {
        reset_search();
        observe_badge(playbackRate);
        if (!badge_observer) {
            parent_observer = new MutationObserver((mutations, observer) => {
                observe_badge(playbackRate);
            });
            parent_observer.observe(app, { childList: true, subtree: true });
        }
    }

    function search_badge_interval(playbackRate, smoothRate, smoothThreathold) {
        document.dispatchEvent(new CustomEvent('_live_catch_up_start', { detail: { playbackRate, smoothRate, smoothThreathold } }));
    }

    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);

}