import(chrome.runtime.getURL('common.js')).then(common => {
    const app = document.querySelector('ytd-app');
    if (app) {
        let enabled = common.defaultEnabled;
        let playbackRate = common.defaultPlaybackRate;

        function initSettings() {
            chrome.storage.local.get(common.storage, data => {
                enabled = data.enabled === undefined ? common.defaultEnabled : data.enabled;
                playbackRate = common.limitPlaybackRate(data.playbackRate);

                changePlaybackRate(app.querySelector('.ytp-live-badge'));
            });
        }

        initSettings();

        chrome.storage.onChanged.addListener(() => {
            initSettings();
        });

        function setPlaybackRate(playbackRate) {
            for (const media of document.querySelectorAll('video')) {
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
        }).observe(app, {
            attributeFilter: ['disabled'],
            subtree: true,
        });
    }
});