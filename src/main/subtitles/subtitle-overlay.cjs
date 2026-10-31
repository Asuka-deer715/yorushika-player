const {app,ipcMain}=require('electron');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {probeSubtitleInfo}=require('../../../dist/main/subtitles/video-subtitles.js');

function registerSubtitleOverlay(root,entryUrl,store){
 const directory=path.join(root,'subtitle-overlays');let active=null;
 const trimCache=async keep=>{
  const entries=(await fs.readdir(directory)).filter(name=>/^[a-f0-9]{64}\.webm$/.test(name));
  const files=await Promise.all(entries.map(async name=>({name,...await fs.stat(path.join(directory,name))})));let total=files.reduce((sum,file)=>sum+file.size,0);
  for(const file of files.sort((a,b)=>a.mtimeMs-b.mtimeMs)){if(total<=2*1024**3)break;if(file.name===keep)continue;await fs.unlink(path.join(directory,file.name));total-=file.size;}
 };
 const authorize=event=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');};
 const cancel=()=>{if(active){active.cancelled=true;active.child?.kill();active=null;}};
 app.on('before-quit',cancel);
 const run=(job,binary,args,cwd,onProgress)=>new Promise((resolve,reject)=>{
  if(job.cancelled){reject(new Error('字幕准备已取消'));return;}
  const child=spawn(binary,args,{cwd,windowsHide:true,stdio:['ignore','ignore','pipe']});job.child=child;let log='',pending='';child.stderr.on('data',data=>{const chunk=data.toString();log=(log+chunk).slice(-5000);if(onProgress){pending+=chunk;const lines=pending.split(/\r?\n/);pending=lines.pop();for(const line of lines){const match=/^out_time_us=(\d+)$/.exec(line);if(match)onProgress(Number(match[1])/1000000);}}});
  child.on('error',reject);child.on('close',code=>{job.child=null;if(job.cancelled)reject(new Error('字幕准备已取消'));else if(code===0)resolve();else reject(new Error('字幕渲染失败：'+log.trim()));});
 });
 ipcMain.handle('subtitle-overlay:cancel',event=>{authorize(event);cancel();});
 ipcMain.handle('subtitle-overlay:prepare',async(event,id,index,jobId)=>{
  authorize(event);if(typeof id!=='string'||!Number.isSafeInteger(index)||index<0||typeof jobId!=='string'||!/^[a-f0-9-]{36}$/.test(jobId))throw new Error('无效的字幕轨道');
  cancel();const job={cancelled:false,child:null};active=job;
  let temp='';
  try{
   const item=store.get(id);if(item.kind!=='mv')throw new Error('请选择本地视频');
   const binary=app.isPackaged?path.join(process.resourcesPath,'ffmpeg','ffmpeg.exe'):(process.env.YORUSHIKA_FFMPEG||'ffmpeg');
   const {tracks,duration}=await probeSubtitleInfo(binary,item.path);const track=tracks.find(row=>row.index===index);
   if(!track||!['bitmap','styled'].includes(track.render))throw new Error('该字幕轨道无法渲染');
   const stat=await fs.stat(item.path);const token=crypto.createHash('sha256').update(JSON.stringify([item.path,stat.size,stat.mtimeMs,index,2])).digest('hex');
   await fs.mkdir(directory,{recursive:true});const output=path.join(directory,token+'.webm');
   try{await fs.access(output);if(job.cancelled)throw new Error('字幕准备已取消');const now=new Date();await fs.utimes(output,now,now);return `local-media://subtitle/${token}`;}catch(error){if(job.cancelled)throw error;}
   temp=await fs.mkdtemp(path.join(directory,'render-'));let filter;
   if(track.render==='styled'){
    await run(job,binary,['-hide_banner','-loglevel','error','-y','-i',item.path,'-map',`0:${index}`,'subtitle.ass'],temp);
    filter='[0:v:0]format=rgba,colorchannelmixer=aa=0,ass=subtitle.ass:alpha=1,format=yuva420p[out]';
   }else filter=`[0:v:0]format=rgba,colorchannelmixer=aa=0[base];[0:${index}][base]scale2ref=w=iw:h=ih[sub][ref];[ref][sub]overlay=eof_action=pass:format=auto,format=yuva420p[out]`;
   await run(job,binary,['-hide_banner','-loglevel','error','-progress','pipe:2','-nostats','-y','-i',item.path,'-filter_complex',filter,'-map','[out]','-an','-c:v','libvpx-vp9','-b:v','0','-crf','35','-deadline','realtime','-cpu-used','6','-auto-alt-ref','0','-pix_fmt','yuva420p','overlay.webm'],temp,seconds=>{if(!job.cancelled&&!event.sender.isDestroyed())event.sender.send('subtitle-overlay:progress',{jobId,seconds,duration});});
   if(job.cancelled)throw new Error('字幕准备已取消');await fs.rename(path.join(temp,'overlay.webm'),output);await trimCache(path.basename(output));return `local-media://subtitle/${token}`;
  } finally {if(temp)await fs.rm(temp,{recursive:true,force:true});if(active===job)active=null;}
 });
 return {filePath(token){if(!/^[a-f0-9]{64}$/.test(token))throw new Error('无效的字幕缓存');return path.join(directory,token+'.webm');},cancel};
}
module.exports={registerSubtitleOverlay};
