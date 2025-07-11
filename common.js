export const label = {
    enabled: chrome.i18n.getMessage('enabled'),
    playbackRate: chrome.i18n.getMessage('playbackRate'),
    showPlaybackRate: chrome.i18n.getMessage('showPlaybackRate'),
    showLatency: chrome.i18n.getMessage('showLatency'),
    showHealth: chrome.i18n.getMessage('showHealth'),
    showEstimation: chrome.i18n.getMessage('showEstimation'),
    showCurrent: chrome.i18n.getMessage('showCurrent'),
    showCurrentDesc: chrome.i18n.getMessage('showCurrentDesc'),
    smooth: chrome.i18n.getMessage('smooth'),
    smooth_desc: chrome.i18n.getMessage('smooth_desc'),
    smoothThreathold: chrome.i18n.getMessage('smoothThreathold'),
    smoothAuto: chrome.i18n.getMessage('smoothAuto'),
    smoothThreathold_desc: chrome.i18n.getMessage('smoothThreatholdDesc'),
    smoothAuto_desc: chrome.i18n.getMessage('smoothAutoDesc'),
    skip: chrome.i18n.getMessage('skip'),
    skipThreathold: chrome.i18n.getMessage('skipThreathold'),
};

export const storage = ['enabled', 'playbackRate', 'showPlaybackRate', 'showLatency', 'showHealth', 'showEstimation', 'showCurrent', 'smooth', 'smoothThreathold', 'smoothAuto', 'skip', 'skipThreathold'];

export const defaultEnabled = true;

export const defaultPlaybackRate = 1.25;
export const minPlaybackRate = 1.05;
export const maxPlaybackRate = 16.0;
export const stepPlaybackRate = 0.05;

export const defaultShowPlaybackRate = false;
export const defaultShowLatency = false;
export const defaultShowHealth = false;
export const defaultShowEstimation = false;
export const defaultShowCurrent = false;

export const defaultSmooth = false;

export const defaultSmoothThreathold = 3.0;
export const minSmoothThreathold = 0.0;
export const maxSmoothThreathold = 120.0;
export const stepSmoothThreathold = 0.05;

export const defaultSmoothAuto = true;

export const defaultSkip = false;
export const defaultSkipThreathold = 300.0;
export const minSkipThreathold = 1.0;
export const maxSkipThreathold = 999999.0;
export const stepSkipThreathold = 1.0;

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

export function isLiveChat(url) {
    return url.startsWith('https://www.youtube.com/live_chat?')
        || url.startsWith('https://www.youtube.com/live_chat_replay?')
        ;
}