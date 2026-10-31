import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Playlist, Lyrics, LyricLanguage, LyricLine } from '../shared/collection';
export class CollectionStore {
 private db: DatabaseSync;
 constructor(filename: string) {
  this.db=new DatabaseSync(filename);
  this.db.exec(`PRAGMA foreign_keys=ON;
   CREATE TABLE IF NOT EXISTS media_video_links(audio_id TEXT NOT NULL REFERENCES media(id),video_id TEXT NOT NULL REFERENCES media(id),PRIMARY KEY(audio_id,video_id));
   CREATE TABLE IF NOT EXISTS media_covers(media_id TEXT PRIMARY KEY REFERENCES media(id),url TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS playlists(id TEXT PRIMARY KEY,name TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS playlist_entries(playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,media_id TEXT REFERENCES media(id),position INTEGER NOT NULL,PRIMARY KEY(playlist_id,media_id));
   CREATE TABLE IF NOT EXISTS lyric_tracks(media_id TEXT REFERENCES media(id),language TEXT NOT NULL,lines TEXT NOT NULL,PRIMARY KEY(media_id,language));
   CREATE TABLE IF NOT EXISTS lyric_offsets(media_id TEXT PRIMARY KEY REFERENCES media(id),offset REAL NOT NULL);`);
 }
 audioForVideo(id:string):string|null{const rows=this.db.prepare('SELECT audio_id FROM media_video_links WHERE video_id=? LIMIT 2').all(id);return rows.length===1?rows[0].audio_id as string:null;}
 videos(id:string):string[]{return this.db.prepare('SELECT video_id FROM media_video_links WHERE audio_id=? ORDER BY rowid').all(id).map(row=>row.video_id as string);}
 linkVideo(audio:string,video:string){const pair=this.db.prepare('SELECT id,kind FROM media WHERE id IN (?,?)').all(audio,video);if(!pair.some(row=>row.id===audio&&row.kind==='audio')||!pair.some(row=>row.id===video&&row.kind==='mv'))throw new Error('请选择本地音频与视频');this.db.prepare('INSERT INTO media_video_links VALUES(?,?) ON CONFLICT DO NOTHING').run(audio,video);}
 unlinkVideo(audio:string,video:string){this.db.prepare('DELETE FROM media_video_links WHERE audio_id=? AND video_id=?').run(audio,video);}
 cover(id:string):string{return (this.db.prepare('SELECT url FROM media_covers WHERE media_id=?').get(id)?.url as string|undefined)??'';}
 setCover(id:string,url:string){this.db.prepare('INSERT INTO media_covers VALUES(?,?) ON CONFLICT(media_id) DO UPDATE SET url=excluded.url').run(id,url);}
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
