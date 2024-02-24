import(chrome.runtime.getURL('common.js')).then(common => {
    chrome.storage.local.get(common.storage, data => {
        const container = document.querySelector('div#container');

        createRow(container, row => {
            row.appendChild(createLabel('Enabled/Disabled'));
            row.appendChild(createToggle('enabled', data.enabled, common.defaultEnabled));
        });

        createRow(container, row => {
            row.appendChild(createLabel(`Playback rate (${common.minPlaybackRate.toFixed(2)} ~ ${common.maxPlaybackRate.toFixed(2)})`));
            row.appendChild(createInput('playbackRate', data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate));
        });

        createRow(container, row => {
            row.appendChild(createLabel());
            row.appendChild(createLabel());
        });
    });

    function createRow(container, gen) {
        const row = document.createElement('div');
        row.classList.add('row');
        gen(row);
        container.appendChild(row);
    }

    function createLabel(label = '') {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.innerHTML = label;
        return cell;
    }

    function createToggle(key, checked, defaultValue) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.id = key;
        input.classList.add('toggle');
        input.type = 'checkbox';
        input.checked = common.value(checked, defaultValue);
        input.setAttribute('default', defaultValue);
        input.addEventListener('change', () => {
            chrome.storage.local.set({ [key]: input.checked });
        });
        cell.appendChild(input);

        const label = document.createElement('label');
        label.classList.add('switch');
        label.setAttribute('for', key);
        cell.appendChild(label);

        return cell;
    }

    function createInput(key, value, defaultValue, minRate, maxRate, stepRate) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.id = key;
        input.classList.add('rate');
        input.type = 'number';
        input.value = common.limitRate(value, defaultValue, minRate, maxRate, stepRate);
        input.setAttribute('default', defaultValue);
        input.min = minRate;
        input.max = maxRate;
        input.step = stepRate;
        input.addEventListener('change', () => {
            chrome.storage.local.set({ [key]: common.limitRate(input.value, defaultValue, minRate, maxRate, stepRate) });
        });
        cell.appendChild(input);

        return cell;
    }

    let hold;
    let holdTimeout;

    document.querySelector('input#reset').addEventListener('mousedown', () => {
        clearTimeout(holdTimeout);
        document.querySelector('div#reset_progress').classList.add('progress');
        document.querySelector('div#reset_progress').classList.remove('done');
        hold = false;

        holdTimeout = setTimeout(() => {
            document.querySelector('div#reset_progress').classList.remove('progress');
            document.querySelector('div#reset_progress').classList.add('done');
            hold = true;
        }, 1000);
    });

    document.querySelector('input#reset').addEventListener('mouseleave', () => {
        clearTimeout(holdTimeout);
        document.querySelector('div#reset_progress').classList.remove('progress', 'done');
        hold = false;
    });

    document.querySelector('input#reset').addEventListener('mouseup', () => {
        clearTimeout(holdTimeout);
        document.querySelector('div#reset_progress').classList.remove('progress', 'done');

        if (hold) {
            for (const input of document.querySelectorAll('input.toggle')) {
                input.checked = input.getAttribute('default') === 'true';
            }

            for (const input of document.querySelectorAll('input.rate')) {
                input.value = input.getAttribute('default');
            }

            chrome.storage.local.clear();
        }
    });
});
