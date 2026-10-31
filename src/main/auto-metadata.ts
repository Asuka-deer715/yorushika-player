import {displayMediaName} from '../shared/media-name';
import type {Lyrics,PlatformCandidate} from '../shared/collection';
import type {CollectionStore} from './collection-store';
const key=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
function artistKey(value:string){const k=key(value);return ['yorushika','夜鹿','ヨルシカ'].includes(k)?'ヨルシカ':k;}
export function queryFromName(name:string){let title=displayMediaName(name).replace(/^\d{1,2}[.、_\s-]+/u,'').trim();let artist='';const pair=title.match(/^(.+?)\s+[-–—:：]\s*(.+)$/u);if(pair){artist=pair[1].trim();title=pair[2].trim();}title=title.replace(/\s*[（(]([\p{Script=Han}\s]+)[)）]\s*$/u,'').trim();return {title,artist};}
interface Search {search(provider:'netease',title:string,artist:string):Promise<PlatformCandidate[]>}
interface FetchLyrics {fetch(source:{key:string;platform:'netease';remoteId:string;url:string;title:string;part:number}):Promise<Lyrics['tracks']>}
export class AutoMetadata {
 constructor(private store:CollectionStore,private search:Search,private lyrics:FetchLyrics){}
 async run(id:string){const record=this.store.audioForMetadata(id);if(!record)throw Error('请选择本地音频');const initial=this.store.lyrics(id);if(this.store.cover(id)&&Object.values(initial.tracks).every(lines=>lines.length))return {matched:false,lyrics:false,cover:false};const query=queryFromName(record.name);if(!query.title)return {matched:false,lyrics:false,cover:false};const candidates=await this.search.search('netease',query.title,query.artist);const matches=candidates.filter(c=>key(c.title)===key(query.title)&&(!query.artist||c.artist.split(/\s*\/\s*/).some(a=>artistKey(a)===artistKey(query.artist))));const unique=[...new Map(matches.map(c=>[c.id,c])).values()];if(unique.length!==1)return {matched:false,lyrics:false,cover:false};const candidate=unique[0];let savedCover=false,savedLyrics=false;
 if(candidate.cover&&!this.store.cover(id)){try{const url=new URL(candidate.cover);if(['p1.music.126.net','p2.music.126.net','p3.music.126.net','p4.music.126.net'].includes(url.hostname)&&!url.username&&!url.password&&!url.port){url.protocol='https:';if(this.store.audioForMetadata(id)?.name===record.name&&!this.store.cover(id)){this.store.setCover(id,url.href);savedCover=true;}}}catch{}}
 const missing=Object.values(initial.tracks).some(lines=>!lines.length);if(missing){try{const tracks=await this.lyrics.fetch({key:'',platform:'netease',remoteId:candidate.id,url:'',title:'',part:1});if(this.store.audioForMetadata(id)?.name===record.name){const current=this.store.lyrics(id);for(const language of ['original','translation','romaji'] as const)if(!current.tracks[language].length&&tracks[language].length){this.store.saveLyrics(id,language,tracks[language]);savedLyrics=true;}}}catch{}}
 return {matched:true,lyrics:savedLyrics,cover:savedCover};
 }
}
