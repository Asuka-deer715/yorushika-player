import {songTranslations} from './song-translations.js';
/** Known title aliases; ambiguous matches are not selected automatically. */
const groups=[
 ['逃亡','逃亡者','Escape'],['春泥棒','春泥棒','春泥棒小偷','Spring Thief'],
 ['強盗と花束','强盗与花束','强盗和花束','The Robber and the Bouquet'],
 ['爆弾魔','爆弹魔','Bomber'],['花に亡霊','花之亡灵','花中的亡灵','Ghost in a Flower'],
 ['だから僕は音楽を辞めた','所以我放弃了音乐','所以我放弃音乐','That Is Why I Gave Up on Music'],
 ['雨とカプチーノ','雨与卡布奇诺','Rain and Cappuccino'],['ただ君に晴れ','只为你放晴'],
 ['夜行','夜行','Night Journey'],['盗作','盗作','Plagiarism'],['思想犯','思想犯','Thoughtcrime']
];
export const songKey=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
export function titleAliases(title:string){
 const key=songKey(title);const matches=[...groups,...Object.entries(songTranslations).map(([name,aliases])=>[name,...aliases])].filter(items=>items.some(item=>songKey(item)===key));
 const canonical=new Set(matches.map(items=>songKey(items[0])));if(canonical.size!==1)return [title];
 return matches.length?[...new Set(matches.flat())]:[title];
}
export function sameSongTitle(a:string,b:string){const target=songKey(b);return titleAliases(a).some(alias=>songKey(alias)===target);}
export function localizedSongName(name:string,language:'ja'|'en'|'zh'){
 const match=name.match(/^(?:(.{1,80}?\s+[-–—:]\s+))?(.+)$/u);if(!match)return name;
 const original=match[2];const candidates=titleAliases(original);if(candidates.length<2)return name;
 const japanese=candidates[0];const translated=language==='ja'?japanese:language==='en'?songTranslations[japanese]?.[0]??candidates.find(value=>/^[a-z\d\s,'!?&.:-]+$/i.test(value)):candidates.find(value=>value!==japanese&&/^[\p{Script=Han}\s]+$/u.test(value));
 return translated?(match[1]??'')+translated:name;
}
