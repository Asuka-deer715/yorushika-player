export async function playIntro(force=false){
 if(document.querySelector('.intro')||(!force&&localStorage.getItem('desktop-intro')==='false')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const overlay=document.createElement('div');overlay.className='intro';overlay.setAttribute('aria-label','夜鹿启动动画');
 const skip=document.createElement('button');skip.className='intro-skip';skip.textContent='跳过';overlay.append(skip);document.body.append(overlay);
 const prior=document.activeElement as HTMLElement|null;
 const surfaces=Array.from(document.body.children).filter(el=>el!==overlay&&el instanceof HTMLElement) as HTMLElement[];
 const previous=surfaces.map(el=>el.inert);surfaces.forEach(el=>el.inert=true);
 let closed=false;const close=()=>{if(closed)return;closed=true;overlay.remove();surfaces.forEach((el,i)=>el.inert=previous[i]);document.removeEventListener('keydown',escape);prior?.focus();};
 const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};document.addEventListener('keydown',escape);skip.onclick=close;skip.focus();
 try{
  const response=await fetch('../renderer/yorushika-official-mark.svg');if(!response.ok)throw new Error('启动标志加载失败');
  const svg=new DOMParser().parseFromString(await response.text(),'image/svg+xml').documentElement;
  if(closed)return;const namespace='http://www.w3.org/2000/svg';const hand=svg.querySelector('[id="パス_18"]')!;
  const defs=document.createElementNS(namespace,'defs');svg.prepend(defs);
  for(const [name,y,rotation] of [['minute',0,720],['hour',69.13,360]] as const){
   const clip=document.createElementNS(namespace,'clipPath');clip.id=`intro-${name}`;const rect=document.createElementNS(namespace,'rect');rect.setAttribute('x','0');rect.setAttribute('y',String(y));rect.setAttribute('width','206.27');rect.setAttribute('height','69.13');clip.append(rect);defs.append(clip);
   const group=document.createElementNS(namespace,'g');group.classList.add('intro-hand');const copy=hand.cloneNode(true) as Element;copy.removeAttribute('id');copy.setAttribute('clip-path',`url(#intro-${name})`);group.append(copy);svg.append(group);group.animate([{transform:`rotate(-${rotation}deg)`},{transform:'rotate(0deg)'}],{duration:1900,delay:450,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  }
  hand.remove();overlay.prepend(svg);
  const opening=svg.animate([{clipPath:'inset(49.7% 0)'},{clipPath:'inset(0% 0)'}],{duration:1100,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  await opening.finished;await new Promise(resolve=>setTimeout(resolve,1400));if(closed)return;
  await overlay.animate([{clipPath:'inset(0 0 0 0)'},{clipPath:'inset(50% 0 50% 0)'}],{duration:700,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished;
 }catch(error){console.error('启动动画未完成',error);}finally{close();}
}
