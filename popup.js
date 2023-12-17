import(chrome.runtime.getURL('common.js')).then(common => {
    function createLabel(label) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.innerHTML = label;
        return cell;
    }

    function createToggle(id, checked, defaultValue) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.id = id;
        input.classList.add('checkbox');
        input.type = 'checkbox';
        input.checked = checked === undefined ? defaultValue : checked;
        input.setAttribute('default', defaultValue);
        input.addEventListener('change', () => {
            chrome.storage.local.set({ [id]: input.checked });
        });
        cell.appendChild(input);

        const label = document.createElement('label');
        label.classList.add('switch');
        label.setAttribute('for', id);
        cell.appendChild(label);

        return cell;
    }

    function createInput(playbackRate) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

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

        cell.appendChild(input);
        return cell;
    }

    function createEmptyCell() {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        return cell;
    }

    function createRow(id, container, gen) {
        const row = document.createElement('div');
        row.id = id;
        row.classList.add('row');
        gen(row);
        container.appendChild(row);
    }

    chrome.storage.local.get(['enabled', 'playbackRate'], (data) => {
        const container = document.querySelector('div#container');
        let i = 0;

        createRow(`row${i++}`, container, row => {
            row.appendChild(createLabel('Enabled/Disabled'));
            row.appendChild(createToggle('enabled', data.enabled, common.defaultEnabled));
        });

        createRow(`row${i++}`, container, row => {
            row.appendChild(createLabel(`Playback Rate (${common.minPlaybackRate.toFixed(2)} ~ ${common.maxPlaybackRate.toFixed(2)})`));
            row.appendChild(createInput(data.playbackRate));
        });

        createRow(`row${i++}`, container, row => {
            row.appendChild(createEmptyCell());
            row.appendChild(createEmptyCell());
        });
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
