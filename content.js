import(chrome.runtime.getURL('common.js')).then(common => {
    let playbackRate = common.defaultPlaybackRate;

    const app = document.querySelector('ytd-app');
    if (app) {
        function changePlaybackRate(badge = app.querySelector('.ytp-live-badge')) {
            if (badge?.hasAttribute('disabled') === false) {
                setPlaybackRate(playbackRate);
            }
        }

        function initPlaybackRate() {
            chrome.storage.local.get(['playbackRate'], (data) => {
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
