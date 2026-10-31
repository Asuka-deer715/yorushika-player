import { applyAudioPrefix,displayMediaName,removeTrackNumber } from '../../shared/media-name';
import { access, realpath, stat } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { constants } from 'node:fs';
import { LibraryStore } from './library-store';
import type { ImportResult, MediaKind, MediaRecord } from '../../shared/library';
import {scanAudioFolder} from './audio-folder-scanner';

export const extensions = {
  audio: ['mp3', 'flac', 'm4a', 'wav', 'ogg', 'aac', 'opus'],
  mv: ['mp4', 'webm', 'mkv', 'mov'],
};

export class LibraryService {
  constructor(private store: LibraryStore) {}
  async list(): Promise<MediaRecord[]> {
    return Promise.all(this.store.list().map(async ({ id, name, kind, path }) => {
      let missing = false;
      try { await access(path, constants.R_OK); }
      catch { missing = true; }
      return { id, name:kind==='audio'?removeTrackNumber(displayMediaName(name)):displayMediaName(name), kind, missing, sourcePath:path, videoCategory:kind==='mv'?this.store.videoCategory(id):undefined, url: `local-media://library/${id}` };
    }));
  }
  async rename(id:string,name:string){this.store.rename(id,name);return this.list();}
  async removeVideo(id:string){this.store.removeVideo(id);return this.list();}
  async removeMedia(id:string){this.store.removeMedia(id);return this.list();}
  videoPath(id:string){const item=this.store.get(id);if(item.kind!=='mv')throw new Error('请选择本地视频');return item.path;}
  async setVideoCategory(id:string,category:import('../../shared/library').VideoCategory){this.store.setVideoCategory(id,category);return this.list();}
  private async checkFile(path: string, kind: MediaKind): Promise<string> {
    if (!extensions[kind].includes(extname(path).slice(1).toLowerCase())) throw new Error('文件扩展名与媒体类型不符');
    const canonical = await realpath(path);
    if (!(await stat(canonical)).isFile()) throw new Error('请选择媒体文件');
    await access(canonical, constants.R_OK);
    return canonical;
  }
  async importFiles(paths: string[], kind: MediaKind,prefix='ヨルシカ'): Promise<ImportResult> {
    const failures: ImportResult['failures'] = [];
    const previous=new Set(this.store.list().map(item=>item.id));
    for (const path of paths) {
      try {
        const canonical = await this.checkFile(path, kind);
        const name=basename(path, extname(path));
        this.store.add(canonical,kind==='audio'?applyAudioPrefix(name,prefix):name,kind);
      } catch (error) {
        failures.push({ name: basename(path), message: (error as Error).message });
      }
    }
    const items=await this.list();return { items, failures, importedIds:items.filter(item=>!previous.has(item.id)).map(item=>item.id) };
  }
  async importAudioFolder(folder:string,prefix='ヨルシカ'):Promise<ImportResult>{
    const scanned=await scanAudioFolder(folder,extensions.audio);
    const result=await this.importFiles(scanned.files,'audio',prefix);
    return {...result,failures:[...scanned.failures,...result.failures],scan:{found:scanned.files.length,duplicates:scanned.files.length-(result.importedIds?.length??0)-result.failures.length}};
  }
  async relink(id: string, path: string): Promise<MediaRecord[]> {
    const media = this.store.get(id);
    this.store.relink(id, await this.checkFile(path, media.kind));
    return this.list();
  }
}
