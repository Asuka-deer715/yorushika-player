/** Keep the rendered transparent subtitle layer aligned with the original video. */
export class SubtitleOverlayPlayer {
 private overlay:HTMLVideoElement|null=null;
 constructor(private video:HTMLVideoElement){}
 attach(){if(this.overlay&&this.video.parentElement)this.video.insertAdjacentElement('afterend',this.overlay);}
 show(url:string){
  this.clear();const layer=document.createElement('video');layer.className='subtitle-overlay-video';layer.muted=true;layer.playsInline=true;layer.preload='auto';layer.setAttribute('aria-hidden','true');layer.src=url;this.overlay=layer;this.attach();
  for(const event of ['play','pause','seeking','seeked','timeupdate','ratechange','loadedmetadata'])this.video.addEventListener(event,this.sync);
  layer.addEventListener('loadedmetadata',this.sync);this.sync();
 }
 private sync=()=>{
  const layer=this.overlay;if(!layer)return;layer.playbackRate=this.video.playbackRate;
  if(layer.readyState>=1&&Number.isFinite(this.video.currentTime)&&Math.abs(layer.currentTime-this.video.currentTime)>.18)layer.currentTime=this.video.currentTime;
  if(this.video.paused){if(!layer.paused)layer.pause();}else if(layer.paused)void layer.play().catch(()=>{});
 };
 clear(){for(const event of ['play','pause','seeking','seeked','timeupdate','ratechange','loadedmetadata'])this.video.removeEventListener(event,this.sync);if(this.overlay){this.overlay.pause();this.overlay.removeAttribute('src');this.overlay.load();this.overlay.remove();this.overlay=null;}}
}
