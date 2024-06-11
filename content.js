const app = document.querySelector('ytd-app');
if (app) {
    import(chrome.runtime.getURL('common.js')).then(common => {
        main(common);
    });
}

function main(common) {
    let enabled = common.defaultEnabled;
    let playbackRate = common.defaultPlaybackRate;

    function initSettings() {
        chrome.storage.local.get(common.storage, data => {
            enabled = common.value(data.enabled, common.defaultEnabled);
            playbackRate = common.limitRate(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);

            changePlaybackRate(app.querySelector('.ytp-live-badge'));
        });
    }

    initSettings();

    chrome.storage.onChanged.addListener(() => {
        initSettings();
    });

    function setPlaybackRate(playbackRate) {
        for (const media of app.querySelectorAll('video')) {
            media.playbackRate = playbackRate;
        }
    }

    function changePlaybackRate(badge) {
        if (enabled) {
            if (badge) {
                setPlaybackRate(badge.hasAttribute('disabled') ? 1.0 : playbackRate);
            } else {
                // do nothing
            }
        } else {
            setPlaybackRate(1.0);
        }
    }

    new MutationObserver((mutations, observer) => {
        const target = app.querySelector('button.ytp-live-badge');
        if (target) {
            observer.disconnect();
            new MutationObserver(() => changePlaybackRate(target)).observe(target, { attributeFilter: ['disabled'] });
        }
    }).observe(app, { childList: true, subtree: true });
}