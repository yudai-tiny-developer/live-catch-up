import(chrome.runtime.getURL('common.js')).then(common =>
    import(chrome.runtime.getURL('settings.js')).then(settings =>
        import(chrome.runtime.getURL('progress.js')).then(progress =>
            chrome.storage.local.get(common.storage, data =>
                main(common, settings, progress, data)
            )
        )
    )
);

function main(common, settings, progress, data) {
    const row_class = 'row';
    const cell_class1 = 'cell1';
    const cell_class2 = 'cell2';
    const inner_cell_class = 'note';
    const toggle_class = 'toggle';
    const label_class = 'switch';
    const input_class = 'rate';
    const progress_class = 'progress';
    const done_class = 'done';

    const container = document.body.querySelector('div#container');
    const reset_button = document.body.querySelector('input#reset');
    const progress_div = document.body.querySelector('div#reset_progress');

    {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class1, common.label.enabled));
        row.appendChild(settings.createToggle(cell_class2, toggle_class, label_class, 'enabled', data.enabled, common.defaultEnabled, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class1, `${common.label.playbackRate} (${common.minPlaybackRate.toFixed(2)} ~ ${common.maxPlaybackRate.toFixed(2)})`));
        row.appendChild(settings.createNumberStepInput(cell_class2, input_class, 'playbackRate', data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class1, common.label.showPlaybackRate));
        row.appendChild(settings.createToggle(cell_class2, toggle_class, label_class, 'showPlaybackRate', data.showPlaybackRate, common.defaultShowPlaybackRate, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class1, common.label.showLatency));
        row.appendChild(settings.createToggle(cell_class2, toggle_class, label_class, 'showLatency', data.showLatency, common.defaultShowLatency, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class1, common.label.smooth));
        row.appendChild(settings.createToggle(cell_class2, toggle_class, label_class, 'smooth', data.smooth, common.defaultSmooth, common.value, 'div.aggressive-mode'));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        const note = settings.createNote(cell_class1, inner_cell_class, common.label.smooth_desc);
        row.appendChild(note);
        row.appendChild(settings.createLabel(cell_class2));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        row.appendChild(settings.createLabel(cell_class1, common.label.smoothThreathold));
        row.appendChild(settings.createNumberStepInput(cell_class2, input_class, 'smoothThreathold', data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        row.appendChild(settings.createLabel(cell_class1, common.label.slowdownAtLiveHead));
        row.appendChild(settings.createToggle(cell_class2, toggle_class, label_class, 'slowdownAtLiveHead', data.slowdownAtLiveHead, common.defaultSlowdownAtLiveHead, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        row.appendChild(settings.createLabel(cell_class1, common.label.keepBufferHealth));
        row.appendChild(settings.createToggle(cell_class2, toggle_class, label_class, 'keepBufferHealth', data.keepBufferHealth, common.defaultKeepBufferHealth, common.value));
        container.appendChild(row);
    }

    settings.registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, input_class, progress);

    for (const div of document.querySelectorAll('div.aggressive-mode')) {
        div.style.display = data.smooth ? '' : 'none';
    }
}