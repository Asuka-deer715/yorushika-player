// Keep the unlock control clickable while the lyrics stay fixed in place.
export function mountLyricsLock(root, bridge, t) {
  const unlock = document.createElement('button');
  unlock.className = 'lyric-unlock';
  unlock.textContent = t('解锁桌面歌词');
  unlock.hidden = true;
  unlock.onclick = () => bridge.action('unlock');
  root.append(unlock);
  bridge.onLock(locked => {
    root.classList.toggle('locked', locked);
    unlock.hidden = !locked;
    if (locked) unlock.focus();
    else root.querySelector('[data-action="lock"]').focus();
  });
}
