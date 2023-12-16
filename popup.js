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
        input.checked = checked === undefined ? common.defaultEnabled : checked;
        input.setAttribute('default', 'true');
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
        input.classList.add('rate');
        input.type = 'number';
        input.min = common.minPlaybackRate;
        input.max = common.maxPlaybackRate;
        input.step = common.stepPlaybackRate;
        input.value = common.limitPlaybackRate(playbackRate);
        input.setAttribute('default', common.defaultPlaybackRate);
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

    document.querySelector('input#reset').addEventListener('click', () => {
        for (const input of document.querySelectorAll('input.checkbox')) {
            input.checked = input.getAttribute('default') === 'true';
        }
        for (const input of document.querySelectorAll('input.rate')) {
            input.value = input.getAttribute('default');
        }

        chrome.storage.local.clear();
    });
});
