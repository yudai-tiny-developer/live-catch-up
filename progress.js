export function startProgress(div, progress_class, done_class, state) {
    clearTimeout(state.holdTimeout);
    div.classList.add(progress_class);
    div.classList.remove(done_class);
    state.done = false;

    state.holdTimeout = setTimeout(() => {
        div.classList.remove(progress_class);
        div.classList.add(done_class);
        state.done = true;
    }, 1000);
}

export function endProgress(div, progress_class, done_class, state, callback, args) {
    clearTimeout(state.holdTimeout);
    div.classList.remove(progress_class, done_class);
    if (callback && state.done) {
        callback(args);
    }
    state.done = false;
}