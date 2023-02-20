import(chrome.runtime.getURL('common.js')).then(common => {
    function createLabel() {
        const div = document.createElement('div');
        div.id = 'label';
        div.innerHTML = `Playback Rate (${common.minPlaybackRate.toFixed(2)} ~ ${common.maxPlaybackRate.toFixed(2)})`;
        return div;
    }

    function createInput(playbackRate) {
        const input = document.createElement('input');
        input.id = 'playbackRate';
        input.type = 'number';
        input.min = common.minPlaybackRate;
        input.max = common.maxPlaybackRate;
        input.step = common.stepPlaybackRate;
        input.value = common.limitPlaybackRate(playbackRate);
        input.addEventListener('change', () => {
            chrome.storage.local.set({ 'playbackRate': common.limitPlaybackRate(input.value) });
        });
        return input;
    }

    chrome.storage.local.get(['playbackRate'], (data) => {
        const div = document.querySelector('div#container');
        div.appendChild(createLabel());
        div.appendChild(createInput(data.playbackRate));
    });
});
