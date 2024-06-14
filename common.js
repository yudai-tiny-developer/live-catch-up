export const storage = ['enabled', 'playbackRate', 'smooth', 'smoothRate', 'smoothThreathold'];

export const defaultEnabled = true;

export const defaultPlaybackRate = 1.25;
export const minPlaybackRate = 1.0;
export const maxPlaybackRate = 5.0;
export const stepPlaybackRate = 0.05;

export const defaultSmooth = false;

export const defaultSmoothRate = 250;
export const minSmoothRate = 50;
export const maxSmoothRate = 10000;
export const stepSmoothRate = 50;

export const defaultSmoothThreathold = 5;
export const minSmoothThreathold = 0.5;
export const maxSmoothThreathold = 60;
export const stepSmoothThreathold = 0.5;

export function value(value, default_value) {
    return value ?? default_value;
}

export function limitValue(value, default_value, min_value, max_value, step_value) {
    return step(range(normalize(value, default_value), min_value, max_value), step_value);
}

function isNumber(value) {
    return Number.isFinite(parseFloat(value));
}

function normalize(value, default_value) {
    return isNumber(value) ? value : default_value;
}

function range(value, min_value, max_value) {
    return Math.min(Math.max(value, min_value), max_value);
}

function step(value, step_value) {
    const step = 1.0 / step_value;
    return Math.round(value * step) / step;
}
