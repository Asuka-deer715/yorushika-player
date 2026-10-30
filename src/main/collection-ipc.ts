import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { readFile, stat } from 'node:fs/promises';
import { CollectionStore } from './collection-store';
import { parseLyrics, type LyricLanguage } from '../shared/collection';
export function registerCollectionIpc(store:CollectionStore,entryUrl:string){
 const auth=(event:IpcMainInvokeEvent)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');};
 const id=(value:unknown):string=>{if(typeof value!=='string'||!value.length||value.length>100)throw new Error('无效的记录编号');return value;};
 const ids=(value:unknown):string[]=>{if(!Array.isArray(value)||value.length>10000)throw new Error('无效的选择列表');return value.map(id);};
 ipcMain.handle('collection:list',e=>{auth(e);return store.playlists();});
 ipcMain.handle('collection:create',(e,name:unknown)=>{auth(e);if(typeof name!=='string'||!name.trim()||name.trim().length>80)throw new Error('歌单名称需要为 1–80 个字符');return store.create(name.trim());});
 ipcMain.handle('collection:add',(e,p,items)=>{auth(e);return store.add(id(p),ids(items));});
 ipcMain.handle('collection:remove',(e,p,items)=>{auth(e);return store.remove(id(p),ids(items));});
 ipcMain.handle('lyrics:get',(e,media)=>{auth(e);return store.lyrics(id(media));});
 ipcMain.handle('lyrics:offset',(e,media,offset)=>{auth(e);if(typeof offset!=='number'||!Number.isFinite(offset)||Math.abs(offset)>600000)throw new Error('偏移范围为正负 600 秒');store.setOffset(id(media),offset);});
 ipcMain.handle('lyrics:import',async(e,media,language:LyricLanguage)=>{auth(e);id(media);if(!['original','translation','romaji'].includes(language))throw new Error('无效的歌词语言');const selected=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'歌词',extensions:['lrc','txt']}]});if(selected.canceled)return store.lyrics(media);const file=selected.filePaths[0];if((await stat(file)).size>2*1024*1024)throw new Error('歌词文件不能超过 2 MB');const lines=parseLyrics(await readFile(file,'utf8'));if(!lines.length)throw new Error('文件中没有可显示的歌词');return store.saveLyrics(media,language,lines);});
}
