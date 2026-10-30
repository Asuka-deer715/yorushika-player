import { net } from 'electron';
import { parseLyrics, type Lyrics } from '../shared/collection';
import type { OnlineSource } from '../shared/online-sources';
export class PlatformLyrics {
 async fetch(source:OnlineSource):Promise<Lyrics['tracks']>{
  if(source.platform==='bilibili')throw new Error('B 站视频不提供此歌词接口');
  const url=source.platform==='netease'
   ?`https://music.163.com/api/song/lyric?id=${source.remoteId}&lv=-1&tv=-1&rv=-1`
   :`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${source.remoteId}&format=json&nobase64=1`;
  const response=await net.fetch(url,{signal:AbortSignal.timeout(12000),headers:{Referer:source.platform==='netease'?'https://music.163.com/':'https://y.qq.com/portal/player.html'}}).catch(()=>{throw new Error('平台歌词请求未成功，可能为网络或平台限制。可稍后重试，或在设置中导入本地歌词；已有歌词未修改');});
  if(!response.ok)throw new Error(`平台请求失败（${response.status}），可稍后重试或导入本地歌词`);
  const data=await response.json() as Record<string,any>;
  const original=source.platform==='netease'?data.lrc?.lyric:data.lyric;
  const translation=source.platform==='netease'?data.tlyric?.lyric:data.trans;
  const romaji=source.platform==='netease'?data.romalrc?.lyric:undefined;
  const decode=(text:unknown)=>typeof text==='string'?text.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'):'';
  const tracks={original:parseLyrics(decode(original)),translation:parseLyrics(decode(translation)),romaji:parseLyrics(decode(romaji))};
  if(!tracks.original.length)throw new Error('平台没有返回可用歌词，可能为纯音乐或接口受限；已有歌词未修改');
  return tracks;
 }
}
