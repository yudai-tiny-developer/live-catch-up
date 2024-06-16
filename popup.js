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
    const cell_class = 'cell';
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
        row.appendChild(settings.createLabel(cell_class, 'Enabled/Disabled'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'enabled', data.enabled, common.defaultEnabled, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, `Playback rate (${common.minPlaybackRate.toFixed(2)} ~ ${common.maxPlaybackRate.toFixed(2)})`));
        row.appendChild(settings.createNumberStepInput(cell_class, input_class, 'playbackRate', data.playbackRate, common.defaultPlaybackRate, common.minPlaybackRate, common.maxPlaybackRate, common.stepPlaybackRate, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class));
        row.appendChild(settings.createLabel(cell_class));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, 'Aggressive mode (High CPU load)'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'smooth', data.smooth, common.defaultSmooth, common.value, 'div.aggressive-mode'));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        const note = settings.createLabel(cell_class,
            '<strong>CAUTION</strong>'
            + '<br>' +
            'Aggressive mode may cause frequent video pauses.'
        );
        note.classList.add('note');
        row.appendChild(note);
        row.appendChild(settings.createLabel(cell_class));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        row.appendChild(settings.createLabel(cell_class, 'Latency check interval (ms)'));
        row.appendChild(settings.createNumberStepInput(cell_class, input_class, 'smoothRate', data.smoothRate, common.defaultSmoothRate, common.minSmoothRate, common.maxSmoothRate, common.stepSmoothRate, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode', 'note');
        const note = settings.createLabel(cell_class,
            `${common.maxSmoothRate.toFixed(0)} ms: Lower CPU load`
            + '<br>' +
            `${common.minSmoothRate.toFixed(0)} ms: Higher CPU load`
        );
        note.classList.add('note');
        row.appendChild(note);
        row.appendChild(settings.createLabel(cell_class));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode');
        row.appendChild(settings.createLabel(cell_class, 'Latency allowed (s)'));
        row.appendChild(settings.createNumberStepInput(cell_class, input_class, 'smoothThreathold', data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.classList.add('aggressive-mode', 'note');
        const note = settings.createNote(cell_class, inner_cell_class,
            `${common.maxSmoothThreathold.toFixed(0)} s: Higher latency`
            + '<br>' +
            `${common.minSmoothThreathold.toFixed(1)} s: Lower latency`
        );
        row.appendChild(note);
        row.appendChild(settings.createLabel(cell_class));
        container.appendChild(row);
    }

    settings.registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, input_class, progress);

    for (const div of document.querySelectorAll('div.aggressive-mode')) {
        div.style.display = data.smooth ? '' : 'none';
    }
}