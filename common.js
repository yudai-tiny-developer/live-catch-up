export const label = {
    enabled: chrome.i18n.getMessage('enabled'),
    playbackRate: chrome.i18n.getMessage('playbackRate'),
    smooth: chrome.i18n.getMessage('smooth'),
    smooth_desc: chrome.i18n.getMessage('smooth_desc'),
    smoothRate: chrome.i18n.getMessage('smoothRate'),
    smoothRate_desc_max: chrome.i18n.getMessage('smoothRate_desc_max'),
    smoothRate_desc_min: chrome.i18n.getMessage('smoothRate_desc_min'),
    smoothThreathold: chrome.i18n.getMessage('smoothThreathold'),
    smoothThreathold_desc_max: chrome.i18n.getMessage('smoothThreathold_desc_max'),
    smoothThreathold_desc_min: chrome.i18n.getMessage('smoothThreathold_desc_min'),
    slowdownAtLiveHead: chrome.i18n.getMessage('slowdownAtLiveHead'),
    adjust: chrome.i18n.getMessage('adjust'),
};

export const storage = ['enabled', 'playbackRate', 'smooth', 'smoothRate', 'smoothThreathold', 'slowdownAtLiveHead', 'adjust'];

export const defaultEnabled = true;

export const defaultPlaybackRate = 1.25;
export const minPlaybackRate = 1.05;
export const maxPlaybackRate = 16.0;
export const stepPlaybackRate = 0.05;

export const defaultSmooth = false;

export const defaultSmoothRate = 200;
export const minSmoothRate = 50;
export const maxSmoothRate = 1000;
export const stepSmoothRate = 50;

export const defaultSmoothThreathold = 1.25;
export const minSmoothThreathold = 0.5;
export const maxSmoothThreathold = 20;
export const stepSmoothThreathold = 0.25;

export const defaultSlowdownAtLiveHead = true;

export const defaultAdjust = false;

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
