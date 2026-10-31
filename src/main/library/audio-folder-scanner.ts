import {readdir} from 'node:fs/promises';
import {basename,extname,join} from 'node:path';

/** Collect audio files without following directory links, which can form cycles. */
export async function scanAudioFolder(root:string,extensions:readonly string[]){
 const pending=[root],files:string[]=[],failures:{name:string;message:string}[]=[];
 const supported=new Set(extensions.map(extension=>'.'+extension.toLowerCase()));
 while(pending.length){
  const directory=pending.pop()!;
  try{
   for(const entry of await readdir(directory,{withFileTypes:true})){
    const target=join(directory,entry.name);
    if(entry.isDirectory())pending.push(target);
    else if(entry.isFile()&&supported.has(extname(entry.name).toLowerCase()))files.push(target);
   }
  }catch(error){failures.push({name:basename(directory),message:(error as Error).message});}
 }
 files.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));
 return {files,failures};
}
