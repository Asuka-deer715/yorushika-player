import {applySpectrumSettings,spectrumEnabled,breathEnabled} from './spectrum-settings.js';
import type {Player} from './player.js';

// Capture a separate analysis stream so the existing playback path remains intact.
export function mountPlayerSpectrum(player:Player,bar:HTMLElement){
 applySpectrumSettings();
 const canvas=document.createElement('canvas');canvas.className='player-spectrum';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let audio:AudioContext|undefined,analyser:AnalyserNode|undefined,source:MediaStreamAudioSourceNode|undefined,stream:MediaStream|undefined;
 let active:HTMLMediaElement|undefined,frame=0,last=0,color='',width=0,height=0;
 const bins=new Uint8Array(128);const smooth=new Float32Array(320);
 const clear=()=>{cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,canvas.width,canvas.height);};
 const detach=()=>{source?.disconnect();source=undefined;stream?.getTracks().forEach(track=>track.stop());stream=undefined;active=undefined;};
 const resize=()=>{const box=bar.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);width=box.width+36;height=box.height+36;Object.assign(canvas.style,{left:(box.left-18)+'px',top:(box.top-18)+'px',width:width+'px',height:height+'px'});canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
 new ResizeObserver(resize).observe(bar);window.addEventListener('resize',resize);resize();
 const draw=(now:number)=>{frame=0;if(!analyser||!active||active.paused||motion.matches||document.hidden){clear();return;}frame=requestAnimationFrame(draw);if(now-last<33)return;last=now;
  analyser.getByteFrequencyData(bins);color=getComputedStyle(canvas).color;ctx.clearRect(0,0,width,height);ctx.fillStyle=color;
  const edge=18,step=7,barWidth=5,usable=Math.max(0,(width-edge*2)*.92),count=Math.max(2,Math.min(smooth.length,Math.floor(usable/step))),start=(width-(count-1)*step-barWidth)/2;let energy=0;
  for(let i=0;i<count;i++){const frequency=Math.floor(Math.pow(i/(count-1),1.8)*90);const value=bins[frequency]/255;smooth[i]+= (value-smooth[i])*(value>smooth[i]?.3:.12);const amplitude=3+smooth[i]*15;const x=start+i*step;ctx.beginPath();ctx.roundRect(x,edge-amplitude,barWidth,amplitude,2);ctx.fill();}

 };
 const sync=()=>{const media=player.current?player.media:null;bar.classList.toggle('breath-active',!!media&&!media.paused&&!document.hidden&&!motion.matches&&breathEnabled());if(!media||media.paused||motion.matches||!spectrumEnabled()){detach();clear();return;}if(active===media&&source){if(audio?.state==='suspended')void audio.resume().catch(()=>{});if(!frame)frame=requestAnimationFrame(draw);return;}
  detach();clear();try{const capturable=media as HTMLMediaElement&{captureStream?:()=>MediaStream};if(!capturable.captureStream)return;stream=capturable.captureStream();if(!stream.getAudioTracks().length){stream.getTracks().forEach(track=>track.stop());stream=undefined;return;}audio??=new AudioContext();analyser??=audio.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.72;source=audio.createMediaStreamSource(stream);source.connect(analyser);active=media;void audio.resume().catch(()=>{});frame=requestAnimationFrame(draw);}catch(error){detach();clear();console.warn('频谱不可用，播放不受影响',error);}
 };
 window.addEventListener('player-spectrum-settings',sync);player.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
}
