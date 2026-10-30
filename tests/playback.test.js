import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/core/playback.js';

test('切换 MV 从头播放且旧媒体停止发声', async () => {
  const media = () => ({ currentTime: 55, duration: 120, paused: false,
    pause() { this.paused = true; }, play() { this.paused = false; return Promise.resolve(); } });
  const audio = media(), video = media();
  const player = new globalThis.YorushikaPlayback.PlaybackController(audio, video);
  await player.playVideo('local-media://library/test');
  video.onloadedmetadata();
  assert.equal(audio.paused, true);
  assert.equal(video.currentTime, 0);
  assert.equal(player.current, video);
  await player.playAudio('audio');
  assert.equal(video.paused, true);
  assert.equal(player.current, audio);
});
