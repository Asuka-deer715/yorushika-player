import { readdir,readFile,open,mkdtemp,rm } from 'node:fs/promises';
import { createReadStream,createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { spawn } from 'node:child_process';
import { join,basename } from 'node:path';
interface CacheEntry {folder:string;name:string;video:string;audio:string}
async function discover(folder:string):Promise<CacheEntry|undefined>{
 const files=await readdir(folder);const media=files.filter(f=>f.toLowerCase().endsWith('.m4s'));const audio=media.find(f=>/-302\d+\.m4s$/i.test(f));const video=media.find(f=>/-30[01]\d+\.m4s$/i.test(f));if(!audio||!video)return;
 let name=basename(folder);try{const data=JSON.parse(await readFile(join(folder,'videoInfo.json'),'utf8'));if(typeof data.title==='string'&&data.title.trim())name=data.title;}catch{}
 return {folder,name,video:join(folder,video),audio:join(folder,audio)};
}
async function strip(source:string,target:string){const file=await open(source,'r');const header=Buffer.alloc(9);try{await file.read(header,0,9,0);}finally{await file.close();}const offset=header.toString()==='000000000'?9:0;await pipeline(createReadStream(source,{start:offset}),createWriteStream(target,{flags:'wx'}));}
function run(binary:string,args:string[]){return new Promise<void>((resolve,reject)=>{const child=spawn(binary,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',chunk=>{error=(error+chunk.toString()).slice(-4000)});child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error(`FFmpeg 合并失败：${error.trim()}`)));});}
export async function importBiliCache(root:string,destination:string,ffmpeg:string){
 const entries=await readdir(root,{withFileTypes:true});const candidates=[root,...entries.filter(e=>e.isDirectory()).map(e=>join(root,e.name))];const groups=(await Promise.all(candidates.map(discover))).filter((v):v is CacheEntry=>!!v);const done:string[]=[];const failures:{name:string;message:string}[]=[];
 for(const group of groups){let temp='';try{temp=await mkdtemp(join(destination,'.yorushika-convert-'));const video=join(temp,'video.m4s'),audio=join(temp,'audio.m4s');await strip(group.video,video);await strip(group.audio,audio);const safe=group.name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/,'').slice(0,100)||basename(group.folder);const output=join(destination,`${safe} [${basename(group.folder)}].mp4`);await run(ffmpeg,['-hide_banner','-loglevel','error','-n','-i',video,'-i',audio,'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart',output]);done.push(output);}catch(error){failures.push({name:group.name,message:(error as Error).message});}finally{if(temp)await rm(temp,{recursive:true,force:true});}}
 return {done,failures,found:groups.length};
}
