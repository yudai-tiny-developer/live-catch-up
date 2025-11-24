(() => {
    function update_playbackRate(playbackRate) {
        const video = video_instance();
        if (video) {
            button_playbackrate.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">${video.playbackRate.toFixed(2)}x</span>`);

            if (video.playbackRate === playbackRate) {
                button_playbackrate.style.color = '#ff8983';
            } else {
                button_playbackrate.style.color = '#eee';
            }

            button_playbackrate.style.display = 'inline-block';
        } else {
            button_playbackrate.style.display = 'none';
        }
    }

    function hide_playbackRate() {
        button_playbackrate.style.display = 'none';
    }

    function update_latency(latency, isAtLiveHead) {
        if (isAtLiveHead) {
            button_latency.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">${latency.toFixed(2)}s</span>`);
        } else {
            button_latency.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">(DVR)</span>`);
        }

        button_latency.style.display = 'inline-block';
    }

    function hide_latency() {
        button_latency.style.display = 'none';
    }

    function update_health(health, enabled, smoothThreathold) {
        button_health.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">${health.toFixed(2)}s</span>`);

        if (enabled && health >= smoothThreathold) {
            button_health.style.color = '#ff8983';
        } else {
            button_health.style.color = '#eee';
        }

        button_health.style.display = 'inline-block';
    }

    function hide_health() {
        button_health.style.display = 'none';
    }

    function update_estimation(seekableEnd, current, isAtLiveHead) {
        addWithLimit(seekableEnds, seekableEnd);
        const streamHasProbablyEnded = allElementsEqual(seekableEnds);
        const video = video_instance();
        const estimated_seconds = (seekableEnd - current) / (streamHasProbablyEnded ? video.playbackRate : video.playbackRate - 1.0);
        if (!isAtLiveHead && isFinite(estimated_seconds)) {
            const estimated_time = new Date(Date.now() + estimated_seconds * 1000.0).toLocaleTimeString();
            button_estimation.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">(${estimated_time})</span>`);
            button_estimation.style.display = 'inline-block';
        } else {
            button_estimation.style.display = 'none';
        }
    }

    function hide_estimation() {
        button_estimation.style.display = 'none';
    }

    function update_current(current, seekableEnd, isAtLiveHead, videoId) {
        const current_time = isFinite(current) ? format_time(current) : '--:--';

        if (isAtLiveHead) {
            button_current.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">${current_time}</span>`);
        } else {
            const seekableEnd_time = isFinite(seekableEnd) ? format_time(seekableEnd) : '--:--';
            button_current.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">${current_time} / ${seekableEnd_time}</span>`);
        }

        const current_time_url = addParamsToUrl('https://www.youtube.com/watch', { v: videoId, t: format_time_hms(current) });
        button_current.setAttribute('current', `${current_time_url}#\n${current_time}`);

        button_current.style.display = 'inline-block';
    }

    function hide_current() {
        button_current.style.display = 'none';
    }

    function set_playbackRate(playbackRate, health, smooth, smoothThreathold, isAtLiveHead) {
        if (player?.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = calc_playbackRate(playbackRate, health, smooth, smoothThreathold, isAtLiveHead);
            const video = video_instance();
            if (video && video?.playbackRate !== newPlaybackRate) {
                video.setAttribute('_live_catch_up', 'true');
                video.playbackRate = newPlaybackRate;
            }
        }
    }

    function calc_playbackRate(playbackRate, health, smooth, smoothThreathold, isAtLiveHead) {
        if (smooth) {
            if (health < smoothThreathold) {
                return 1.0;
            } else {
                return playbackRate;
            }
        } else {
            if (isAtLiveHead) {
                return 1.0;
            } else {
                return playbackRate;
            }
        }
    }

    function reset_playbackRate() {
        const video = video_instance();
        if (video && player && video.getAttribute('_live_catch_up') === 'true') {
            const newPlaybackRate = player.getPlaybackRate();
            if (video.playbackRate !== newPlaybackRate) {
                video.setAttribute('_live_catch_up', 'false');
                video.playbackRate = newPlaybackRate;
            }
        }
    }

    function calc_threathold() {
        if (player) {
            return (player.getVideoStats ? player.getVideoStats().segduration : calc_segduration());
        } else {
            return 5.0;
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
            return 5.0;
        }
    }

    function onPlaybackRateChange() {
        document.dispatchEvent(new CustomEvent('_live_catch_up_onPlaybackRateChange'));
    }

    function skip_if_over_threathold(latency, skipThreathold) {
        if (player && latency >= skipThreathold) {
            if (player.getPlayerStateObject()?.isPlaying) {
                player.seekToLiveHead();
                player.playVideo();
            }
        }
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
        const time_display = player.querySelector('div.ytp-time-contents');
        if (time_display && !time_display.hasAttribute('_live_catch_up_bonus_features')) {
            time_display.addEventListener('click', e => {
                if (showCurrent) {
                    const button = time_display.querySelector('button._live_catch_up_current');
                    if (button && button.style.display !== 'none') {
                        return;
                    }

                    e.stopPropagation();

                    const current = player.getProgressState()?.current;
                    const videoId = player.getVideoData()?.video_id;

                    const current_time = format_time(current);
                    const current_time_url = addParamsToUrl('https://www.youtube.com/watch', { v: videoId, t: format_time_hms(current) });

                    navigator.clipboard.writeText(`${current_time_url}#\n${current_time}`);

                    if (new_style) {
                        msg_current.style.translate = '-32px -16px';
                    } else {
                        const rect = time_display.getBoundingClientRect();
                        msg_current.style.left = `${rect.left + rect.width / 2.0}px`;
                        msg_current.style.top = `${rect.top - 16}px`;
                    }

                    msg_current.style.display = 'inline-block';

                    clearTimeout(msg_current_timeout);
                    msg_current_timeout = setTimeout(() => {
                        msg_current.style.display = 'none';
                    }, 4000);
                }
            });
            time_display.setAttribute('_live_catch_up_bonus_features', '');
        }
    }

    function create_elem(elem_name, elem_classes) {
        const elem = document.createElement(elem_name);
        elem.classList.add(...elem_classes);
        elem.style.display = 'none';
        elem.style.cursor = 'default';
        elem.style.textAlign = 'center';
        elem.style.width = 'auto';
        elem.style.height = 'auto';
        elem.style.color = '#eee';
        elem.style.fontWeight = 'normal';
        elem.style.paddingLeft = '8px';
        elem.style.paddingRight = '8px';
        return elem;
    }

    const HTMLPolicy = window.trustedTypes ? window.trustedTypes.createPolicy("_live_catch_up_HTMLPolicy", { createHTML: (string) => string }) : { createHTML: (string) => string };

    const button_playbackrate = create_elem('button', ['_live_catch_up_playbackrate', 'ytp-button']);

    const button_latency = create_elem('button', ['_live_catch_up_latency', 'ytp-button']);

    const button_health = create_elem('button', ['_live_catch_up_health', 'ytp-button']);

    const button_estimation = create_elem('button', ['_live_catch_up_estimation', 'ytp-button']);

    const msg_current = create_elem('button', ['_live_catch_up_msg_current', 'ytp-button']);
    msg_current.innerHTML = HTMLPolicy.createHTML(`<span class="ytp-live" translate="no">Copied!</span>`);
    msg_current.style.position = 'fixed';

    const button_current = create_elem('button', ['_live_catch_up_current', 'ytp-button']);
    button_current.addEventListener('click', () => {
        navigator.clipboard.writeText(button_current.getAttribute('current'));

        if (new_style) {
            msg_current.style.translate = '-32px -16px';
        } else {
            const rect = button_current.getBoundingClientRect();
            msg_current.style.left = `${rect.left + rect.width / 2.0}px`;
            msg_current.style.top = `${rect.top - 16}px`;
        }

        msg_current.style.display = 'inline-block';

        clearTimeout(msg_current_timeout);
        msg_current_timeout = setTimeout(() => {
            msg_current.style.display = 'none';
        }, 4000);
    });

    const app = document.querySelector('ytd-app') ?? document.body; // YouTube.com or Embedded Player

    let player;
    let video;
    let new_style;
    let interval;
    let interval_count = 0;
    let seekableEnds = [];
    let msg_current_timeout;
    let showCurrent;

    document.addEventListener('_live_catch_up_load_settings', e => {
        const settings = e.detail;
        clearInterval(interval);
        showCurrent = settings.showCurrent;
        if (settings.enabled || settings.skip || settings.showPlaybackRate || settings.showLatency || settings.showHealth || settings.showEstimation || settings.showCurrent) {
            interval = setInterval(() => {
                if (player) {
                    const stats_for_nerds = player.getStatsForNerds();
                    if (stats_for_nerds.live_latency_style === '') {
                        const latency = Number.parseFloat(stats_for_nerds.live_latency_secs);
                        const health = Number.parseFloat(stats_for_nerds.buffer_health_seconds);
                        const progress_state = player.getProgressState();
                        const smoothThreathold = settings.smoothAuto ? calc_threathold() * 2 : settings.smoothThreathold;

                        if (settings.enabled) {
                            set_playbackRate(settings.playbackRate, health, settings.smooth, smoothThreathold, progress_state.isAtLiveHead);
                        } else {
                            reset_playbackRate();
                        }

                        if (settings.skip) {
                            skip_if_over_threathold(progress_state.seekableEnd - progress_state.current, settings.skipThreathold);
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
            reset_playbackRate();
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

        let area = player.querySelector('div.ytp-time-display:has(button.ytp-live-badge) div.ytp-time-wrapper'); // new style
        if (!area) {
            area = player.querySelector('div.ytp-left-controls:has(button.ytp-live-badge)'); // old style
            if (!area) {
                return;
            } else {
                new_style = false;
            }
        } else {
            new_style = true;
        }
        console.log(new_style);

        clearInterval(detect_interval);

        video.addEventListener('ratechange', onPlaybackRateChange);

        let prev = undefined;
        for (const elem of [button_playbackrate, button_latency, button_health, button_current, msg_current, button_estimation].reverse()) {
            area.insertBefore(elem, prev);
            prev = elem;
        }

        document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
    }, 500);
})();