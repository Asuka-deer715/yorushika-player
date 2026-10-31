export function displayMediaName(name:string):string {
 return name.replace(/\s*[\[（(【]\s*(?:\d{5,}|BV[0-9A-Za-z]{10})\s*[\]）)】]\s*$/iu,'').replace(/[_\s-]+(?:EG|MV|Official\s*MV|Official\s*Video)\s*$/iu,'').trim()||name;
}
