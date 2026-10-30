import { net } from 'electron';
import type { LyricCandidate } from '../shared/collection';
interface Record { id:number; trackName:string; artistName:string; albumName:string; duration:number; syncedLyrics:string|null; plainLyrics:string|null }
export class OnlineLyrics {
 private async get(path:string):Promise<unknown>{
  const response=await net.fetch('https://lrclib.net/api/'+path,{headers:{'User-Agent':'YorushikaPlayer/0.1.2 (https://github.com/Asuka-deer715/yorushika-player)'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`歌词服务暂时不可用（${response.status}），请稍后重试`);
  return response.json();
 }
 async search(title:string,artist:string):Promise<LyricCandidate[]>{
  const params=new URLSearchParams({track_name:title,artist_name:artist});const data=await this.get('search?'+params);
  if(!Array.isArray(data))throw new Error('歌词服务返回了无效结果');
  return data.filter((row):row is Record=>typeof row.id==='number'&&typeof row.trackName==='string'&&typeof row.artistName==='string'&&(typeof row.syncedLyrics==='string'||typeof row.plainLyrics==='string')).slice(0,20).map(row=>({id:row.id,title:row.trackName,artist:row.artistName,album:row.albumName,duration:row.duration,synced:!!row.syncedLyrics}));
 }
 async text(id:number):Promise<string>{const row=await this.get('get/'+id) as Record;const text=row.syncedLyrics||row.plainLyrics;if(typeof text!=='string'||!text.trim())throw new Error('该结果没有可用歌词');return text;}
}
