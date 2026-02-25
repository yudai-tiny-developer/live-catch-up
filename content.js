import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(common);
    }
});

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            const enabled = common.value(data.enabled, common.defaultEnabled);
            const playbackRate = common.limitValue(data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate);
            const showPlaybackRate = common.value(data.showPlaybackRate, common.defaultShowPlaybackRate);
            const showLatency = common.value(data.showLatency, common.defaultShowLatency);
            const showHealth = common.value(data.showHealth, common.defaultShowHealth);
            const showEstimation = common.value(data.showEstimation, common.defaultShowEstimation);
            const showCurrent = common.value(data.showCurrent, common.defaultShowCurrent);
            const smooth = common.value(data.smooth, common.defaultSmooth);
            const smoothThreathold = common.limitValue(data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold);
            const smoothAuto = common.value(data.smoothAuto, common.defaultSmoothAuto);
            const skip = common.value(data.skip, common.defaultSkip);
            const skipThreathold = common.value(data.skipThreathold, common.defaultSkipThreathold);

            sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showHealth, showEstimation, showCurrent, smooth, smoothThreathold, smoothAuto, skip, skipThreathold);
        });
    }

    function sendLoadSettingsEvent(enabled, playbackRate, showPlaybackRate, showLatency, showHealth, showEstimation, showCurrent, smooth, smoothThreathold, smoothAuto, skip, skipThreathold) {
        const detailObject = {
            enabled,
            playbackRate,
            showPlaybackRate,
            showLatency,
            showHealth,
            showEstimation,
            showCurrent,
            smooth,
            smoothThreathold,
            smoothAuto,
            skip,
            skipThreathold,
        };
        const detail = navigator.userAgent.includes('Firefox') ? cloneInto(detailObject, document.defaultView) : detailObject;
        document.dispatchEvent(new CustomEvent('_live_catch_up_load_settings', { detail }));
    }

    let detect_interval;

    chrome.storage.onChanged.addListener(loadSettings);

    document.addEventListener('_live_catch_up_init', () => {
        clearInterval(detect_interval);
        detect_interval = setInterval(() => {
            const player = document.getElementById("movie_player");
            if (!player) {
                return;
            }

            clearInterval(detect_interval);

            loadSettings();
        }, 500);
    });

    const s = document.createElement('script');
    s.id = '_live_catch_up';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}