import {t} from '../localization/i18n.js';
import {galleryStore} from './gallery-store.js';

export function mountLocalGallery(host:HTMLElement, category:'mine'|'fanart') {
 const add=document.createElement('button');add.className='primary';add.textContent=t(category==='fanart'?'添加同人图':'添加画作');
 const picker=document.createElement('input');picker.type='file';picker.accept='image/png,image/jpeg,image/webp,image/gif';picker.multiple=true;picker.hidden=true;
 const status=document.createElement('p');status.setAttribute('role','status');
 const grid=document.createElement('div');grid.className='gallery-grid';
 host.append(add,picker,status,grid);
 let urls:string[]=[];
 const release=()=>{urls.forEach(url=>URL.revokeObjectURL(url));urls=[];};
 const render=async()=>{
  const all=await galleryStore.list();if(!host.isConnected)return;
  const items=all.filter(item=>category==='fanart'?item.category==='fanart':item.category!=='fanart');
  release();grid.replaceChildren();
  status.textContent=items.length?'':t(category==='fanart'?'还没有同人图，添加图片开始收藏。':'还没有画作，添加图片开始收藏。');
  for(const item of items){
   const card=document.createElement('article');card.className='gallery-card';
   const view=document.createElement('button');view.className='gallery-image-button';view.setAttribute('aria-label',item.name);
   const image=document.createElement('img');const url=URL.createObjectURL(item.image);urls.push(url);image.src=url;image.alt=item.name;view.append(image);
   view.onclick=()=>{const dialog=document.createElement('dialog');dialog.className='gallery-preview';const image=document.createElement('img');image.src=url;image.alt=item.name;dialog.append(image);dialog.onclick=event=>{if(event.target===dialog)dialog.close();};dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();};
   const footer=document.createElement('div');const name=document.createElement('span');name.textContent=item.name;
   const remove=document.createElement('button');remove.className='quiet';remove.textContent=t('移除');remove.onclick=()=>{void galleryStore.remove(item.id).then(render).catch(()=>{status.textContent=t('移除失败，请重试');});};
   footer.append(name,remove);card.append(view,footer);grid.append(card);
  }
 };
 add.onclick=()=>picker.click();
 picker.onchange=()=>{const files=Array.from(picker.files??[]);picker.value='';void (async()=>{for(const file of files)await galleryStore.add({id:crypto.randomUUID(),name:file.name,image:file,...(category==='fanart'?{category:'fanart' as const}:{})});await render();})().catch(()=>{status.textContent=t('保存失败，请重试');});};
 void render().catch(()=>{status.textContent=t('无法读取画作，请重试。');});
 return release;
}
