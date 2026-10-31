import { displayMediaName } from '../../shared/media-name';
import { access, realpath, stat } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { constants } from 'node:fs';
import { LibraryStore } from './library-store';
import type { ImportResult, MediaKind, MediaRecord } from '../../shared/library';

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
      return { id, name:displayMediaName(name), kind, missing, videoCategory:kind==='mv'?this.store.videoCategory(id):undefined, url: `local-media://library/${id}` };
    }));
  }
  async rename(id:string,name:string){this.store.rename(id,name);return this.list();}
  async removeVideo(id:string){this.store.removeVideo(id);return this.list();}
  videoPath(id:string){const item=this.store.get(id);if(item.kind!=='mv')throw new Error('请选择本地视频');return item.path;}
  async setVideoCategory(id:string,category:import('../../shared/library').VideoCategory){this.store.setVideoCategory(id,category);return this.list();}
  private async checkFile(path: string, kind: MediaKind): Promise<string> {
    if (!extensions[kind].includes(extname(path).slice(1).toLowerCase())) throw new Error('文件扩展名与媒体类型不符');
    const canonical = await realpath(path);
    if (!(await stat(canonical)).isFile()) throw new Error('请选择媒体文件');
    await access(canonical, constants.R_OK);
    return canonical;
  }
  async importFiles(paths: string[], kind: MediaKind): Promise<ImportResult> {
    const failures: ImportResult['failures'] = [];
    const previous=new Set(this.store.list().map(item=>item.id));
    for (const path of paths) {
      try {
        const canonical = await this.checkFile(path, kind);
        this.store.add(canonical, basename(path, extname(path)), kind);
      } catch (error) {
        failures.push({ name: basename(path), message: (error as Error).message });
      }
    }
    const items=await this.list();return { items, failures, importedIds:items.filter(item=>!previous.has(item.id)).map(item=>item.id) };
  }
  async relink(id: string, path: string): Promise<MediaRecord[]> {
    const media = this.store.get(id);
    this.store.relink(id, await this.checkFile(path, media.kind));
    return this.list();
  }
}
