import(chrome.runtime.getURL('common.js')).then(common => {
    chrome.storage.local.get(['playbackRate'], (data) => {
        const input = document.createElement('input');
        input.id = 'playbackRate';
        input.type = 'number';
        input.min = common.minPlaybackRate;
        input.max = common.maxPlaybackRate;
        input.step = common.stepPlaybackRate;
        input.value = common.limitPlaybackRate(data.playbackRate);
        input.addEventListener('change', () => {
            chrome.storage.local.set({ 'playbackRate': common.limitPlaybackRate(input.value) });
        });

        const div = document.querySelector('div#container');
        div.appendChild(input);
    });
});
