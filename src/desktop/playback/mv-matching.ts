import {displayMediaName} from '../../shared/media-name.js';
import {releases,normalize} from '../catalog/catalog-data.js';
const known=[...new Set(releases.flatMap(r=>r.tracks).map(normalize).filter(name=>name.length>=2))];
function nameKey(value:string){return normalize(displayMediaName(value).replace(/\[[^\]]*\]$/,'').replace(/\([^)]*\)|（[^）]*）/g,'').replace(/^(?:ヨルシカ|yorushika|夜鹿)\s*[-–—:：]\s*/i,''));}
export function matchingVideos(audioName:string,videos:{name:string;id:string}[]){
 const key=nameKey(audioName);const titles=known.filter(name=>key===name||key.endsWith(name));const audioTitle=titles.length===1?titles[0]:key;
 if(audioTitle.length<2)return [];
 return videos.filter(video=>{const videoKey=nameKey(video.name);const videoTitles=known.filter(name=>videoKey===name||videoKey.endsWith(name));return videoTitles.length===1?videoTitles[0]===audioTitle:videoKey===audioTitle;});
}
