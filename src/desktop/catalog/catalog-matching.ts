import {displayMediaName} from '../../shared/media-name.js';
import {normalize,type Category,type Release} from './catalog-data.js';
import type {MediaRecord} from '../../shared/library.js';
const artists:Record<string,Category[]>={'ヨルシカ':['band'],'yorushika':['band'],'夜鹿':['band'],'n-buna':['nbuna','collab-n'],'nabuna':['nbuna','collab-n'],'suis':['suis','collab-s']};
function identify(name:string){
 let title=displayMediaName(name).trim();let categories:Category[]|null=null;
 const prefix=title.match(/^(.+?)\s+[-–—:：]\s*(.+)$/u);
 if(prefix){const artist=prefix[1].trim().toLowerCase();categories=artists[artist]??[];title=prefix[2];}
 title=title.replace(/^\d{1,2}[.、_\s-]+/u,'').trim();
 // Chinese translations in trailing brackets are metadata; preserve version labels.
 title=title.replace(/\s*[（(]([\p{Script=Han}\s]+)[)）]\s*$/u,'').trim();
 return {key:normalize(title),categories};
}
export function catalogMatches(record:MediaRecord,release:Release,track:string){
 if(record.kind!=='audio')return false;
 const candidate=identify(record.name);
 return !!candidate.key&&candidate.key===normalize(track)&&(!candidate.categories||candidate.categories.includes(release.category));
}
export function unmatchedCatalogAudio(records:MediaRecord[],catalog:Release[]){
 return records.filter(record=>record.kind==='audio'&&!catalog.some(release=>release.tracks.some(track=>catalogMatches(record,release,track))));
}
