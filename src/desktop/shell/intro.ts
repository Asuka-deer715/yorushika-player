import {createIntroWordmark} from './intro-wordmark.js';
import {playClockOutro} from './clock-outro.js';
import {t} from '../localization/i18n.js';
let introActive=false;
export async function playIntro(force=false){
 if(introActive||document.querySelector('.intro')||(!force&&localStorage.getItem('desktop-intro')==='false'))return false;
 introActive=true;
 const selected=localStorage.getItem('desktop-intro-seconds');
 const duration=(selected==='1'?1:selected==='2'?2:1.5)*1000;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const overlay=document.createElement('div');overlay.className='intro';overlay.style.setProperty('--intro-duration',duration+'ms');overlay.classList.toggle('intro-reduced',reduced);overlay.setAttribute('aria-label',t('夜鹿启动动画'));
 const headerCover=document.createElement('div');headerCover.className='intro-header-cover';headerCover.setAttribute('aria-hidden','true');
 const skip=document.createElement('button');skip.className='intro-skip';skip.textContent=t('跳过');overlay.append(skip);document.body.append(overlay);
 const prior=document.activeElement as HTMLElement|null;
 const surfaces=Array.from(document.body.children).filter(el=>el!==overlay&&el instanceof HTMLElement) as HTMLElement[];
 const previous=surfaces.map(el=>el.inert);surfaces.forEach(el=>el.inert=true);
 let restored=false;const restoreInteraction=()=>{if(restored)return;restored=true;surfaces.forEach((el,i)=>el.inert=previous[i]);};
 document.body.append(headerCover);
 let closed=false;let closing:Promise<void>|undefined;const close=()=>closing??=(async()=>{closed=true;overlay.dispatchEvent(new Event('intro-close'));document.removeEventListener('keydown',escape);overlay.remove();restoreInteraction();prior?.focus();try{await window.appearance.setIntro(false);}finally{headerCover.remove();introActive=false;}})();
 const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')void close();};document.addEventListener('keydown',escape);skip.onclick=()=>void close();skip.focus();
 try{
  await window.appearance.setIntro(true);if(closed)return true;
  const response=await fetch('../renderer/yorushika-official-mark.svg');if(!response.ok)throw new Error('启动标志加载失败');
  const svg=new DOMParser().parseFromString(await response.text(),'image/svg+xml').documentElement;
  if(closed)return true;const namespace='http://www.w3.org/2000/svg';const hand=svg.querySelector('[id="パス_18"]')!;
  const defs=document.createElementNS(namespace,'defs');svg.prepend(defs);
  const ring=document.createElementNS(namespace,'g');ring.classList.add('intro-ring');ring.append(svg.querySelector('[id="パス_15"]')!);svg.append(ring);
  const eyes=document.createElementNS(namespace,'g');eyes.classList.add('intro-eyes');eyes.append(svg.querySelector('[id="パス_16"]')!,svg.querySelector('[id="パス_17"]')!);svg.append(eyes);
  // The hands meet at the narrow waist, below the circle's geometric centre.
  const splitY=80;
  for(const [name,y,height,rotation] of [['minute',0,splitY,360],['hour',splitY,138.26-splitY,30]] as const){
   const clip=document.createElementNS(namespace,'clipPath');clip.id=`intro-${name}`;const rect=document.createElementNS(namespace,'rect');rect.setAttribute('x','0');rect.setAttribute('y',String(y));rect.setAttribute('width','206.27');rect.setAttribute('height',String(height));clip.append(rect);defs.append(clip);
   const group=document.createElementNS(namespace,'g');group.classList.add('intro-hand','intro-'+name);group.style.setProperty('--start-angle',`-${rotation}deg`);const copy=hand.cloneNode(true) as Element;copy.removeAttribute('id');copy.setAttribute('clip-path',`url(#intro-${name})`);group.append(copy);svg.append(group);
  }
  hand.remove();
  overlay.prepend(svg);overlay.append(createIntroWordmark(duration,reduced));
  // Both hands move clockwise with a shared timeline and a 12:1 angular-speed ratio.
  // The minute hand completes one turn while the hour hand advances one twelfth of a turn.
  overlay.classList.add('intro-running');
  await new Promise<void>(resolve=>{
   const timer=setTimeout(resolve,duration);
   overlay.addEventListener('intro-close',()=>{clearTimeout(timer);resolve();},{once:true});
  });
  if(!closed&&!reduced){
   // Restore the native caption area before the themed header slides into view.
   await window.appearance.setIntro(false);
   if(!closed)await playClockOutro(overlay,headerCover,restoreInteraction);
  }
 }catch(error){console.error('启动动画未完成',error);}finally{await close();}
 return true;
}
