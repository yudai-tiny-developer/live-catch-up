import(chrome.runtime.getURL('common.js')).then(common => {
    let enabled = common.defaultEnabled;
    let playbackRate = common.defaultPlaybackRate;

    const app = document.querySelector('ytd-app');
    if (app) {
        function changePlaybackRate(badge = app.querySelector('.ytp-live-badge')) {
            if (enabled) {
                if (badge) {
                    if (badge.hasAttribute('disabled')) {
                        setPlaybackRate(1.0);
                    } else {
                        setPlaybackRate(playbackRate);
                    }
                }
            } else {
                setPlaybackRate(1.0);
            }
        }

        function initPlaybackRate() {
            chrome.storage.local.get(['enabled', 'playbackRate'], (data) => {
                enabled = data.enabled === undefined ? common.defaultEnabled : data.enabled;
                playbackRate = common.limitPlaybackRate(data.playbackRate);
                changePlaybackRate();
            });
        }

        function setPlaybackRate(playbackRate) {
            const video = app.querySelector('video');
            if (video) {
                video.playbackRate = playbackRate;
            }
        }

        initPlaybackRate();

        chrome.storage.onChanged.addListener((changes, namespace) => {
            initPlaybackRate();
        });

        new MutationObserver((mutations, observer) => {
            for (const m of mutations) {
                if (m.target.classList.contains('ytp-live-badge')) {
                    changePlaybackRate(m.target);
                    return;
                }
            }
        }).observe(app, {
            attributeFilter: ['disabled'],
            subtree: true,
        });
    } else {
        console.warn('ytd-app not found');
    }
});
