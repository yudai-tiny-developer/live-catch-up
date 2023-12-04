import(chrome.runtime.getURL('common.js')).then(common => {
    function createLabel(label) {
        const div = document.createElement('div');
        div.classList.add('label');
        div.innerHTML = label;
        return div;
    }

    function createEnabledToggle(checked) {
        const div = document.createElement('div');
        div.classList.add('toggle');

        const input = document.createElement('input');
        input.id = 'enabled';
        input.classList.add('checkbox');
        input.type = 'checkbox';
        input.checked = checked === false ? false : true;
        input.default = 'true';
        input.addEventListener('change', () => {
            chrome.storage.local.set({ 'enabled': input.checked });
        });
        div.appendChild(input);

        const label = document.createElement('label');
        label.classList.add('switch');
        label.setAttribute('for', 'enabled');
        div.appendChild(label);

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

    chrome.storage.local.get(['enabled', 'playbackRate'], (data) => {
        const row1 = document.querySelector('div#row1');
        row1.appendChild(createLabel('Enabled/Disabled'));
        row1.appendChild(createEnabledToggle(data.enabled));

        const row2 = document.querySelector('div#row2');
        row2.appendChild(createLabel(`Playback Rate (${common.minPlaybackRate.toFixed(2)} ~ ${common.maxPlaybackRate.toFixed(2)})`));
        row2.appendChild(createInput(data.playbackRate));
    });
});
