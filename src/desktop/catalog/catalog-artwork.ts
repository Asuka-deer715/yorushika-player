import type { CollectionApi } from '../../shared/collection.js';
import {normalize,type Release} from './catalog-data.js';
import {sameSongTitle} from '../../shared/song-aliases.js';
const cache=new Map<string,Promise<string>>();
let running=0;const waiting:Array<()=>void>=[];
export function releaseCover(api:CollectionApi,release:Release):Promise<string>{
 const existing=cache.get(release.id);if(existing)return existing;
 const task=(async()=>{if(running>=3)await new Promise<void>(resolve=>waiting.push(resolve));running++;try{const saved=await window.catalogCoverCache.get(release.id);if(saved)return saved;const candidates=await api.searchPlatformLyrics('netease',release.tracks[0]??release.name,release.category==='band'?'ヨルシカ':release.artist??'');const exact=candidates.find(item=>normalize(item.album)===normalize(release.album??release.name)&&item.cover);const eligible=release.artist?candidates.filter(item=>item.cover&&sameSongTitle(item.title,release.tracks[0])&&item.artist.split(/\s*\/\s*/).some(artist=>normalize(artist)===normalize(release.artist!))):[];const albums=new Set(eligible.map(item=>normalize(item.album)));const match=exact??(albums.size===1?eligible[0]:undefined);if(!match)return '';const url=new URL(match.cover);if(!['p1.music.126.net','p2.music.126.net','p3.music.126.net','p4.music.126.net'].includes(url.hostname))return '';url.protocol='https:';return await window.catalogCoverCache.save(release.id,url.href);}catch(error){console.error('专辑封面获取失败：',release.name,error);return '';}finally{running--;waiting.shift()?.();}})();cache.set(release.id,task);void task.then(url=>{if(!url&&cache.get(release.id)===task)cache.delete(release.id);});return task;
}
