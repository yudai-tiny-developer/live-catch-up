import(chrome.runtime.getURL('common.js')).then(common => {
    let enabled = common.defaultEnabled;
    let playbackRate = common.defaultPlaybackRate;

    function initSettings() {
        chrome.storage.local.get(common.storage, data => {
            enabled = common.value(data.enabled, common.defaultEnabled);
            playbackRate = common.limitRate(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);

            changePlaybackRate(document.body.querySelector('.ytp-live-badge'));
        });
    }

    initSettings();

    chrome.storage.onChanged.addListener(() => {
        initSettings();
    });

    function setPlaybackRate(playbackRate) {
        for (const media of document.body.querySelectorAll('video')) {
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

    new MutationObserver(mutations => {
        mutations.filter(m => {
            return m.target.classList.contains('ytp-live-badge');
        }).forEach(m => {
            changePlaybackRate(m.target);
        });
    }).observe(document, {
        attributeFilter: ['disabled'],
        subtree: true,
    });
});