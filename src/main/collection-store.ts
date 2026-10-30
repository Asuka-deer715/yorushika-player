import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Playlist, Lyrics, LyricLanguage, LyricLine } from '../shared/collection';
export class CollectionStore {
 private db: DatabaseSync;
 constructor(filename: string) {
  this.db=new DatabaseSync(filename);
  this.db.exec(`PRAGMA foreign_keys=ON;
   CREATE TABLE IF NOT EXISTS playlists(id TEXT PRIMARY KEY,name TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS playlist_entries(playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,media_id TEXT REFERENCES media(id),position INTEGER NOT NULL,PRIMARY KEY(playlist_id,media_id));
   CREATE TABLE IF NOT EXISTS lyric_tracks(media_id TEXT REFERENCES media(id),language TEXT NOT NULL,lines TEXT NOT NULL,PRIMARY KEY(media_id,language));
   CREATE TABLE IF NOT EXISTS lyric_offsets(media_id TEXT PRIMARY KEY REFERENCES media(id),offset REAL NOT NULL);`);
 }
 playlists():Playlist[]{return (this.db.prepare('SELECT * FROM playlists ORDER BY rowid').all() as unknown as {id:string;name:string}[]).map(row=>({...row,mediaIds:this.db.prepare('SELECT media_id FROM playlist_entries WHERE playlist_id=? ORDER BY position').all(row.id).map(entry=>entry.media_id as string)}));}
 create(name:string){this.db.prepare('INSERT INTO playlists VALUES(?,?)').run(randomUUID(),name);return this.playlists();}
 add(id:string,mediaIds:string[]){
  this.db.exec('BEGIN');
  try {const max=this.db.prepare('SELECT COALESCE(MAX(position),-1) AS n FROM playlist_entries WHERE playlist_id=?').get(id)!.n as number;
   const insert=this.db.prepare('INSERT INTO playlist_entries VALUES(?,?,?) ON CONFLICT DO NOTHING');mediaIds.forEach((mediaId,i)=>insert.run(id,mediaId,max+i+1));this.db.exec('COMMIT');
  }catch(error){this.db.exec('ROLLBACK');throw error;}return this.playlists();
 }
 remove(id:string,mediaIds:string[]){this.db.exec('BEGIN');try{const remove=this.db.prepare('DELETE FROM playlist_entries WHERE playlist_id=? AND media_id=?');mediaIds.forEach(mediaId=>remove.run(id,mediaId));this.db.exec('COMMIT');}catch(error){this.db.exec('ROLLBACK');throw error;}return this.playlists();}
 lyrics(id:string):Lyrics{const result:Lyrics={offset:0,tracks:{original:[],translation:[],romaji:[]}};const offset=this.db.prepare('SELECT offset FROM lyric_offsets WHERE media_id=?').get(id);if(offset)result.offset=offset.offset as number;for(const row of this.db.prepare('SELECT language,lines FROM lyric_tracks WHERE media_id=?').all(id))result.tracks[row.language as LyricLanguage]=JSON.parse(row.lines as string) as LyricLine[];return result;}
 saveLyrics(id:string,language:LyricLanguage,lines:LyricLine[]){this.db.prepare('INSERT INTO lyric_tracks VALUES(?,?,?) ON CONFLICT(media_id,language) DO UPDATE SET lines=excluded.lines').run(id,language,JSON.stringify(lines));return this.lyrics(id);}
 saveLyricsBundle(id:string,tracks:Lyrics['tracks']){this.db.exec('BEGIN');try{for(const language of ['original','translation','romaji'] as const){if(tracks[language].length)this.saveLyrics(id,language,tracks[language]);}this.db.exec('COMMIT');}catch(error){this.db.exec('ROLLBACK');throw error;}return this.lyrics(id);}
 setOffset(id:string,offset:number){this.db.prepare('INSERT INTO lyric_offsets VALUES(?,?) ON CONFLICT(media_id) DO UPDATE SET offset=excluded.offset').run(id,offset);}
 close(){this.db.close();}
}
