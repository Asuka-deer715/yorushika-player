import { contextBridge, ipcRenderer } from 'electron';
import type { LibraryApi } from '../shared/library';

const library: LibraryApi = {
  list: () => ipcRenderer.invoke('library:list'),
  rename:(id,name)=>ipcRenderer.invoke('library:rename',id,name),
  removeVideo:id=>ipcRenderer.invoke('library:remove-video',id),
  removeMedia:id=>ipcRenderer.invoke('library:remove-media',id),
  subtitleTracks:id=>ipcRenderer.invoke('library:subtitle-tracks',id),
  subtitleText:(id,index)=>ipcRenderer.invoke('library:subtitle-text',id,index),
  subtitleOverlay:(id,index,jobId)=>ipcRenderer.invoke('subtitle-overlay:prepare',id,index,jobId),
  cancelSubtitleOverlay:()=>ipcRenderer.invoke('subtitle-overlay:cancel'),
  onSubtitleProgress:handler=>{const listener:Parameters<typeof ipcRenderer.on>[1]=(_event,progress)=>handler(progress);ipcRenderer.on('subtitle-overlay:progress',listener);return ()=>ipcRenderer.removeListener('subtitle-overlay:progress',listener);},
  setVideoCategory:(id,category)=>ipcRenderer.invoke('library:video-category',id,category),
  importFiles: (kind,prefix) => ipcRenderer.invoke('library:import', kind,prefix),
  importAudioFolder:prefix=>ipcRenderer.invoke('library:import-audio-folder',prefix),
  relink: id => ipcRenderer.invoke('library:relink', id),
};
contextBridge.exposeInMainWorld('library', library);

import type { CollectionApi } from '../shared/collection';
const collection: CollectionApi = {
 autoMetadata:id=>ipcRenderer.invoke('collection:auto-metadata',id),
 catalogVideos:()=>ipcRenderer.invoke('catalog:videos'),addCatalogVideo:(release,track,video)=>ipcRenderer.invoke('catalog:video-add',release,track,video),removeCatalogVideo:(release,track,video)=>ipcRenderer.invoke('catalog:video-remove',release,track,video),
 catalogAssignments:()=>ipcRenderer.invoke('catalog:assignments'),assignCatalog:(media,release,track)=>ipcRenderer.invoke('catalog:assign',media,release,track),unassignCatalog:media=>ipcRenderer.invoke('catalog:unassign',media),
 audioForVideo:id=>ipcRenderer.invoke('video-links:audio-for-video',id),
 videos:id=>ipcRenderer.invoke('video-links:list',id),linkVideo:(a,v)=>ipcRenderer.invoke('video-links:add',a,v),unlinkVideo:(a,v)=>ipcRenderer.invoke('video-links:remove',a,v),
 cover:id=>ipcRenderer.invoke('cover:get',id),setCover:(id,url)=>ipcRenderer.invoke('cover:set',id,url),
 searchPlatformLyrics:(provider,title,artist)=>ipcRenderer.invoke('lyrics:platform-search',provider,title,artist),
 applyPlatformLyrics:(provider,id,remote)=>ipcRenderer.invoke('lyrics:platform-apply',provider,id,remote),
 searchLyrics:(title,artist)=>ipcRenderer.invoke('lyrics:search',title,artist),
 applyOnlineLyrics:(id,candidate)=>ipcRenderer.invoke('lyrics:apply-online',id,candidate),
 renamePlaylist:(id,name)=>ipcRenderer.invoke('collection:rename',id,name),setPlaylistCover:(id,cover)=>ipcRenderer.invoke('collection:cover',id,cover),reorderPlaylist:(id,mediaIds)=>ipcRenderer.invoke('collection:reorder',id,mediaIds),
 setPlaylistDescription:(id,description)=>ipcRenderer.invoke('collection:description',id,description),
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

contextBridge.exposeInMainWorld('catalogSearch',{official:()=>ipcRenderer.invoke('catalog:official-videos'),open:(title:string,artist:string)=>ipcRenderer.invoke('catalog:open-search',title,artist)});

contextBridge.exposeInMainWorld('auxWindows',{unlockLyrics:()=>ipcRenderer.invoke('aux:unlock-lyrics'),open:(kind:string)=>ipcRenderer.invoke('aux:open',kind),close:(kind:string)=>ipcRenderer.invoke('aux:close',kind),publish:(state:unknown)=>ipcRenderer.send('aux:publish',state),onAction:(callback:(action:string)=>void)=>ipcRenderer.on('aux:action',(_event,action)=>callback(action)),onRequest:(callback:()=>void)=>ipcRenderer.on('aux:request-state',()=>callback()),onClosed:(callback:(kind:string)=>void)=>ipcRenderer.on('aux:closed',(_event,kind)=>callback(kind))});

contextBridge.exposeInMainWorld('catalogCoverCache',{get:(id:string)=>ipcRenderer.invoke('catalog-cover:get',id),save:(id:string,url:string)=>ipcRenderer.invoke('catalog-cover:save',id,url)});

contextBridge.exposeInMainWorld('homeGallery',{get:()=>ipcRenderer.invoke('home-gallery:get'),set:(state:unknown)=>ipcRenderer.invoke('home-gallery:set',state)});

contextBridge.exposeInMainWorld('storySources',{open:(url:string)=>ipcRenderer.invoke('story:source',url),details:()=>ipcRenderer.invoke('story:details')});
