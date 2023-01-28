export const defaultPlaybackRate = 1.25;

export function limitPlaybackRate(value) {
    return Math.min(Math.max(isNumber(value) ? value : defaultPlaybackRate, 1.0), 5.0);
}

export function isNumber(value) {
    return Number.isFinite(parseFloat(value));
}
