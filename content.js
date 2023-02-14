import(chrome.runtime.getURL('common.js')).then(common => {
    let playbackRate = common.defaultPlaybackRate;

    const app = document.querySelector('ytd-app');
    if (app) {
        function changePlaybackRate(badge = app.querySelector('.ytp-live-badge')) {
            if (badge) {
                if (badge.hasAttribute('disabled')) {
                    setPlaybackRate(1.0);
                } else {
                    setPlaybackRate(playbackRate);
                }
            }
        }

        function initPlaybackRate() {
            chrome.storage.local.get(['playbackRate'], (data) => {
                playbackRate = common.limitPlaybackRate(data.playbackRate);
                changePlaybackRate();
            });
        }

        function setPlaybackRate(playbackRate) {
            window.postMessage({ playbackRate: playbackRate }, '*');
        }

        function insertAPI() {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('api.js');
            script.onLoad = () => {
                this.remove();
            };
            document.head.appendChild(script);
        }

        insertAPI();
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
