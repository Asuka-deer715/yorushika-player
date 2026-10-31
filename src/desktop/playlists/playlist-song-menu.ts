import {t} from '../localization/i18n.js';
import type {CollectionApi} from '../../shared/collection.js';
import type {MediaRecord} from '../../shared/library.js';

export function playlistSongMenu(api:CollectionApi,mediaId:string,notify:(message:string)=>void,label='更多',versions:MediaRecord[]=[]){
 const menu=document.createElement('details');menu.className='catalog-more playlist-song-more';
 const summary=document.createElement('summary');summary.textContent=t(label);menu.append(summary);
 const panel=document.createElement('div');panel.className='catalog-more-panel';menu.append(panel);
 menu.ontoggle=()=>{if(!menu.open)return;const parentPanel=menu.parentElement?.closest<HTMLElement>('.catalog-more-panel');if(parentPanel){const parent=parentPanel.getBoundingClientRect();const own=summary.getBoundingClientRect();const width=Math.min(230,window.innerWidth-16);panel.style.position='absolute';panel.style.width=width+'px';panel.style.left=(parent.left>=width+12?parent.left-own.left-width-6:parent.right-own.left+6)+'px';panel.style.right='auto';panel.style.top=(Math.max(8,Math.min(own.top,window.innerHeight-270))-own.top)+'px';}panel.textContent=t('正在读取歌单…');void api.playlists().then(playlists=>{
  if(!menu.open)return;panel.replaceChildren();const title=document.createElement('strong');title.textContent=t('加入歌单');panel.append(title);let selected=mediaId;
  const picker=document.createElement('select');if(versions.length>1){picker.setAttribute('aria-label',t('选择本地版本'));for(const version of versions){const option=document.createElement('option');option.value=version.id;option.textContent=version.sourcePath??version.name;picker.append(option);}selected=picker.value;panel.append(picker);}
  if(!playlists.length){const hint=document.createElement('p');hint.textContent=t('还没有歌单，请先在“我的歌单”中创建。');panel.append(hint);return;}
  const buttons:HTMLButtonElement[]=[];const refresh=()=>{for(const [i,playlist] of playlists.entries()){const included=playlist.mediaIds.includes(selected);buttons[i].textContent=playlist.name+(included?t(' · 已加入'):'');buttons[i].disabled=included;}};
  for(const playlist of playlists){const button=document.createElement('button');button.type='button';button.onclick=()=>{button.disabled=true;void api.addToPlaylist(playlist.id,[selected]).then(()=>{menu.open=false;notify(t('已加入 ')+playlist.name);}).catch(error=>{button.disabled=false;notify((error as Error).message);});};buttons.push(button);panel.append(button);}picker.onchange=()=>{selected=picker.value;refresh();};refresh();
 }).catch(()=>{panel.textContent=t('无法读取歌单，请重试。');});};
 return menu;
}
