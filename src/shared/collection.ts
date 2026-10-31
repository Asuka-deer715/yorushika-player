export interface LyricCandidate { id:number; title:string; artist:string; album:string; duration:number; synced:boolean }
export type LyricLanguage = 'original' | 'translation' | 'romaji';
export interface LyricLine { time: number | null; text: string }
export interface Lyrics { offset: number; tracks: Record<LyricLanguage, LyricLine[]> }
export interface Playlist { id: string; name: string; mediaIds: string[] }
export type LyricProvider='netease'|'qq';
export interface PlatformCandidate {id:string;title:string;artist:string;album:string;cover:string}
export interface CollectionApi {
 audioForVideo(videoId:string):Promise<string|null>;
 videos(audioId:string):Promise<string[]>;
 linkVideo(audioId:string,videoId:string):Promise<void>;
 unlinkVideo(audioId:string,videoId:string):Promise<void>;
 cover(mediaId:string):Promise<string>;
 setCover(mediaId:string,url:string):Promise<void>;
 searchPlatformLyrics(provider:LyricProvider,title:string,artist:string):Promise<PlatformCandidate[]>;
 applyPlatformLyrics(provider:LyricProvider,mediaId:string,remoteId:string):Promise<Lyrics>;
 searchLyrics(title:string,artist:string):Promise<LyricCandidate[]>;
 applyOnlineLyrics(mediaId:string,candidateId:number):Promise<Lyrics>;
 playlists(): Promise<Playlist[]>;
 createPlaylist(name: string): Promise<Playlist[]>;
 addToPlaylist(id: string, mediaIds: string[]): Promise<Playlist[]>;
 removeFromPlaylist(id: string, mediaIds: string[]): Promise<Playlist[]>;
 lyrics(id: string): Promise<Lyrics>;
 importLyrics(id: string, language: LyricLanguage): Promise<Lyrics>;
 setOffset(id: string, offset: number): Promise<void>;
}
export function parseLyrics(text: string): LyricLine[] {
 const offset = Number(text.match(/\[offset:([+-]?\d+)\]/i)?.[1] ?? 0) / 1000;
 const result: LyricLine[] = [];
 for (const raw of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
  const stamps = [...raw.matchAll(/\[(\d+):(\d{1,2}(?:[.:]\d{1,3})?)\]/g)];
  const content = raw.replace(/\[[^\]]*\]/g, '').trim();
  if (!content) continue;
  if (!stamps.length) result.push({time:null,text:content});
  for(const stamp of stamps){const seconds=Number(stamp[2].replace(':','.'));if(seconds<60)result.push({time:Math.max(0,Number(stamp[1])*60+seconds+offset),text:content});}
 }
 return result.sort((a,b)=>(a.time??Infinity)-(b.time??Infinity));
}
