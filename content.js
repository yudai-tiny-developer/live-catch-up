import(chrome.runtime.getURL('common.js')).then(common => {
	let button;
	let playbackRate = common.defaultPlaybackRate;

	chrome.storage.local.get(['playbackRate'], (data) => {
		playbackRate = common.limitPlaybackRate(data.playbackRate);
	});

	chrome.storage.onChanged.addListener((changes, namespace) => {
		chrome.storage.local.get(['playbackRate'], (data) => {
			playbackRate = common.limitPlaybackRate(data.playbackRate);
		});
	});

	const app = document.querySelector('ytd-app');
	if (app) {
		new MutationObserver((mutations, observer) => {
			for (const m of mutations) {
				if (m.target.nodeName === 'BUTTON' && m.target.classList.contains('ytp-live-badge') && m.target.classList.contains('ytp-button')) {
					if (button !== m.target) {
						button = m.target;
						const video = app.querySelector('video');
						video.addEventListener('progress', () => {
							if (button.hasAttribute('disabled')) {
								video.playbackRate = 1.0;
							} else {
								video.playbackRate = playbackRate;
							}
						});
					}
					return;
				}
			}
		}).observe(app, {
			subtree: true,
			childList: true,
		});
	} else {
		console.warn('ytd-app not found');
	}
});
