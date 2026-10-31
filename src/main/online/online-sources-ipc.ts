import { ipcMain, shell, type IpcMainInvokeEvent } from 'electron';
import { OnlineSourceStore } from './online-source-store';
import { PlatformLyrics } from './platform-lyrics';
import type { CollectionStore } from '../collection/collection-store';
export { OnlineSourceStore };
export function registerOnlineSourcesIpc(store:OnlineSourceStore,collection:CollectionStore,entryUrl:string){
 const provider=new PlatformLyrics();
 const auth=(event:IpcMainInvokeEvent)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');};
 const text=(value:unknown,max:number)=>{if(typeof value!=='string'||value.length>max)throw new Error('无效的输入');return value;};
 ipcMain.handle('sources:list',e=>{auth(e);return store.list();});
 ipcMain.handle('sources:add',(e,input,title)=>{auth(e);return store.add(text(input,2048),text(title,200));});
 ipcMain.handle('sources:remove',(e,key)=>{auth(e);return store.remove(text(key,100));});
 ipcMain.handle('sources:open',async(e,key)=>{auth(e);await shell.openExternal(store.get(text(key,100)).url);});
 ipcMain.handle('sources:lyrics',async(e,key,mediaId)=>{auth(e);const id=text(mediaId,100);const tracks=await provider.fetch(store.get(text(key,100)));return collection.saveLyricsBundle(id,tracks);});
}
