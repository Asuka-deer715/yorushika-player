import {t} from '../localization/i18n.js';
import type {LibraryApi} from '../../shared/library.js';
import type {Player} from '../playback/player.js';
import {SubtitleOverlayPlayer} from './subtitle-overlay-player.js';
import {enhanceSelect} from '../components/soft-select.js';

export class VideoSubtitles {
 private id='';private generation=0;private url='';private track:HTMLTrackElement|null=null;
 private streams:Awaited<ReturnType<LibraryApi['subtitleTracks']>>=[];
 private host:HTMLElement|null=null;private selected='';
 private overlay:SubtitleOverlayPlayer;private selection=0;private preparing=false;private jobId='';private progress:number|null=null;
 constructor(private player:Player,private library:LibraryApi,private report:(message:string)=>void){
  this.overlay=new SubtitleOverlayPlayer(player.video);
  library.onSubtitleProgress(event=>{if(!this.preparing||event.jobId!==this.jobId)return;this.progress=event.duration&&event.duration>0?Math.min(99.9,Math.max(0,Math.floor(event.seconds/event.duration*1000)/10)):null;this.updateProgress();});
  player.addEventListener('change',()=>{const id=player.current?.kind==='mv'?player.current.id:'';if(id!==this.id)void this.load(id);});
 }
 mount(host:HTMLElement){this.host=host;this.overlay.attach();this.render();}
 private clear(){this.track?.remove();this.track=null;if(this.url)URL.revokeObjectURL(this.url);this.url='';this.overlay.clear();}
 private async load(id:string){
  this.id=id;const generation=++this.generation;++this.selection;void this.library.cancelSubtitleOverlay();this.preparing=false;this.jobId='';this.progress=null;this.clear();this.streams=[];this.selected='';this.render();if(!id)return;
  try{const streams=await this.library.subtitleTracks(id);if(generation!==this.generation)return;this.streams=streams;this.render();const first=streams.find(s=>s.supported&&s.default)??streams.find(s=>s.supported);if(first)await this.select(String(first.index),generation);}
  catch{if(generation===this.generation)this.report(t('无法读取视频内嵌字幕。'));}
 }
 private async select(value:string,generation=this.generation){
  const selection=++this.selection;void this.library.cancelSubtitleOverlay();this.selected=value;this.preparing=false;this.jobId='';this.progress=null;this.clear();this.render();if(!value)return;
  try{const stream=this.streams.find(item=>String(item.index)===value)!;
   if(stream.render==='styled'||stream.render==='bitmap'){this.preparing=true;this.jobId=crypto.randomUUID();this.render();const url=await this.library.subtitleOverlay(this.id,Number(value),this.jobId);if(generation!==this.generation||selection!==this.selection)return;this.preparing=false;this.jobId='';this.overlay.show(url);this.render();return;}
   const text=await this.library.subtitleText(this.id,Number(value));if(generation!==this.generation||selection!==this.selection)return;this.url=URL.createObjectURL(new Blob([text],{type:'text/vtt'}));const track=document.createElement('track');track.kind='subtitles';track.label=stream.label;track.src=this.url;track.default=true;track.onload=()=>{track.track.mode='showing';};this.player.video.append(track);track.track.mode='showing';this.track=track;}
  catch{if(generation===this.generation&&selection===this.selection){this.preparing=false;this.render();this.report(t('字幕加载失败，请尝试其他轨道。'));}}
 }
 private render(){
  if(!this.host?.isConnected)return;this.host.replaceChildren();if(!this.streams.length)return;
  const control=document.createElement('div');control.className='video-subtitles-control';const row=document.createElement('div');row.className='video-subtitles-row';const title=document.createElement('span');title.className='video-subtitles-title';title.textContent=t('视频字幕');const select=document.createElement('select');select.setAttribute('aria-label',t('视频字幕'));const off=document.createElement('option');off.value='';off.textContent=t('关闭字幕');select.append(off);
  for(const stream of this.streams){const option=document.createElement('option');option.value=String(stream.index);option.textContent=stream.label+(stream.supported?'':' · '+t('不支持的字幕格式'));option.disabled=!stream.supported;select.append(option);}select.value=this.selected;select.onchange=()=>void this.select(select.value);row.append(title,select);control.append(row);
  if(this.preparing){const status=document.createElement('div');status.className='subtitle-preparation';const text=document.createElement('div');text.className='subtitle-preparation-text';const label=document.createElement('span');label.textContent=t('正在准备字幕，可继续观看');const percent=document.createElement('span');percent.className='subtitle-preparation-percent';text.append(label,percent);const bar=document.createElement('progress');bar.max=100;bar.setAttribute('aria-label',t('字幕准备进度'));status.append(text,bar);control.append(status);}
  this.host.append(control);enhanceSelect(select);this.updateProgress();
 }
 private updateProgress(){const bar=this.host?.querySelector<HTMLProgressElement>('.subtitle-preparation progress');const percent=this.host?.querySelector<HTMLElement>('.subtitle-preparation-percent');if(!bar||!percent)return;if(this.progress===null){bar.removeAttribute('value');percent.textContent='';}else{bar.value=this.progress;percent.textContent=`${this.progress}%`;}}
}
