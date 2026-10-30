/** Parse LRC timestamps into sorted, seekable lines. Times are seconds. */
(function registerLyrics(root) {
function parseLrc(text) {
  const source = String(text).replace(/^\uFEFF/, '');
  const offsetMatch = source.match(/^\s*\[offset:([+-]?\d+)\]/im);
  const offset = offsetMatch ? Number(offsetMatch[1]) / 1000 : 0;
  const lines = [];
  for (const line of source.split(/\r?\n/)) {
    const stamps = [...line.matchAll(/\[(\d+):(\d{1,2}(?:[.:]\d{1,3})?)\]/g)];
    const content = line.replace(/\[[^\]]+\]/g, '').trim();
    if (!content) continue;
    for (const stamp of stamps) {
      const seconds = Number(stamp[2].replace(':', '.'));
      if (!Number.isFinite(seconds) || seconds >= 60) continue;
      lines.push({ time: Math.max(0, Number(stamp[1]) * 60 + seconds + offset), text: content });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}
root.YorushikaLyrics = Object.freeze({ parseLrc });
})(globalThis);
