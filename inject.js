(() => {
    const HTMLPolicy = window.trustedTypes ? window.trustedTypes.createPolicy("_live_catch_up_HTMLPolicy", { createHTML: (string) => string }) : { createHTML: (string) => string };

    function reset_playbackRate() {
        if (video && player) {
            video.playbackRate = player.getPlaybackRate();
        }
    }

    function set_playbackRate(settings, latency, isAtLiveHead) {
        if (player?.getPlaybackRate() === 1.0) { // Keep the playback rate if it has been manually changed.
            const newPlaybackRate = calc_playbackRate(settings, latency, isAtLiveHead);
            if (video && video.playbackRate !== newPlaybackRate) {
                video.playbackRate = newPlaybackRate;
            }
        }
    }

    function calc_playbackRate(settings, latency, isAtLiveHead) {
        if (isAtLiveHead) {
            if (latency < settings.smoothThreathold) {
                return 1.0;
            } else {
                return settings.playbackRate;
            }
        } else {
            return settings.playbackRate;
        }
    }

    function update_playbackRate() {
        const button = button_playbackrate;
        if (video) {
            button.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${video.playbackRate.toFixed(2)}x</text></svg>`);
            if (video.playbackRate > 1.0) {
                button.style.fill = '#ff8983';
                button.style.fontWeight = 'bold';
            } else {
                button.style.fill = '#eee';
                button.style.fontWeight = 'normal';
            }
            button.style.display = '';
        }
    }

    function hide_playbackRate() {
        button_playbackrate.style.display = 'none';
    }

    function update_latency(latency, isAtLiveHead) {
        const button = button_latency;
        if (isAtLiveHead) {
            button.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${latency.toFixed(2)}s</text></svg>`);
        } else {
            button.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 72 72"><text font-size="20" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">(DVR)</text></svg>`);
        }
        button.style.display = '';
    }

    function hide_latency() {
        button_latency.style.display = 'none';
    }

    function update_estimation() {
        const button = button_estimation;
        if (video && video.playbackRate > 1.0) {
            const progress_state = player.getProgressState();
            const estimated_seconds = (progress_state.seekableEnd - progress_state.current) / (video.playbackRate - 1.0);
            const estimated_time = new Date(Date.now() + estimated_seconds * 1000.0).toLocaleTimeString();
            button.innerHTML = HTMLPolicy.createHTML(`<svg width="100%" height="100%" viewBox="0 0 144 72"><text font-size="20" x="0%" y="50%" dominant-baseline="middle" text-anchor="start">${estimated_time}</text></svg>`);
            button.style.display = '';
        } else {
            button.style.display = 'none';
        }
    }

    function hide_estimation() {
        button_estimation.style.display = 'none';
    }

    function create_button_playbackrate() {
        const button = document.createElement('button');
        button.classList.add('_live_catch_up_playbackrate', 'ytp-button');
        button.style.display = 'none';
        button.style.cursor = 'default';
        button.style.textAlign = 'center';
        return button;
    }

    function create_button_latency() {
        const button = document.createElement('button');
        button.classList.add('_live_catch_up_latency', 'ytp-button');
        button.style.display = 'none';
        button.style.cursor = 'default';
        button.style.textAlign = 'center';
        button.style.fill = '#eee';
        return button;
    }

    function create_button_estimation() {
        const button = document.createElement('button');
        button.classList.add('_live_catch_up_estimation', 'ytp-button');
        button.style.display = 'none';
        button.style.cursor = 'default';
        button.style.textAlign = 'center';
        button.style.fill = '#eee';
        button.style.width = '96px';
        return button;
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
            return true;
        } else {
            return false;
        }
    }

    let player;
    let video;
    let badge;
    let button_playbackrate;
    let button_latency;
    let button_estimation;
    let interval;

    document.addEventListener('_live_catch_up_load_settings', e => {
        const settings = e.detail;

        clearInterval(interval);
        if (settings.enabled || settings.showPlaybackRate || settings.showLatency || settings.showEstimation) {
            interval = setInterval(() => {
                if (player) {
                    if (player.getVideoData().isLive) {
                        const latency = Number.parseFloat(player.getStatsForNerds().live_latency_secs);
                        const isAtLiveHead = player.isAtLiveHead();

                        if (settings.enabled) {
                            set_playbackRate(settings, latency, isAtLiveHead);
                        }

                        settings.showPlaybackRate ? update_playbackRate() : hide_playbackRate();
                        settings.showLatency ? update_latency(latency, isAtLiveHead) : hide_latency();
                        settings.showEstimation ? update_estimation() : hide_estimation();
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

    document.addEventListener('_live_catch_up_reset_playback_rate', () => {
        reset_playbackRate();
    });

    button_playbackrate = create_button_playbackrate();
    button_latency = create_button_latency();
    button_estimation = create_button_estimation();

    observe_app(document);

    document.dispatchEvent(new CustomEvent('_live_catch_up_init'));
})();