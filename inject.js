(() => {
    function update_playbackRate() {
        if (video) {
            button_playbackrate.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${video.playbackRate.toFixed(2)}x</text></svg>`);
            if (video.playbackRate > 1.0) {
                button_playbackrate.style.fill = '#ff8983';
                button_playbackrate.style.fontWeight = 'bold';
            } else {
                button_playbackrate.style.fill = '#eee';
                button_playbackrate.style.fontWeight = 'normal';
            }
            button_playbackrate.style.display = '';
        }
    }

    function hide_playbackRate() {
        button_playbackrate.style.display = 'none';
    }

    function update_latency(latency, isAtLiveHead) {
        if (isAtLiveHead) {
            button_latency.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${latency.toFixed(2)}s</text></svg>`);
        } else {
            button_latency.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">(DVR)</text></svg>`);
        }
        button_latency.style.display = '';
    }

    function hide_latency() {
        button_latency.style.display = 'none';
    }

    function update_estimation(seekable_buffer, isAtLiveHead) {
        if (!isAtLiveHead && video && video.playbackRate > 1.0) {
            const estimated_seconds = seekable_buffer / (video.playbackRate - 1.0);
            const estimated_time = new Date(Date.now() + estimated_seconds * 1000.0).toLocaleTimeString();
            button_estimation.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 144 72"><text font-size="20" x="0%" y="50%" dominant-baseline="middle" text-anchor="start">${estimated_time}</text></svg>`);
            button_estimation.style.display = '';
        } else {
            button_estimation.style.display = 'none';
        }
    }

    function hide_estimation() {
        button_estimation.style.display = 'none';
    }

    function observe(node, query, callback, param) {
        new MutationObserver((mutations, observer) => {
            const target = document.querySelector(query);
            if (target && callback(target, param)) {
                observer.disconnect();
            }
        }).observe(node, { childList: true, subtree: true });
    }

    function observe_app(node, param) {
        observe(node, 'ytd-app', observe_player, param);
        return true;
    }

    function observe_player(node, param) {
        observe(node, 'div#movie_player', observe_main, param);
        return true;
    }

    function observe_main(node, param) {
        player = node;
        video = node.querySelector('video.html5-main-video');
        badge = node.querySelector('button.ytp-live-badge');
        if (video && badge) {
            badge.parentElement.parentElement.appendChild(button_estimation);
            badge.parentElement.parentElement.insertBefore(button_latency, button_estimation);
            badge.parentElement.parentElement.insertBefore(button_playbackrate, button_latency);
            player.addEventListener('onPlaybackRateChange', onPlaybackRateChange);
            return true;
        } else {
            return false;
        }
    }

    function onPlaybackRateChange(playbackRate) {
        if (playbackRate === 1.0) { // Keep the playback rate if it has been manually changed.
            document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
        }
    }

    function set_playbackRate(playbackRate, buffer, segduration, isLowLatencyLiveStream, isAtLiveHead) {
        if (player?.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = calc_playbackRate(playbackRate, buffer, segduration, isLowLatencyLiveStream, isAtLiveHead);
            if (video && video.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate;
            }
        }
    }

    function calc_playbackRate(playbackRate, buffer, segduration, isLowLatencyLiveStream, isAtLiveHead) {
        if (isAtLiveHead) {
            const cu = buffer - (playbackRate - 1.0) * segduration;
            const sd = isLowLatencyLiveStream ? segduration : segduration * 2.0;
            if (cu < sd) {
                return 1.0;
            } else {
                return playbackRate;
            }
        } else {
            return playbackRate;
        }
    }

    function reset_playbackRate() {
        if (video && player) {
            const newPlaybackRate = player.getPlaybackRate();
            if (video.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate
            }
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

    const button_estimation = document.createElement('button');
    button_estimation.classList.add('_live_catch_up_estimation', 'ytp-button');
    button_estimation.style.display = 'none';
    button_estimation.style.cursor = 'default';
    button_estimation.style.textAlign = 'center';
    button_estimation.style.fill = '#eee';
    button_estimation.style.width = '96px';

    let player;
    let video;
    let badge;
    let interval;

    observe_app(document);

    document.addEventListener('_live_catch_up_load_settings', e => {
        const settings = e.detail;
        clearInterval(interval);
        if (settings.enabled || settings.showPlaybackRate || settings.showLatency || settings.showEstimation) {
            interval = setInterval(() => {
                if (player) {
                    const video_stats = player.getVideoStats();
                    if (video_stats.live === 'live' || video_stats.live === 'dvr' || video_stats.live === 'lp') {
                        const progress_state = player.getProgressState();

                        if (settings.enabled) {
                            set_playbackRate(settings.playbackRate, progress_state.loaded - progress_state.current, video_stats.segduration, video_stats.lowlatency, progress_state.isAtLiveHead);
                        }

                        settings.showPlaybackRate ? update_playbackRate() : hide_playbackRate();
                        settings.showLatency ? update_latency(video_stats.lat, progress_state.isAtLiveHead) : hide_latency();
                        settings.showEstimation ? update_estimation(progress_state.seekableEnd - progress_state.current, progress_state.isAtLiveHead) : hide_estimation();
                    } else {
                        hide_playbackRate();
                        hide_latency();
                        hide_estimation();
                    }
                }
            }, 1000);
        } else {
            hide_playbackRate();
            hide_latency();
            hide_estimation();
        }
    });

    document.addEventListener('_live_catch_up_set_playback_rate', e => {
        if (player?.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = e.detail.playbackRate;
            if (video && video.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate;
            }
        }
    });

    document.addEventListener('_live_catch_up_reset_playback_rate', () => {
        reset_playbackRate();
    });

    document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
})();