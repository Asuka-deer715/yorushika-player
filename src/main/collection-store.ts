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
   CREATE TABLE IF NOT EXISTS playlist_details(playlist_id TEXT PRIMARY KEY REFERENCES playlists(id) ON DELETE CASCADE,created_at TEXT,cover TEXT NOT NULL DEFAULT '');
   CREATE TABLE IF NOT EXISTS playlist_entries(playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,media_id TEXT REFERENCES media(id),position INTEGER NOT NULL,PRIMARY KEY(playlist_id,media_id));
   CREATE TABLE IF NOT EXISTS lyric_tracks(media_id TEXT REFERENCES media(id),language TEXT NOT NULL,lines TEXT NOT NULL,PRIMARY KEY(media_id,language));
   CREATE TABLE IF NOT EXISTS lyric_offsets(media_id TEXT PRIMARY KEY REFERENCES media(id),offset REAL NOT NULL);
   CREATE TABLE IF NOT EXISTS catalog_videos(release_id TEXT NOT NULL,track TEXT NOT NULL,video_id TEXT NOT NULL REFERENCES media(id),PRIMARY KEY(release_id,track,video_id));
   CREATE TABLE IF NOT EXISTS catalog_assignments(media_id TEXT PRIMARY KEY REFERENCES media(id),release_id TEXT NOT NULL,track TEXT NOT NULL);`);
 }
 catalogVideos(){return this.db.prepare('SELECT release_id AS releaseId,track,video_id AS videoId FROM catalog_videos').all().map(row=>({releaseId:row.releaseId as string,track:row.track as string,videoId:row.videoId as string}));}
 addCatalogVideo(releaseId:string,track:string,videoId:string){const video=this.db.prepare('SELECT kind FROM media WHERE id=?').get(videoId);if(!video||video.kind!=='mv')throw new Error('请选择本地视频');this.db.prepare('INSERT INTO catalog_videos VALUES(?,?,?) ON CONFLICT DO NOTHING').run(releaseId,track,videoId);return this.catalogVideos();}
 removeCatalogVideo(releaseId:string,track:string,videoId:string){this.db.prepare('DELETE FROM catalog_videos WHERE release_id=? AND track=? AND video_id=?').run(releaseId,track,videoId);return this.catalogVideos();}
 catalogAssignments(){return this.db.prepare('SELECT media_id AS mediaId,release_id AS releaseId,track FROM catalog_assignments').all().map(row=>({mediaId:row.mediaId as string,releaseId:row.releaseId as string,track:row.track as string}));}
 assignCatalog(mediaId:string,releaseId:string,track:string){const media=this.db.prepare('SELECT kind FROM media WHERE id=?').get(mediaId);if(!media||media.kind!=='audio')throw new Error('请选择本地歌曲');this.db.prepare('INSERT INTO catalog_assignments VALUES(?,?,?) ON CONFLICT(media_id) DO UPDATE SET release_id=excluded.release_id,track=excluded.track').run(mediaId,releaseId,track);return this.catalogAssignments();}
 unassignCatalog(mediaId:string){this.db.prepare('DELETE FROM catalog_assignments WHERE media_id=?').run(mediaId);return this.catalogAssignments();}
 audioForMetadata(id:string){const row=this.db.prepare("SELECT name FROM media WHERE id=? AND kind='audio'").get(id);return row?{name:row.name as string}:null;}
 audioForVideo(id:string):string|null{const rows=this.db.prepare('SELECT audio_id FROM media_video_links WHERE video_id=? LIMIT 2').all(id);return rows.length===1?rows[0].audio_id as string:null;}
 videos(id:string):string[]{return this.db.prepare('SELECT video_id FROM media_video_links WHERE audio_id=? ORDER BY rowid').all(id).map(row=>row.video_id as string);}
 linkVideo(audio:string,video:string){const pair=this.db.prepare('SELECT id,kind FROM media WHERE id IN (?,?)').all(audio,video);if(!pair.some(row=>row.id===audio&&row.kind==='audio')||!pair.some(row=>row.id===video&&row.kind==='mv'))throw new Error('请选择本地音频与视频');this.db.prepare('INSERT INTO media_video_links VALUES(?,?) ON CONFLICT DO NOTHING').run(audio,video);}
 unlinkVideo(audio:string,video:string){this.db.prepare('DELETE FROM media_video_links WHERE audio_id=? AND video_id=?').run(audio,video);}
 cover(id:string):string{return (this.db.prepare('SELECT url FROM media_covers WHERE media_id=?').get(id)?.url as string|undefined)??'';}
 setCover(id:string,url:string){this.db.prepare('INSERT INTO media_covers VALUES(?,?) ON CONFLICT(media_id) DO UPDATE SET url=excluded.url').run(id,url);}
 playlists():Playlist[]{return (this.db.prepare('SELECT * FROM playlists ORDER BY rowid').all() as unknown as {id:string;name:string}[]).map(row=>({...row,...this.playlistDetails(row.id),mediaIds:this.db.prepare('SELECT media_id FROM playlist_entries WHERE playlist_id=? ORDER BY position').all(row.id).map(entry=>entry.media_id as string)}));}
 private playlistDetails(id:string){const row=this.db.prepare('SELECT created_at,cover FROM playlist_details WHERE playlist_id=?').get(id);return {createdAt:(row?.created_at as string|undefined)??null,cover:(row?.cover as string|undefined)??''};}
 create(name:string){const id=randomUUID();this.db.exec('BEGIN');try{this.db.prepare('INSERT INTO playlists VALUES(?,?)').run(id,name);this.db.prepare('INSERT INTO playlist_details(playlist_id,created_at) VALUES(?,?)').run(id,new Date().toISOString());this.db.exec('COMMIT');}catch(error){this.db.exec('ROLLBACK');throw error;}return this.playlists();}
 renamePlaylist(id:string,name:string){const result=this.db.prepare('UPDATE playlists SET name=? WHERE id=?').run(name,id);if(!result.changes)throw new Error('歌单不存在');return this.playlists();}
 setPlaylistCover(id:string,cover:string){this.db.prepare('INSERT INTO playlist_details(playlist_id,cover) VALUES(?,?) ON CONFLICT(playlist_id) DO UPDATE SET cover=excluded.cover').run(id,cover);return this.playlists();}
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
