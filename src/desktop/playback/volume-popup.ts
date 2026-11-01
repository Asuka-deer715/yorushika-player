export function mountVolumePopup(host:HTMLElement){
 const trigger=host.querySelector<HTMLButtonElement>('#volume-open')!;const popup=host.querySelector<HTMLElement>('#volume-popup')!;
 const setOpen=(open:boolean)=>{popup.hidden=!open;trigger.setAttribute('aria-expanded',String(open));};
 trigger.onclick=()=>setOpen(popup.hasAttribute('hidden'));
 document.addEventListener('pointerdown',event=>{if(!host.contains(event.target as Node))setOpen(false);});
 host.addEventListener('keydown',event=>{if(event.key==='Escape'&&!popup.hidden){event.stopPropagation();setOpen(false);trigger.focus();}});
}
