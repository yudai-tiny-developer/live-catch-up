# YouTube Live Stream Latency Mitigator

A browser extension that helps YouTube live streams catch up to real time when your player falls behind.

When a live stream with DVR enabled starts to drift, this extension can temporarily raise playback speed, monitor buffer health, optionally jump back to the live edge if the delay becomes too large, and show extra live-stream stats directly in the YouTube player UI.

## Features

- Automatically increases playback speed while a live stream is behind the live edge
- Returns to `1.0x` when the stream is caught up
- Optional aggressive mode that keeps pushing toward the live edge while buffer health allows
- Optional auto-adjusted buffer threshold based on the stream's latency class
- Optional skip-to-live behavior when delay exceeds a configured maximum
- Optional on-player indicators for playback rate, live latency, buffer health, estimated arrival time, and elapsed time
- Click-to-copy timestamp support from the elapsed time display
- Localized UI in English and Japanese

## Settings

### Catch-up behavior

- `Enable/Disable rate change`: turns automatic catch-up on or off
- `Playback rate`: target speed used while catching up
- `Aggressive mode`: keeps the higher playback rate active until buffer health falls below the threshold
- `Buffer Health Threshold`: minimum buffer to maintain before returning to `1.0x`
- `Auto Adjust Buffer Health Threshold`: sets the threshold automatically based on stream segment duration
- `Seek to the live head if delay exceeds the maximum`: jumps directly to live when delay is too large
- `Maximum delay (seconds)`: delay limit used for the skip-to-live option

### Optional UI indicators

- `Display current playback rate`
- `Display current live latency`
- `Display current buffer health`
- `Display estimated arrival at live head`
- `Display elapsed time`

When elapsed time is shown, clicking it copies a timestamped YouTube URL to the clipboard.

## License

This project is dual-licensed under:

- MIT: [LICENSE-MIT](LICENSE-MIT)
- Apache-2.0: [LICENSE-APACHE](LICENSE-APACHE)
