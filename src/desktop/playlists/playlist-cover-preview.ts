import {t} from '../localization/i18n.js';

export function previewPlaylistCover(src: string, name: string, change: () => void) {
 const dialog = document.createElement('dialog');
 dialog.className = 'playlist-cover-preview';
 dialog.setAttribute('aria-label', name + ' · ' + t('歌单封面'));
 const image = document.createElement('img');
 image.src = src;
 image.alt = t('歌单封面');
 if (src.includes('yorushika-official-mark.svg')) image.className = 'preview-placeholder';
 const edit = document.createElement('button');
 edit.type = 'button';
 edit.className = 'playlist-cover-preview-edit';
 edit.textContent = t('更换封面');
 edit.onclick = () => { dialog.close(); change(); };
 dialog.append(image, edit);
 dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
 });
 dialog.onclose = () => dialog.remove();
 document.body.append(dialog);
 dialog.showModal();
}
