import { dialog, ipcMain, type IpcMainInvokeEvent } from 'electron';
import { LibraryService, extensions } from './library-service';
import type { MediaKind } from '../shared/library';

export function registerLibraryIpc(service: LibraryService, entryUrl: string): void {
  function authorize(event: IpcMainInvokeEvent): void {
    if (event.senderFrame !== event.sender.mainFrame || event.senderFrame.url !== entryUrl) {
      throw new Error('不允许的调用来源');
    }
  }
  ipcMain.handle('library:list', event => { authorize(event); return service.list(); });
  ipcMain.handle('library:import', async (event, kind: MediaKind) => {
    authorize(event);
    if (kind !== 'audio' && kind !== 'mv') throw new Error('无效的媒体类型');
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
