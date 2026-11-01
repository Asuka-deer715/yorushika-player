export async function playClockOutro(overlay:HTMLElement,headerCover:HTMLElement,onVisible:()=>void){
 overlay.classList.add('clock-reveal');
 document.body.classList.add('clock-revealing');
 headerCover.remove();
 await new Promise<void>(resolve=>{
  let done=false;
  const visible=()=>{overlay.style.pointerEvents='none';onVisible();};
  const visibleTimer=setTimeout(visible,950);
  const finish=()=>{if(done)return;done=true;clearTimeout(timer);clearTimeout(visibleTimer);overlay.removeEventListener('intro-close',finish);document.body.classList.remove('clock-revealing');resolve();};
  const timer=setTimeout(finish,1500);
  overlay.addEventListener('intro-close',finish,{once:true});
 });
}
