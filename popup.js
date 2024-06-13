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
        row.appendChild(settings.createLabel(cell_class, 'Aggressive Mitigation (High CPU load)'));
        row.appendChild(settings.createToggle(cell_class, toggle_class, label_class, 'smooth', data.smooth, common.defaultSmooth, common.value));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, `Interval (${common.minSmoothRate.toFixed(0)} ms ~ ${common.maxSmoothRate.toFixed(0)} ms)`));
        row.appendChild(settings.createNumberStepInput(cell_class, input_class, 'smoothRate', data.smoothRate, common.defaultSmoothRate, common.minSmoothRate, common.maxSmoothRate, common.stepSmoothRate, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class));
        row.appendChild(settings.createLabel(cell_class, `${common.maxSmoothRate.toFixed(0)} ms: Lower load<br>${common.minSmoothRate.toFixed(0)} ms: Higher load`));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class, `Threathold (${common.minSmoothThreathold.toFixed(0)} s ~ ${common.maxSmoothThreathold.toFixed(0)} s)`));
        row.appendChild(settings.createNumberStepInput(cell_class, input_class, 'smoothThreathold', data.smoothThreathold, common.defaultSmoothThreathold, common.minSmoothThreathold, common.maxSmoothThreathold, common.stepSmoothThreathold, common.limitValue));
        container.appendChild(row);
    } {
        const row = settings.createRow(row_class);
        row.appendChild(settings.createLabel(cell_class));
        row.appendChild(settings.createLabel(cell_class, `${common.maxSmoothThreathold.toFixed(0)} s: Higher Latency<br>${common.minSmoothThreathold.toFixed(0)} s: Lower Latency`));
        container.appendChild(row);
    }

    settings.registerResetButton(reset_button, progress_div, progress_class, done_class, toggle_class, input_class, progress);
}