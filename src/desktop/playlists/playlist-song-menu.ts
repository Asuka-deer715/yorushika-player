import {t} from '../localization/i18n.js';
import type {CollectionApi} from '../../shared/collection.js';

export function playlistSongMenu(api:CollectionApi,mediaId:string,notify:(message:string)=>void){
 const menu=document.createElement('details');menu.className='catalog-more playlist-song-more';
 const summary=document.createElement('summary');summary.textContent=t('更多');menu.append(summary);
 const panel=document.createElement('div');panel.className='catalog-more-panel';menu.append(panel);
 menu.ontoggle=()=>{if(!menu.open)return;panel.textContent=t('正在读取歌单…');void api.playlists().then(playlists=>{
  if(!menu.open)return;panel.replaceChildren();const title=document.createElement('strong');title.textContent=t('加入歌单');panel.append(title);
  if(!playlists.length){const hint=document.createElement('p');hint.textContent=t('还没有歌单，请先在“我的歌单”中创建。');panel.append(hint);return;}
  for(const playlist of playlists){const button=document.createElement('button');button.type='button';button.textContent=playlist.name+(playlist.mediaIds.includes(mediaId)?t(' · 已加入'):'');button.disabled=playlist.mediaIds.includes(mediaId);button.onclick=()=>{button.disabled=true;void api.addToPlaylist(playlist.id,[mediaId]).then(()=>{menu.open=false;notify(t('已加入 ')+playlist.name);}).catch(error=>{button.disabled=false;notify((error as Error).message);});};panel.append(button);}
 }).catch(()=>{panel.textContent=t('无法读取歌单，请重试。');});};
 return menu;
}
