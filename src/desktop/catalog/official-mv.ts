// Confirmed in Yorushika official MOVIE / announcement pages; absent entries are unverified.
const known=new Set(['春泥棒','風を食む','盗作','ブレーメン','月に吠える','又三郎','ノーチラス','夜行','春ひさぎ','太陽','心に穴が空いた']);
export function hasVerifiedOfficialVideo(track:string){return known.has(track);}
