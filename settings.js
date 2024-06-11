export function createRow(row_class) {
    const div = document.createElement('div');
    div.classList.add(row_class);
    return div;
}

export function createLabel(cell_class, label = '') {
    const div = document.createElement('div');
    div.classList.add(cell_class);
    div.innerHTML = label;
    return div;
}

export function createToggle(cell_class, toggle_class, label_class, key, checked, defaultValue, checkForDefault) {
    const div = document.createElement('div');
    div.classList.add(cell_class);

    const input = document.createElement('input');
    input.id = key;
    input.classList.add(toggle_class);
    input.type = 'checkbox';
    input.checked = checkForDefault(checked, defaultValue);

    input.setAttribute('defaultValue', defaultValue);
    input.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: input.checked });
    });
    div.appendChild(input);

    const label = document.createElement('label');
    label.classList.add(label_class);
    label.setAttribute('for', key);
    div.appendChild(label);

    return div;
}

export function createNumberStepInput(cell_class, input_class, key, value, defaultValue, minRate, maxRate, stepRate, limitRate) {
    const div = document.createElement('div');
    div.classList.add(cell_class);

    const input = document.createElement('input');
    input.id = key;
    input.classList.add(input_class);
    input.type = 'number';
    input.value = limitRate(value, defaultValue, minRate, maxRate, stepRate);
    input.setAttribute('defaultValue', defaultValue);
    input.min = minRate;
    input.max = maxRate;
    input.step = stepRate;
    input.addEventListener('change', () => {
        chrome.storage.local.set({ [key]: limitRate(input.value, defaultValue, minRate, maxRate, stepRate) });
    });
    div.appendChild(input);

    return div;
}

let state = {};

export function registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, input_class, progress) {
    reset_button.addEventListener('mousedown', () => progress.startProgress(progress_div, progress_class, done_class, state));
    reset_button.addEventListener('touchstart', () => progress.startProgress(progress_div, progress_class, done_class, state));

    reset_button.addEventListener('mouseleave', () => progress.endProgress(progress_div, progress_class, done_class, state));
    reset_button.addEventListener('touchmove', event => {
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target !== reset_button) {
            progress.endProgress(progress_div, progress_class, done_class, state);
        }
    });
    reset_button.addEventListener('touchcancel', () => progress.endProgress(progress_div, progress_class, done_class, state));

    reset_button.addEventListener('mouseup', () => progress.endProgress(progress_div, progress_class, done_class, state, resetSettings, { toggle_class, input_class }));
    reset_button.addEventListener('touchend', event => {
        event.preventDefault();
        progress.endProgress(progress_div, progress_class, done_class, state, resetSettings, { toggle_class, input_class });
    });
}

function resetSettings(args) {
    for (const input of document.body.querySelectorAll('input.' + args.toggle_class)) {
        input.checked = input.getAttribute('defaultValue') === 'true';
    }

    for (const input of document.body.querySelectorAll('input.' + args.input_class)) {
        input.value = input.getAttribute('defaultValue');
    }

    chrome.storage.local.clear();
}