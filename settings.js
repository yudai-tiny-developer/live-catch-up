export function createRow(row_class) {
    const div = document.createElement('div');
    div.classList.add(row_class);
    return div;
}

export function createLabel(cell_class, label, help) {
    const div = document.createElement('div');
    div.classList.add(cell_class);
    div.innerHTML = label ?? '';

    if (help) {
        const msg = document.createElement('button');
        msg.classList.add('help');
        msg.innerHTML = help;
        function hide() {
            msg.style.display = '';
        }
        msg.addEventListener('click', hide);
        msg.addEventListener('blur', hide);
        div.appendChild(msg);

        const svg = document.createElement('span');
        svg.classList.add('help');
        svg.innerHTML = '<svg class="help" viewBox="0 0 512 512" style="width: 1em; height: 1em;" xml:space="preserve"><g><path d="M319.39,143.59c-7.707-6.578-16.953-11.706-27.738-15.374c-10.789-3.668-22.702-5.504-35.738-5.504 c-12.332,0-23.68,2.007-34.051,6.027c-10.375,4.019-19.469,9.758-27.293,17.211c-7.824,7.457-14.168,16.484-19.027,27.082 c-3.106,6.774-5.461,14.07-7.066,21.886c-1.461,7.13,4.246,13.754,11.644,13.754h21.462c7.878,0,14.582-5.293,16.699-12.75 c6.281-22.133,18.945-33.199,37.988-33.199c5.687,0,10.875,0.902,15.558,2.707c4.68,1.809,8.711,4.34,12.09,7.602 c3.379,3.262,6.016,7.074,7.914,11.442c1.894,4.371,2.844,9.176,2.844,14.414c0,2.797-0.211,5.391-0.622,7.778 c-0.418,2.39-1.511,4.953-3.293,7.687c-1.778,2.738-4.414,5.883-7.91,9.434c-3.5,3.555-8.269,7.836-14.312,12.844 c-13.989,11.414-23.649,22.481-28.985,33.195c-2.726,5.477-4.71,12.875-5.957,22.192c-1.23,9.226-1.91,13.171-2.039,26.254 c0,0.07-0.004,0.129-0.004,0.199h0.004c0,0.058-0.004,0.102-0.004,0.16h46.051c0-19.57,1.363-24.75,4.09-30.461 c1.301-2.906,3.91-6.375,7.824-10.394c3.91-4.02,9.066-8.649,15.469-13.89c12.973-10.504,22.09-20.294,27.794-29.462 c0.05-0.082,0.102-0.16,0.152-0.242c0.75-1.223,1.66-2.469,2.282-3.668c5.691-10.133,8.535-21.371,8.535-33.719 c0-10.714-2.134-20.617-6.402-29.703C333.082,158.004,327.094,150.172,319.39,143.59z""></path><path d="M279.422,337.446h-47.55c-1.645,0-2.977,1.312-2.977,2.926v45.992c0,1.618,1.332,2.93,2.977,2.93h47.55 c1.645,0,2.981-1.312,2.981-2.93v-45.992C282.402,338.758,281.066,337.446,279.422,337.446z"></path><path d="M256,0C114.614,0,0,114.614,0,256s114.614,256,256,256s256-114.614,256-256S397.386,0,256,0z M256,448 c-105.867,0-192-86.133-192-192S150.133,64,256,64s192,86.133,192,192S361.867,448,256,448z"></path></g></svg></span>';
        svg.addEventListener('click', () => {
            const rect = div.getBoundingClientRect();
            msg.style.left = `${rect.left + rect.width / 2.0}px`;
            msg.style.display = 'inline';
            msg.focus();
        });
        div.appendChild(svg);
    }

    return div;
}

export function createNote(cell_class, inner_cell_class, label) {
    const div = document.createElement('div');
    div.classList.add(cell_class);

    const inner_div = document.createElement('div');
    inner_div.classList.add(inner_cell_class);
    inner_div.innerHTML = label ?? '';

    div.appendChild(inner_div);
    return div;
}

export function createToggle(cell_class, toggle_class, label_class, key, checked, defaultValue, checkForDefault, selector) {
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

        for (const div of document.querySelectorAll(selector)) {
            div.style.display = input.checked ? '' : 'none';
        }
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

function resetSettings(args) { // FIXME: selector args
    for (const input of document.body.querySelectorAll('input.' + args.toggle_class)) {
        input.checked = input.getAttribute('defaultValue') === 'true';
    }

    for (const input of document.body.querySelectorAll('input.' + args.input_class)) {
        input.value = input.getAttribute('defaultValue');
    }

    for (const div of document.body.querySelectorAll('div.aggressive-mode')) {
        div.style.display = 'none';
    }

    chrome.storage.local.clear();
}