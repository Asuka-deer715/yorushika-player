import type { MediaRecord } from '../shared/library.js';
export class Player extends EventTarget {
  readonly audio = new Audio();
  readonly video = document.createElement('video');
  queue: MediaRecord[] = [];
  current: MediaRecord | null = null;
  private generation = 0;
  constructor(){super();for(const media of [this.audio,this.video]){media.volume=.75;for(const name of ['timeupdate','loadedmetadata','play','pause'])media.addEventListener(name,()=>this.dispatchEvent(new Event('change')));media.addEventListener('ended',()=>{if(media===this.media)this.next(1)});media.addEventListener('error',()=>this.dispatchEvent(new CustomEvent('failure',{detail:'文件无法播放，请检查路径或媒体格式。'})));}}
  get media(){return this.current?.kind==='mv'?this.video:this.audio}
  async play(item:MediaRecord,queue:MediaRecord[]){const generation=++this.generation;this.audio.pause();this.video.pause();this.current=item;this.queue=queue;this.media.src=item.url;this.dispatchEvent(new Event('change'));try{await this.media.play()}catch(error){if(generation===this.generation)this.dispatchEvent(new CustomEvent('failure',{detail:(error as Error).message}));}}
  toggle(){if(!this.current)return;if(this.media.paused)this.media.play().catch(error=>this.dispatchEvent(new CustomEvent('failure',{detail:error.message})));else this.media.pause()}
  next(direction:number){if(!this.current||!this.queue.length)return;const index=this.queue.findIndex(item=>item.id===this.current!.id);void this.play(this.queue[(index+direction+this.queue.length)%this.queue.length],this.queue)}
  volume(value:number){this.audio.volume=this.video.volume=value}
  seek(fraction:number){if(Number.isFinite(this.media.duration))this.media.currentTime=this.media.duration*fraction}
}
