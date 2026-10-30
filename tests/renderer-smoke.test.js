import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('starts, opens settings, and displays a selected song', () => {
  const html = fs.readFileSync(new URL('../src/renderer/index.html', import.meta.url), 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', textContent: '', value: '0', src: '', currentTime: 0,
      duration: 120, paused: true, volume: 0.75, style: { setProperty() {} },
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener() {}, appendChild() {},
      play() { this.paused = false; return Promise.resolve(); },
      pause() { this.paused = true; },
    });
    return elements.get(id);
  }
  const document = {
    querySelector(selector) {
      if (!selector.startsWith('#')) return null;
      const id = selector.slice(1);
      return ids.has(id) || element('content').innerHTML.includes(`id="${id}"`) ? element(id) : null;
    },
    querySelectorAll() { return []; },
    body: { appendChild() {} },
  };
  const context = vm.createContext({
    document, library: { list: async () => [] }, localStorage: { getItem() { return null; }, setItem() {} },
    matchMedia() { return { matches: true }; }, setTimeout, clearTimeout, URL,
  });
  vm.runInContext(fs.readFileSync(new URL('../src/core/lyrics.js', import.meta.url), 'utf8'), context);
  vm.runInContext(fs.readFileSync(new URL('../src/core/playback.js', import.meta.url), 'utf8'), context);
  vm.runInContext(fs.readFileSync(new URL('../src/renderer/library-client.js', import.meta.url), 'utf8'), context);
  vm.runInContext(fs.readFileSync(new URL('../src/renderer/app.js', import.meta.url), 'utf8'), context);
  vm.runInContext("document.querySelector('#settingsToggle').onclick()", context);
  assert.match(element('content').innerHTML, /设置/);
  vm.runInContext("state.songs.push({name:'测试歌曲',url:'blob:test'});playSong(0)", context);
  assert.equal(element('nowTitle').textContent, '测试歌曲');
  vm.runInContext("setView('now')", context);
  assert.match(element('content').innerHTML, /测试歌曲/);
  assert.match(element('content').innerHTML, /歌词/);
});
