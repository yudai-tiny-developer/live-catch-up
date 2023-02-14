export const defaultPlaybackRate = 1.25;
export const minPlaybackRate = 1.0;
export const maxPlaybackRate = 2.0;
export const stepPlaybackRate = 0.05;

export function limitPlaybackRate(value) {
    return step(range(normalize(value)));
}

function isNumber(value) {
    return Number.isFinite(parseFloat(value));
}

function normalize(value) {
    return isNumber(value) ? value : defaultPlaybackRate;
}

function range(value) {
    return Math.min(Math.max(value, minPlaybackRate), maxPlaybackRate);
}

function step(value) {
    const step = 1.0 / stepPlaybackRate;
    return Math.round(value * step) / step;
}
