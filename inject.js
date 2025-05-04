(() => {
    function update_playbackRate(playbackRate) {
        const video = video_instance();
        if (video) {
            button_playbackrate.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${video.playbackRate.toFixed(2)}x</text></svg>`);
            if (video.playbackRate === playbackRate) {
                button_playbackrate.style.fill = '#ff8983';
                button_playbackrate.style.fontWeight = 'bold';
            } else {
                button_playbackrate.style.fill = '#eee';
                button_playbackrate.style.fontWeight = 'normal';
            }
            button_playbackrate.style.display = '';
        } else {
            button_playbackrate.style.display = 'none';
        }
    }

    function hide_playbackRate() {
        button_playbackrate.style.display = 'none';
    }

    function update_latency(latency, isAtLiveHead) {
        if (isAtLiveHead) {
            button_latency.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${latency.toFixed(2)}s</text></svg>`);
        } else {
            button_latency.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">(DVR)</text></svg>`);
        }
        button_latency.style.fill = '#eee';
        button_latency.style.fontWeight = 'normal';
        button_latency.style.display = '';
    }

    function hide_latency() {
        button_latency.style.display = 'none';
    }

    function update_health(health, enabled, smoothThreathold) {
        button_health.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${health.toFixed(2)}s</text></svg>`);
        if (enabled && health >= smoothThreathold) {
            button_health.style.fill = '#ff8983';
            button_health.style.fontWeight = 'bold';
        } else {
            button_health.style.fill = '#eee';
            button_health.style.fontWeight = 'normal';
        }
        button_health.style.display = '';
    }

    function hide_health() {
        button_health.style.display = 'none';
    }

    function update_estimation(seekableEnd, current, isAtLiveHead) {
        addWithLimit(seekableEnds, seekableEnd);
        const streamHasProbablyEnded = allElementsEqual(seekableEnds);
        const video = video_instance();
        if (!isAtLiveHead && video?.playbackRate > 1.0) {
            const estimated_seconds = (seekableEnd - current) / (streamHasProbablyEnded ? video.playbackRate : video.playbackRate - 1.0);
            const estimated_time = new Date(Date.now() + estimated_seconds * 1000.0).toLocaleTimeString();
            const length = String(estimated_time).length;
            button_estimation.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 ${length * 12} 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${estimated_time}</text></svg>`);
            button_estimation.style.display = '';
        } else {
            button_estimation.style.display = 'none';
        }
    }

    function hide_estimation() {
        button_estimation.style.display = 'none';
    }

    function update_current(current, seekableEnd, isAtLiveHead, videoId) {
        const current_time = format_time(current);

        if (isAtLiveHead) {
            const length = String(current_time).length;
            button_current.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 ${length * 12} 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${current_time}</text></svg>`);
        } else {
            const seekableEnd_time = format_time(seekableEnd);
            const length = String(current_time).length + String(seekableEnd_time).length;
            button_current.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 ${length * 12} 72"><text font-size="20" x="50%" y="50%" dominant-baseline="central" text-anchor="middle">${current_time} / ${seekableEnd_time}</text></svg>`);
        }

        const current_time_url = addParamsToUrl('https://www.youtube.com/watch', { v: videoId, t: format_time_hms(current) });
        button_current.setAttribute('current', `${current_time_url}#\n${current_time}`);

        button_current.style.display = '';
    }

    function hide_current() {
        button_current.style.display = 'none';
    }

    function set_playbackRate(playbackRate, health, smoothThreathold) {
        if (player?.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = calc_playbackRate(playbackRate, health, smoothThreathold);
            const video = video_instance();
            if (video && video?.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate;
            }
        }
    }

    function calc_playbackRate(playbackRate, health, smoothThreathold) {
        if (health < smoothThreathold) {
            return 1.0;
        } else {
            return playbackRate;
        }
    }

    function reset_playbackRate() {
        const video = video_instance();
        if (video && player) {
            const newPlaybackRate = player.getPlaybackRate();
            if (video.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate;
            }
        }
    }

    function calc_threathold() {
        if (player) {
            return (player.getVideoStats ? player.getVideoStats().segduration : calc_segduration());
        } else {
            return 120.0;
        }
    }

    function calc_segduration() {
        if (player) {
            const latencyClass = player.getPlayerResponse ? player.getPlayerResponse().videoDetails.latencyClass : 'MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_UNKNOWN';
            switch (latencyClass) {
                case 'MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_ULTRA_LOW':
                    return 1.0;
                case 'MDE_STREAM_OPTIMIZATIONS_RENDERER_LATENCY_LOW':
                    return 2.0;
                default:
                    return 5.0;
            }
        } else {
            return 120.0;
        }
    }

    function onPlaybackRateChange() {
        document.dispatchEvent(new CustomEvent('_live_catch_up_onPlaybackRateChange'));
    }

    function video_instance() {
        if (!video?.parentNode && player) {
            video = player.querySelector('video.html5-main-video');
        }
        return video;
    }

    function format_time(seconds) {
        const hs = Math.floor(seconds / 3600.0);
        const ms = Math.floor((seconds % 3600) / 60.0);
        const ss = Math.floor(seconds % 60);

        const h = hs > 0 ? `${String(hs)}:` : '';
        const m = String(ms).padStart(hs > 0 ? 2 : 1, '0');
        const s = String(ss).padStart(2, '0');

        return `${h}${m}:${s}`;
    }

    function format_time_hms(seconds) {
        const hs = Math.floor(seconds / 3600.0);
        const ms = Math.floor((seconds % 3600) / 60.0);
        const ss = Math.floor(seconds % 60);

        const h = hs > 0 ? `${String(hs)}h` : '';
        const m = String(ms).padStart(hs > 0 ? 2 : 1, '0');
        const s = String(ss).padStart(2, '0');

        return `${h}${m}m${s}s`;
    }

    function addWithLimit(arr, newElement, limit = 5) {
        arr.push(newElement);
        if (arr.length > limit) {
            arr.splice(0, arr.length - limit);
        }
        return arr;
    }

    function allElementsEqual(arr, limit = 5) {
        if (arr.length < limit) return false;
        return arr.every(el => el === arr[0]);
    }

    function addParamsToUrl(url, params) {
        const urlObj = new URL(url);
        for (const [key, value] of Object.entries(params)) {
            urlObj.searchParams.set(key, value);
        }
        return urlObj.toString();
    }

    function bonus_features() {
        const time_display = player.querySelector('div.ytp-time-display');
        if (time_display && !time_display.hasAttribute('_live_catch_up_bonus_features')) {
            time_display.addEventListener('click', () => {
                if (showCurrent) {
                    const videoId = player.getVideoData()?.video_id;
                    const current = player.getProgressState()?.current;

                    const current_time = format_time(current);
                    const current_time_url = addParamsToUrl('https://www.youtube.com/watch', { v: videoId, t: format_time_hms(current) });

                    navigator.clipboard.writeText(`${current_time_url}#\n${current_time}`);

                    const rect = time_display.getBoundingClientRect();
                    msg_current.style.left = `${rect.left + rect.width / 2.0}px`;
                    msg_current.style.top = `${rect.top - 16}px`;
                    msg_current.style.display = 'block';
                    const timeout_id = setTimeout(() => {
                        if (msg_current_timeout === timeout_id) {
                            msg_current.style.display = 'none';
                        }
                    }, 4000);
                    msg_current_timeout = timeout_id;
                }
            });
            time_display.setAttribute('_live_catch_up_bonus_features', '');
        }
    }

    const HTMLPolicy = window.trustedTypes ? window.trustedTypes.createPolicy("_live_catch_up_HTMLPolicy", { createHTML: (string) => string }) : { createHTML: (string) => string };

    const button_playbackrate = document.createElement('button');
    button_playbackrate.classList.add('_live_catch_up_playbackrate', 'ytp-button');
    button_playbackrate.style.display = 'none';
    button_playbackrate.style.cursor = 'default';
    button_playbackrate.style.textAlign = 'center';

    const button_latency = document.createElement('button');
    button_latency.classList.add('_live_catch_up_latency', 'ytp-button');
    button_latency.style.display = 'none';
    button_latency.style.cursor = 'default';
    button_latency.style.textAlign = 'center';
    button_latency.style.fill = '#eee';

    const button_health = document.createElement('button');
    button_health.classList.add('_live_catch_up_health', 'ytp-button');
    button_health.style.display = 'none';
    button_health.style.cursor = 'default';
    button_health.style.textAlign = 'center';
    button_health.style.fill = '#eee';

    const button_estimation = document.createElement('button');
    button_estimation.classList.add('_live_catch_up_estimation', 'ytp-button');
    button_estimation.style.display = 'none';
    button_estimation.style.cursor = 'default';
    button_estimation.style.width = 'auto';
    button_estimation.style.fill = '#eee';

    const msg_current = document.createElement('div');
    msg_current.textContent = 'Copied!';
    msg_current.style.display = 'none';
    msg_current.style.position = 'fixed';

    const button_current = document.createElement('button');
    button_current.classList.add('_live_catch_up_estimation', 'ytp-button');
    button_current.style.display = 'none';
    button_current.style.cursor = 'default';
    button_current.style.width = 'auto';
    button_current.style.fill = '#eee';
    button_current.addEventListener('click', () => {
        navigator.clipboard.writeText(button_current.getAttribute('current'));

        const rect = button_current.getBoundingClientRect();
        msg_current.style.left = `${rect.left + rect.width / 2.0}px`;
        msg_current.style.top = `${rect.top - 16}px`;
        msg_current.style.display = 'block';
        const timeout_id = setTimeout(() => {
            if (msg_current_timeout === timeout_id) {
                msg_current.style.display = 'none';
            }
        }, 4000);
        msg_current_timeout = timeout_id;
    });

    const app = document.querySelector('ytd-app') ?? document.body; // YouTube.com or Embedded Player

    let player;
    let video;
    let badge;
    let interval;
    let interval_count = 0;
    let seekableEnds = [];
    let msg_current_timeout;
    let showCurrent;

    document.addEventListener('_live_catch_up_load_settings', e => {
        const settings = e.detail;
        clearInterval(interval);
        showCurrent = settings.showCurrent;
        if (settings.enabled || settings.showPlaybackRate || settings.showLatency || settings.showHealth || settings.showEstimation || settings.showCurrent) {
            interval = setInterval(() => {
                if (player) {
                    const stats_for_nerds = player.getStatsForNerds();
                    if (stats_for_nerds.live_latency_style === '') {
                        const latency = Number.parseFloat(stats_for_nerds.live_latency_secs);
                        const health = Number.parseFloat(stats_for_nerds.buffer_health_seconds);
                        const progress_state = player.getProgressState();
                        const smoothThreathold = settings.smoothAuto ? calc_threathold() : settings.smoothThreathold;

                        if (settings.enabled) {
                            set_playbackRate(settings.playbackRate, health, smoothThreathold);
                        }

                        const want_update = interval_count++ % 4 === 0;
                        settings.showPlaybackRate ? update_playbackRate(settings.playbackRate) : hide_playbackRate();
                        settings.showLatency ? (want_update && update_latency(latency, progress_state.isAtLiveHead)) : hide_latency();
                        settings.showHealth ? (want_update && update_health(health, settings.enabled, smoothThreathold)) : hide_health();
                        settings.showEstimation ? (want_update && update_estimation(progress_state.seekableEnd, progress_state.current, progress_state.isAtLiveHead)) : hide_estimation();
                        settings.showCurrent ? update_current(progress_state.current, progress_state.seekableEnd, progress_state.isAtLiveHead, player.getVideoData()?.video_id) : hide_current();
                    } else {
                        hide_playbackRate();
                        hide_latency();
                        hide_health();
                        hide_estimation();
                        hide_current();
                    }
                }
            }, 250);
        } else {
            hide_playbackRate();
            hide_latency();
            hide_health();
            hide_estimation();
            hide_current();
        }
    });

    document.addEventListener('_live_catch_up_set_playback_rate', e => {
        if (player?.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = e.detail.playbackRate;
            const video = video_instance();
            if (video && video.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate;
            }
        }
    });

    document.addEventListener('_live_catch_up_reset_playback_rate', () => {
        reset_playbackRate();
    });

    const detect_interval = setInterval(() => {
        player = app.querySelector('div#movie_player');
        if (!player) {
            return;
        }

        bonus_features();

        const video = video_instance();
        if (!video) {
            return;
        }

        badge = player.querySelector('button.ytp-live-badge');
        if (!badge) {
            return;
        }

        clearInterval(detect_interval);

        player.addEventListener('onPlaybackRateChange', onPlaybackRateChange);

        badge.parentElement.parentElement.appendChild(msg_current);
        badge.parentElement.parentElement.insertBefore(button_current, msg_current);
        badge.parentElement.parentElement.insertBefore(button_estimation, button_current);
        badge.parentElement.parentElement.insertBefore(button_health, button_estimation);
        badge.parentElement.parentElement.insertBefore(button_latency, button_health);
        badge.parentElement.parentElement.insertBefore(button_playbackrate, button_latency);

        document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
    }, 500);
})();