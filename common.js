export const storage = ['enabled', 'playbackRate'];

export const defaultEnabled = true;

export const defaultPlaybackRate = 1.25;
export const minPlaybackRate = 1.0;
export const maxPlaybackRate = 5.0;
export const stepPlaybackRate = 0.05;

export function limitPlaybackRate(value) {
    return limitRate(value, defaultPlaybackRate, minPlaybackRate, maxPlaybackRate, stepPlaybackRate);
}

function limitRate(value, defaultValue, minRate, maxRate, stepRate) {
    return step(range(normalize(value, defaultValue), minRate, maxRate), stepRate);
}

function isNumber(value) {
    return Number.isFinite(parseFloat(value));
}

function normalize(value, defaultValue) {
    return isNumber(value) ? value : defaultValue;
}

function range(value, minRate, maxRate) {
    return Math.min(Math.max(value, minRate), maxRate);
}

function step(value, stepRate) {
    const step = 1.0 / stepRate;
    return Math.round(value * step) / step;
}
