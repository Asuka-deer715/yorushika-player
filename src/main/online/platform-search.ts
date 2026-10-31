import { net } from 'electron';
export type Provider='netease'|'qq';
export interface PlatformCandidate { id:string; title:string; artist:string; album:string; cover:string; aliases?:string[] }
export class PlatformSearch {
 async search(provider:Provider,title:string,artist:string):Promise<PlatformCandidate[]>{
  const keyword=[title,artist].filter(Boolean).join(' ');
  if(provider==='netease'){
   const params=new URLSearchParams({s:keyword,type:'1',limit:'20',offset:'0'});
   const response=await net.fetch('https://music.163.com/api/cloudsearch/pc?'+params,{headers:{Referer:'https://music.163.com/'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw new Error(`网易云搜索服务返回 ${response.status}`);
   const data=await response.json() as any;if(data.code!==200||!Array.isArray(data.result?.songs))return [];
   return data.result.songs.map((song:any)=>({id:String(song.id),title:song.name,artist:(song.ar??song.artists??[]).map((a:any)=>a.name).join(' / '),album:song.al?.name??song.album?.name??'',cover:song.al?.picUrl??song.album?.picUrl??'',aliases:[...(song.alia??[]),...(song.alias??[]),...(song.tns??[])].filter((value:unknown)=>typeof value==='string')}));
  }
  const request={req:{module:'music.search.SearchCgiService',method:'DoSearchForQQMusicDesktop',param:{query:keyword,num_per_page:20,page_num:1,search_type:0}}};
  const url='https://u.y.qq.com/cgi-bin/musicu.fcg?data='+encodeURIComponent(JSON.stringify(request));
  const response=await net.fetch(url,{headers:{Referer:'https://y.qq.com/'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`QQ 音乐搜索服务返回 ${response.status}`);
  const data=await response.json() as any;const songs=data.req?.data?.body?.song?.list;
  if(!Array.isArray(songs))throw new Error('QQ 音乐搜索返回异常');
  return songs.map((song:any)=>({id:song.mid,title:song.name,artist:(song.singer??[]).map((a:any)=>a.name).join(' / '),album:song.al?.name??song.album?.name??'',cover:song.al?.picUrl??song.album?.picUrl??''}));
 }
}
