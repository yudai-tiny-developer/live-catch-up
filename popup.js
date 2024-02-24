import(chrome.runtime.getURL('common.js')).then(common =>
    import(chrome.runtime.getURL('progress.js')).then(progress =>
        main(common, progress)
    )
);

function main(common, progress) {
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

    const reset_button = document.querySelector('input#reset');

    reset_button.addEventListener('mousedown', () => progress.startProgress());
    reset_button.addEventListener('touchstart', () => progress.startProgress());
    reset_button.addEventListener('mouseleave', () => progress.cancelProgress());
    reset_button.addEventListener('touchmove', event => {
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target !== reset_button) {
            progress.cancelProgress();
        }
    });
    reset_button.addEventListener('touchcancel', () => progress.cancelProgress());
    reset_button.addEventListener('mouseup', () => progress.endProgress(resetSettings));
    reset_button.addEventListener('touchend', () => progress.endProgress(resetSettings));

    function resetSettings() {
        if (progress.isDone()) {
            for (const input of document.querySelectorAll('input.toggle')) {
                input.checked = input.getAttribute('default') === 'true';
            }

            for (const input of document.querySelectorAll('input.rate')) {
                input.value = input.getAttribute('default');
            }

            chrome.storage.local.clear();
        }
    }
}