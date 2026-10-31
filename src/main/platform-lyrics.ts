import { net } from 'electron';
import { parseLyrics, type Lyrics } from '../shared/collection';
import type { OnlineSource } from '../shared/online-sources';
export class PlatformLyrics {
 async fetch(source:OnlineSource):Promise<Lyrics['tracks']>{
  if(source.platform==='bilibili')throw new Error('B 站视频不提供此歌词接口');
  const qq=source.platform==='qq';
  const url=qq?'https://u.y.qq.com/cgi-bin/musicu.fcg':`https://music.163.com/api/song/lyric?id=${source.remoteId}&lv=-1&tv=-1&rv=-1`;
  const response=await net.fetch(url,qq?{method:'POST',signal:AbortSignal.timeout(12000),headers:{'Content-Type':'application/json',Referer:'https://y.qq.com/portal/player.html',Origin:'https://y.qq.com'},body:JSON.stringify({req_0:{module:'music.musichallSong.PlayLyricInfo',method:'GetPlayLyricInfo',param:{songMID:source.remoteId,songID:0,trans_t:0,roma_t:0,qrc_t:0,crypt:2,lrc_t:0,interval:0}},comm:{ct:24,cv:0,format:'json',uin:0}})}:{signal:AbortSignal.timeout(12000),headers:{Referer:'https://music.163.com/'}}).catch(()=>{throw new Error('平台歌词请求未成功，可能为网络或平台限制；已有歌词未修改');});
  if(!response.ok)throw new Error(`平台请求失败（${response.status}），已有歌词未修改`);
  const payload=await response.json() as Record<string,any>;const data=qq?payload.req_0?.data:payload;
  const original=qq?data?.lyric:data?.lrc?.lyric;
  const translation=qq?data?.trans:data?.tlyric?.lyric;
  const romaji=qq?data?.roma:data?.romalrc?.lyric;
  const decode=(text:unknown)=>typeof text==='string'?text.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'):'';
  const tracks={original:parseLyrics(decode(original)),translation:parseLyrics(decode(translation)),romaji:parseLyrics(decode(romaji))};
  if(!tracks.original.length)throw new Error('平台没有返回可用歌词，可能为纯音乐或接口受限；已有歌词未修改');
  return tracks;
 }
}
