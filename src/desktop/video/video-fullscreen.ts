import {translateMarkup} from '../localization/i18n.js';
import {t} from '../localization/i18n.js';
export function installVideoFullscreen(section:HTMLElement,video:HTMLVideoElement,notify:(message:string)=>void){
 const enter=document.createElement('button');enter.type='button';enter.className='quiet mv-fullscreen-enter';enter.textContent=t('全屏观看');
 const exit=document.createElement('button');exit.type='button';exit.className='mv-fullscreen-exit';exit.textContent=t('退出全屏');
 const playback=document.createElement('button');playback.type='button';playback.className='mv-fullscreen-play';
 const timeline=document.createElement('label');timeline.className='mv-fullscreen-timeline';timeline.innerHTML=translateMarkup('<span>0:00</span><input type="range" min="0" max="1000" value="0" aria-label="视频播放进度"><span>0:00</span>');
 const slider=timeline.querySelector('input')!;const labels=timeline.querySelectorAll('span');
 const format=(value:number)=>Number.isFinite(value)?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'0:00';
 let dragging=false;slider.addEventListener('pointerdown',()=>{dragging=true;});slider.addEventListener('pointerup',()=>{dragging=false;});slider.addEventListener('pointercancel',()=>{dragging=false;});slider.oninput=()=>{if(Number.isFinite(video.duration)&&video.duration>0)video.currentTime=Number(slider.value)/1000*video.duration;};
 const sync=()=>{playback.textContent=video.paused?t('播放'):t('暂停');labels[0].textContent=format(video.currentTime);labels[1].textContent=format(video.duration);if(!dragging)slider.value=String(Number.isFinite(video.duration)&&video.duration>0?video.currentTime/video.duration*1000:0);};
 let frame=0;const tick=()=>{if(document.fullscreenElement!==section)return;sync();frame=requestAnimationFrame(tick);};
 enter.onclick=()=>{void section.requestFullscreen().catch(()=>notify(t('无法进入全屏，请重试。')));};
 exit.onclick=()=>{void document.exitFullscreen();};
 playback.onclick=()=>{if(video.paused)void video.play();else video.pause();sync();};
 section.addEventListener('fullscreenchange',()=>{cancelAnimationFrame(frame);if(document.fullscreenElement===section)tick();});
 section.append(exit,playback,timeline);return enter;
}
