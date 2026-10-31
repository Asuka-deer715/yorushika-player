import { contextBridge, ipcRenderer } from 'electron';
import type { LibraryApi } from '../shared/library';

const library: LibraryApi = {
  list: () => ipcRenderer.invoke('library:list'),
  setVideoCategory:(id,category)=>ipcRenderer.invoke('library:video-category',id,category),
  importFiles: kind => ipcRenderer.invoke('library:import', kind),
  relink: id => ipcRenderer.invoke('library:relink', id),
};
contextBridge.exposeInMainWorld('library', library);

import type { CollectionApi } from '../shared/collection';
const collection: CollectionApi = {
 audioForVideo:id=>ipcRenderer.invoke('video-links:audio-for-video',id),
 videos:id=>ipcRenderer.invoke('video-links:list',id),linkVideo:(a,v)=>ipcRenderer.invoke('video-links:add',a,v),unlinkVideo:(a,v)=>ipcRenderer.invoke('video-links:remove',a,v),
 cover:id=>ipcRenderer.invoke('cover:get',id),setCover:(id,url)=>ipcRenderer.invoke('cover:set',id,url),
 searchPlatformLyrics:(provider,title,artist)=>ipcRenderer.invoke('lyrics:platform-search',provider,title,artist),
 applyPlatformLyrics:(provider,id,remote)=>ipcRenderer.invoke('lyrics:platform-apply',provider,id,remote),
 searchLyrics:(title,artist)=>ipcRenderer.invoke('lyrics:search',title,artist),
 applyOnlineLyrics:(id,candidate)=>ipcRenderer.invoke('lyrics:apply-online',id,candidate),
 playlists:()=>ipcRenderer.invoke('collection:list'),createPlaylist:name=>ipcRenderer.invoke('collection:create',name),
 addToPlaylist:(id,items)=>ipcRenderer.invoke('collection:add',id,items),removeFromPlaylist:(id,items)=>ipcRenderer.invoke('collection:remove',id,items),
 lyrics:id=>ipcRenderer.invoke('lyrics:get',id),importLyrics:(id,language)=>ipcRenderer.invoke('lyrics:import',id,language),setOffset:(id,offset)=>ipcRenderer.invoke('lyrics:offset',id,offset),
};
contextBridge.exposeInMainWorld('collection',collection);

import type { OnlineSourcesApi } from '../shared/online-sources';
const sources:OnlineSourcesApi={list:()=>ipcRenderer.invoke('sources:list'),add:(input,title)=>ipcRenderer.invoke('sources:add',input,title),remove:key=>ipcRenderer.invoke('sources:remove',key),open:key=>ipcRenderer.invoke('sources:open',key),lyrics:(key,mediaId)=>ipcRenderer.invoke('sources:lyrics',key,mediaId)};
contextBridge.exposeInMainWorld('sources',sources);

contextBridge.exposeInMainWorld('appearance',{setIntro:(active:boolean)=>ipcRenderer.invoke('appearance:intro',active),whenVisible:()=>ipcRenderer.invoke('appearance:visible'),setColors:(background:string,foreground:string)=>ipcRenderer.invoke('appearance:colors',background,foreground)});

contextBridge.exposeInMainWorld('windowSettings',{getCloseBehavior:()=>ipcRenderer.invoke('window:close-behavior:get'),setCloseBehavior:(mode:string)=>ipcRenderer.invoke('window:close-behavior:set',mode)});

contextBridge.exposeInMainWorld('closeDialog',{onRequest:(callback:()=>void)=>ipcRenderer.on('window:close-request',()=>callback()),respond:(mode:string,remember:boolean)=>ipcRenderer.invoke('window:close-response',mode,remember)});
