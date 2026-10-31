import { importBiliCache } from './bili-cache';
import { app } from 'electron';
import { join } from 'node:path';
import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { LibraryService, extensions } from './library-service';
import type { MediaKind } from '../shared/library';

export function registerLibraryIpc(service: LibraryService, entryUrl: string): void {
  function authorize(event: IpcMainInvokeEvent): void {
    if (event.senderFrame !== event.sender.mainFrame || event.senderFrame.url !== entryUrl) {
      throw new Error('不允许的调用来源');
    }
  }
  ipcMain.handle('library:video-category',(event,id:unknown,category:unknown)=>{authorize(event);if(typeof id!=='string'||!['official','live','unclassified'].includes(category as string))throw new Error('无效的视频分类');return service.setVideoCategory(id,category as import('../shared/library').VideoCategory);});
  ipcMain.handle('library:rename',(event,id:unknown,name:unknown)=>{authorize(event);if(typeof id!=='string'||typeof name!=='string'||!name.trim()||name.trim().length>200)throw new Error('名称需要为 1–200 个字符');return service.rename(id,name.trim());});
  ipcMain.handle('library:list', event => { authorize(event); return service.list(); });
  ipcMain.handle('library:import', async (event, kind: MediaKind) => {
    authorize(event);
    if (kind !== 'audio' && kind !== 'mv') throw new Error('无效的媒体类型');
    if(kind==='mv'){
      const choice=await dialog.showMessageBox({type:'question',title:'导入视频',message:'选择要导入的视频',detail:'普通视频可直接导入。B 站下载缓存中的音视频需要先合并，并保存为新文件。',buttons:['选择视频文件','选择 B 站缓存目录','取消'],defaultId:0,cancelId:2,noLink:true});
      if(choice.response===2)return {items:await service.list(),failures:[]};
      if(choice.response===1){
        const source=await dialog.showOpenDialog({title:'选择 B 站下载目录',properties:['openDirectory']});
        if(source.canceled)return {items:await service.list(),failures:[]};
        const target=await dialog.showOpenDialog({title:'选择保存合并后视频的文件夹',properties:['openDirectory','createDirectory']});
        if(target.canceled)return {items:await service.list(),failures:[]};
        const binary=app.isPackaged?join(process.resourcesPath,'ffmpeg','ffmpeg.exe'):(process.env.YORUSHIKA_FFMPEG||'ffmpeg');
        const result=await importBiliCache(source.filePaths[0],target.filePaths[0],binary);
        const imported=await service.importFiles(result.done,'mv');
        return {items:imported.items,cache:{found:result.found,converted:result.done.length-imported.failures.length},failures:[...result.failures,...imported.failures,...(!result.found?[{name:'B 站缓存',message:'未找到成对的音视频缓存'}]:[])]};
      }
    }
    const selection = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'],
      filters: [{ name: kind === 'audio' ? '音频' : '视频', extensions: extensions[kind] }] });
    return service.importFiles(selection.filePaths, kind);
  });
  ipcMain.handle('library:relink', async (event, id: string) => {
    authorize(event);
    if (typeof id !== 'string') throw new Error('无效的媒体编号');
    const selection = await dialog.showOpenDialog({ properties: ['openFile'] });
    return selection.canceled ? service.list() : service.relink(id, selection.filePaths[0]);
  });
}
