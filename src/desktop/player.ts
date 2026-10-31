import type { MediaRecord } from '../shared/library.js';
export type PlaybackMode='sequence'|'list'|'single'|'shuffle';
export const playbackModes:ReadonlyArray<readonly [PlaybackMode,string]>=[['sequence','顺序播放'],['list','列表循环'],['single','单曲循环'],['shuffle','随机播放']];
export class Player extends EventTarget {
  readonly audio = new Audio();
  readonly video = document.createElement('video');
  queue: MediaRecord[] = [];
  current: MediaRecord | null = null;
  private generation = 0;
  restoring = false;
  mode:PlaybackMode='list';
  constructor(){super();const saved=localStorage.getItem('desktop-play-mode');this.mode=playbackModes.some(([id])=>id===saved)?saved as PlaybackMode:localStorage.getItem('desktop-repeat')==='true'?'single':'list';for(const media of [this.audio,this.video]){media.volume=.75;media.loop=this.mode==='single';for(const name of ['timeupdate','loadedmetadata','play','pause'])media.addEventListener(name,()=>this.dispatchEvent(new Event('change')));media.addEventListener('ended',()=>{if(media===this.media)this.next(1,true)});media.addEventListener('error',()=>this.dispatchEvent(new CustomEvent('failure',{detail:'文件无法播放，请检查路径或媒体格式。'})));}}
  get media(){return this.current?.kind==='mv'?this.video:this.audio}
  async play(item:MediaRecord,queue:MediaRecord[],position=0){this.restoring=false;const generation=++this.generation;this.audio.pause();this.video.pause();this.current=item;this.queue=queue;this.media.src=item.url;if(position>0){const target=this.media;target.addEventListener('loadedmetadata',()=>{if(generation===this.generation&&Number.isFinite(target.duration))target.currentTime=Math.min(position,target.duration);},{once:true});}this.dispatchEvent(new Event('change'));try{await this.media.play()}catch(error){if(generation===this.generation)this.dispatchEvent(new CustomEvent('failure',{detail:(error as Error).message}));}}
  restore(item:MediaRecord,queue:MediaRecord[],position:number){this.restoring=true;this.current=item;this.queue=queue;this.media.src=item.url;this.media.addEventListener('loadedmetadata',()=>{if(Number.isFinite(this.media.duration))this.media.currentTime=Math.min(position,this.media.duration);this.restoring=false;this.dispatchEvent(new Event('change'));},{once:true});this.dispatchEvent(new Event('change'));}
  toggle(){if(!this.current)return;if(this.media.paused)this.media.play().catch(error=>this.dispatchEvent(new CustomEvent('failure',{detail:error.message})));else this.media.pause()}
  setMode(mode:PlaybackMode){this.mode=mode;this.audio.loop=this.video.loop=mode==='single';localStorage.setItem('desktop-play-mode',mode);this.dispatchEvent(new Event('modechange'));}
  next(direction:number,automatic=false){if(!this.current||!this.queue.length)return;const index=this.queue.findIndex(item=>item.id===this.current!.id);let target=index+direction;if(this.mode==='shuffle'&&this.queue.length>1){const offset=1+Math.floor(Math.random()*(this.queue.length-1));target=(index+offset)%this.queue.length;}else if(this.mode==='sequence'&&(target<0||target>=this.queue.length)){if(automatic)this.dispatchEvent(new Event('change'));return;}else target=(target+this.queue.length)%this.queue.length;void this.play(this.queue[target],this.queue)}
  volume(value:number){this.audio.volume=this.video.volume=value}
  seek(fraction:number){if(Number.isFinite(this.media.duration))this.media.currentTime=this.media.duration*fraction}
}
