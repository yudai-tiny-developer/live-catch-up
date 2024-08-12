export const label = {
    enabled: chrome.i18n.getMessage('enabled'),
    playbackRate: chrome.i18n.getMessage('playbackRate'),
    showPlaybackRate: chrome.i18n.getMessage('showPlaybackRate'),
    showLatency: chrome.i18n.getMessage('showLatency'),
    smooth: chrome.i18n.getMessage('smooth'),
    smooth_desc: chrome.i18n.getMessage('smooth_desc'),
    smoothThreathold: chrome.i18n.getMessage('smoothThreathold'),
    slowdownAtLiveHead: chrome.i18n.getMessage('slowdownAtLiveHead'),
    keepBufferHealth: chrome.i18n.getMessage('keepBufferHealth'),
};

export const storage = ['enabled', 'playbackRate', 'showPlaybackRate', 'showLatency', 'smooth', 'smoothThreathold', 'slowdownAtLiveHead', 'keepBufferHealth'];

export const defaultEnabled = true;

export const defaultPlaybackRate = 1.25;
export const minPlaybackRate = 1.05;
export const maxPlaybackRate = 16.0;
export const stepPlaybackRate = 0.05;

export const defaultShowPlaybackRate = false;
export const defaultShowLatency = false;

export const defaultSmooth = false;

export const defaultSmoothThreathold = 1.25;
export const minSmoothThreathold = 0.5;
export const maxSmoothThreathold = 20;
export const stepSmoothThreathold = 0.25;

export const defaultSlowdownAtLiveHead = true;

export const defaultKeepBufferHealth = false;

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