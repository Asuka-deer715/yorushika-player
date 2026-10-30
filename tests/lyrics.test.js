import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/core/lyrics.js';
const { parseLrc } = globalThis.YorushikaLyrics;

test('orders repeated timestamps, ignores metadata and applies offset', () => {
  const result = parseLrc('\uFEFF[ti:Example]\n[offset:-500]\n[00:03.50][00:01.00]Line\n[00:00.20]Start\n[00:60.00]Invalid');
  assert.deepEqual(result, [
    { time: 0, text: 'Start' },
    { time: 0.5, text: 'Line' },
    { time: 3, text: 'Line' },
  ]);
});
