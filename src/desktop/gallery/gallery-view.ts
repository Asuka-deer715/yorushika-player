import {t} from '../localization/i18n.js';
import {mountLocalGallery} from './gallery-local.js';
import {officialGallery} from './official-gallery.js';
import {collaborations,exhibitions,type GalleryCollectionImage} from './gallery-collections.js';

export async function mountGallery(host:HTMLElement) {
 const title=document.createElement('h1');title.textContent=t('画廊');
 const intro=document.createElement('p');intro.textContent=t('收藏你喜欢的画作，图片保存在这台设备上。');
 const officialTitle=document.createElement('h2');officialTitle.textContent=t('官方作品封面');
 const officialNote=document.createElement('p');officialNote.textContent=t('来自夜鹿官网发行目录；首次浏览需要联网。');
 const officialGrid=document.createElement('div');officialGrid.className='gallery-grid';
 const tabs=document.createElement('div');tabs.className='catalog-tabs gallery-tabs';tabs.setAttribute('aria-label',t('画廊分类'));
 const mine=document.createElement('section');const fanart=document.createElement('section');
 const covers=document.createElement('section');covers.append(officialTitle,officialNote,officialGrid);
 const collabSection=document.createElement('section');const exhibitionSection=document.createElement('section');
 const collabGrid=document.createElement('div');collabGrid.className='gallery-grid gallery-curated';
 const exhibitionGrid=document.createElement('div');exhibitionGrid.className='gallery-grid gallery-curated';
 const collabNote=document.createElement('p');collabNote.textContent=t('官方联动与活动图片；署名按可核实资料标注。');
 const exhibitionNote=document.createElement('p');exhibitionNote.textContent=t('官方公开的画集与展览相关图片。');
 collabSection.append(collabNote,collabGrid);exhibitionSection.append(exhibitionNote,exhibitionGrid);
 const groups:[string,HTMLElement][]=[['我的收藏',mine],['同人图',fanart],['官方作品封面',covers],['官方联动',collabSection],['画集与展览',exhibitionSection]];
 groups.forEach(([name,section],index)=>{
  const button=document.createElement('button');button.className='quiet';button.textContent=t(name);
  button.setAttribute('aria-pressed',String(index===0));section.hidden=index!==0;
  button.onclick=()=>{for(const child of tabs.querySelectorAll('button'))child.setAttribute('aria-pressed',String(child===button));for(const [,group] of groups)group.hidden=group!==section;};
  tabs.append(button);
 });
 host.append(title,intro,tabs,...groups.map(([,section])=>section));
 const releaseMine=mountLocalGallery(mine,'mine');const releaseFanart=mountLocalGallery(fanart,'fanart');
 const officialObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   officialObserver.unobserve(entry.target);
   const card=entry.target as HTMLElement;
   const index=Number(card.dataset.index);
   const item=officialGallery[index];
   const image=card.querySelector('img')!;
   const id='official-gallery-'+index;
   void window.catalogCoverCache.get(id).then(saved=>saved||window.catalogCoverCache.save(id,item.url)).then(data=>{
    if(!card.isConnected)return;
    image.src=data;
    card.querySelector('button')!.onclick=()=>{const dialog=document.createElement('dialog');dialog.className='gallery-preview';const large=document.createElement('img');large.src=data;large.alt=item.name;dialog.append(large);dialog.onclick=event=>{if(event.target===dialog)dialog.close();};dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();};
   }).catch(()=>{image.alt=t('封面加载失败');});
  }
 },{rootMargin:'300px'});
 officialGallery.forEach((item,index)=>{
  const card=document.createElement('article');card.className='gallery-card';card.dataset.index=String(index);
  const view=document.createElement('button');view.className='gallery-image-button';view.setAttribute('aria-label',item.name);
  const image=document.createElement('img');image.alt=item.name;view.append(image);
  const footer=document.createElement('div');const name=document.createElement('span');name.textContent=item.name;footer.append(name);
  card.append(view,footer);officialGrid.append(card);officialObserver.observe(card);
 });
 const curatedObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   curatedObserver.unobserve(entry.target);
   const card=entry.target as HTMLElement;const item=curatedItems[Number(card.dataset.index)];
   const image=card.querySelector('img')!;
   void window.catalogCoverCache.get('gallery-'+item.id).then(saved=>saved||window.catalogCoverCache.save('gallery-'+item.id,item.url)).then(data=>{
    if(!card.isConnected)return;
    image.src=data;
    card.querySelector<HTMLButtonElement>('.gallery-image-button')!.onclick=()=>{const dialog=document.createElement('dialog');dialog.className='gallery-preview';const large=document.createElement('img');large.src=data;large.alt=item.name;dialog.append(large);dialog.onclick=event=>{if(event.target===dialog)dialog.close();};dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();};
   }).catch(()=>{image.alt=t('图片加载失败');});
  }
 },{rootMargin:'300px'});
 const curatedItems:GalleryCollectionImage[]=[...collaborations,...exhibitions];
 curatedItems.forEach((item,index)=>{
  const card=document.createElement('article');card.className='gallery-card';card.dataset.index=String(index);
  const view=document.createElement('button');view.className='gallery-image-button';view.setAttribute('aria-label',item.name);
  const image=document.createElement('img');image.alt=item.name;view.append(image);
  const name=document.createElement('strong');name.className='gallery-curated-name';name.textContent=item.name;
  const credit=document.createElement('p');credit.className='gallery-credit';credit.textContent=t(item.credit);
  const links=document.createElement('div');links.className='gallery-source-links';
  const source=document.createElement('button');source.className='quiet';source.textContent=t('官方来源');source.onclick=()=>void window.storySources.open(item.source);
  links.append(source);
  if(item.creditSource){const attribution=document.createElement('button');attribution.className='quiet';attribution.textContent=t('署名资料');attribution.onclick=()=>void window.storySources.open(item.creditSource!);links.append(attribution);}
  card.append(view,name,credit,links);(index<collaborations.length?collabGrid:exhibitionGrid).append(card);curatedObserver.observe(card);
 });
 const observer=new MutationObserver(()=>{if(!host.isConnected){releaseMine();releaseFanart();officialObserver.disconnect();curatedObserver.disconnect();observer.disconnect();}});
 observer.observe(host.parentElement!,{childList:true});
}
