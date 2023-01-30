import(chrome.runtime.getURL('common.js')).then(common => {
    let playbackRate = common.defaultPlaybackRate;

    chrome.storage.local.get(['playbackRate'], (data) => {
        playbackRate = common.limitPlaybackRate(data.playbackRate);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        chrome.storage.local.get(['playbackRate'], (data) => {
            playbackRate = common.limitPlaybackRate(data.playbackRate);
        });
    });

    const app = document.querySelector('ytd-app');
    if (app) {
        new MutationObserver((mutations, observer) => {
            for (const m of mutations) {
                const target = m.target;
                if (target.nodeName === 'BUTTON' && target.classList.contains('ytp-live-badge') && target.classList.contains('ytp-button')) {
                    const video = app.querySelector('video');
                    if (video) {
                        if (target.hasAttribute('disabled')) {
                            video.playbackRate = 1.0;
                        } else {
                            video.playbackRate = playbackRate;
                        }
                        return;
                    }
                }
            }
        }).observe(app, {
            subtree: true,
            childList: true,
        });
    } else {
        console.warn('ytd-app not found');
    }
});
