export function displayMediaName(name:string):string {
 return name.replace(/\s*[\[（(【]\s*(?:\d{5,}|BV[0-9A-Za-z]{10})\s*[\]）)】]\s*$/iu,'').replace(/[_\s-]+(?:EG|MV|Official\s*MV|Official\s*Video)\s*$/iu,'').trim()||name;
}
export function applyAudioPrefix(name:string,prefix:string):string {
 const clean=removeTrackNumber(name);const artist=prefix.trim().replace(/\s*[-–—]\s*$/u,'').trim();
 const explicit=/^.{1,80}\s+[-–—]\s*\S/u.test(clean)||/^.{1,80}[-–—]\s+\S/u.test(clean);
 const current=artist&&clean.toLocaleLowerCase().startsWith(artist.toLocaleLowerCase())&&/^\s*[-–—]\s*\S/u.test(clean.slice(artist.length));
 return artist&&!explicit&&!current?`${artist} - ${clean}`:clean;
}
export function removeTrackNumber(name:string):string {
 const clean=name.trim();
 const strip=(title:string)=>title.replace(/^\d{1,2}(?:\s*[.、_-]\s*|\s+)(?=[^\d\s])/u,'');
 const pair=clean.match(/^(.{1,80}?\s*[-–—]\s*)(.+)$/u);
 if(pair&&!/^\d+\s*[-–—]/u.test(clean))return pair[1]+strip(pair[2]);
 return strip(clean);
}
