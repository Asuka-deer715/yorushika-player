import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { MediaKind, VideoCategory } from '../shared/library';

export interface StoredMedia { id: string; name: string; kind: MediaKind; path: string }

// 数据库只负责记录，不执行文件操作或控制播放器。
export class LibraryStore {
  private db: DatabaseSync;
  constructor(filename: string) {
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY, name TEXT NOT NULL,
        kind TEXT NOT NULL CHECK(kind IN ('audio','mv')),
        path TEXT NOT NULL COLLATE NOCASE UNIQUE
      );
      CREATE TABLE IF NOT EXISTS video_categories (media_id TEXT PRIMARY KEY REFERENCES media(id) ON DELETE CASCADE,category TEXT NOT NULL CHECK(category IN ('official','live','unclassified')));`);
  }
  list(): StoredMedia[] {
    return this.db.prepare('SELECT * FROM media ORDER BY rowid').all() as unknown as StoredMedia[];
  }
  get(id: string): StoredMedia {
    const row = this.db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!row) throw new Error('媒体记录不存在');
    return row as unknown as StoredMedia;
  }
  add(path: string, name: string, kind: MediaKind): void {
    this.db.prepare('INSERT INTO media VALUES (?, ?, ?, ?) ON CONFLICT(path) DO NOTHING')
      .run(randomUUID(), name, kind, path);
  }
  videoCategory(id:string):VideoCategory {return (this.db.prepare('SELECT category FROM video_categories WHERE media_id=?').get(id)?.category as VideoCategory|undefined)??'unclassified';}
  setVideoCategory(id:string,category:VideoCategory):void {if(this.get(id).kind!=='mv')throw new Error('请选择本地视频');this.db.prepare('INSERT INTO video_categories VALUES(?,?) ON CONFLICT(media_id) DO UPDATE SET category=excluded.category').run(id,category);}
  relink(id: string, path: string): void {
    this.get(id);
    this.db.prepare('UPDATE media SET path = ? WHERE id = ?').run(path, id);
  }
  close(): void { this.db.close(); }
}
