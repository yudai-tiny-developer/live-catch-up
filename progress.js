let hold;
let holdTimeout;

export function startProgress() {
    clearTimeout(holdTimeout);
    document.querySelector('div#reset_progress').classList.add('progress');
    document.querySelector('div#reset_progress').classList.remove('done');
    hold = false;

    holdTimeout = setTimeout(() => {
        document.querySelector('div#reset_progress').classList.remove('progress');
        document.querySelector('div#reset_progress').classList.add('done');
        hold = true;
    }, 1000);
}

export function cancelProgress() {
    clearTimeout(holdTimeout);
    document.querySelector('div#reset_progress').classList.remove('progress', 'done');
    hold = false;
}

export function endProgress(callback) {
    clearTimeout(holdTimeout);
    document.querySelector('div#reset_progress').classList.remove('progress', 'done');
    callback();
    hold = false;
}

export function isDone() {
    return hold;
}