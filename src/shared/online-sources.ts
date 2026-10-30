import type { Lyrics } from './collection';
export type SourcePlatform = 'netease' | 'qq' | 'bilibili';
export interface OnlineSource { key:string; platform:SourcePlatform; remoteId:string; url:string; title:string; part:number }
export interface OnlineSourcesApi {
 list():Promise<OnlineSource[]>;
 add(input:string,title:string):Promise<OnlineSource[]>;
 remove(key:string):Promise<OnlineSource[]>;
 open(key:string):Promise<void>;
 lyrics(key:string,mediaId:string):Promise<Lyrics>;
}
export function parseSource(input:string):OnlineSource {
 const value=input.trim();
 let platform:SourcePlatform, remoteId:string, url:string, part=1;
 if(/^BV[0-9A-Za-z]{10}$/.test(value)){platform='bilibili';remoteId=value;url=`https://www.bilibili.com/video/${remoteId}`;}
 else {
  let parsed:URL;try{parsed=new URL(value)}catch{throw new Error('请粘贴完整歌曲链接、B 站视频链接或 BV 号');}
  if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.port)throw new Error('不支持此链接');
  const host=parsed.hostname;
  if(['music.163.com','www.music.163.com'].includes(host)){
   const route=parsed.hash.startsWith('#/')?new URL(parsed.hash.slice(1),parsed.origin):parsed;
   const id=route.searchParams.get('id');
   if(!['/song','/song/'].includes(route.pathname)||!id||!/^\d{1,20}$/.test(id))throw new Error('请使用网易云单曲链接（暂不支持歌单）');
   platform='netease';remoteId=id;url=`https://music.163.com/#/song?id=${id}`;
  }else if(['y.qq.com','www.y.qq.com'].includes(host)){
   const id=parsed.pathname.match(/\/songDetail\/([a-zA-Z0-9]+)(?:\.html)?$/)?.[1]??parsed.searchParams.get('songmid');
   if(!id||! /^[a-zA-Z0-9]{10,20}$/.test(id))throw new Error('请使用 QQ 音乐包含 songmid 的完整单曲链接');
   platform='qq';remoteId=id;url=`https://y.qq.com/n/ryqq/songDetail/${id}`;
  }else if(['www.bilibili.com','bilibili.com','m.bilibili.com'].includes(host)){
   const id=parsed.pathname.match(/^\/video\/(BV[0-9A-Za-z]{10})\/?$/)?.[1];
   if(!id)throw new Error('请使用包含 BV 号的完整视频链接');
   part=Number(parsed.searchParams.get('p')??1);if(!Number.isSafeInteger(part)||part<1||part>10000)throw new Error('无效的视频分 P');
   platform='bilibili';remoteId=id;url=`https://www.bilibili.com/video/${id}?p=${part}`;
  }else throw new Error('支持网易云、QQ 音乐单曲和 B 站视频完整链接；短链接请先在浏览器展开');
 }
 return {key:`${platform}:${remoteId}:${part}`,platform,remoteId,url,title:remoteId,part};
}
