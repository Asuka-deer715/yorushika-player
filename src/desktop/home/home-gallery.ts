import {formatText} from '../localization/i18n.js';
import {translateMarkup} from '../localization/i18n.js';
import {t} from '../localization/i18n.js';
import {choosePlaylistCover} from '../playlists/playlist-cover-editor.js';
export interface HomeGalleryState {hidden:string[];custom:{id:string;data:string}[]}
interface Cover {id:string;name:string;url:string;source:string}
const covers:Cover[]=[
 {id:'music',name:'だから僕は音楽を辞めた',url:'../renderer/yorushika-official-album.jpeg',source:'ヨルシカ'},
 {id:'elma',name:'エルマ',url:'https://s3-aop.plusmember.jp/prod/public/yorushika/contents/discography/8404509f7cb04236612368c1bc708cc2.jpeg',source:'ヨルシカ · 官方作品封面'},
 {id:'plagiarism',name:'盗作',url:'https://s3-aop.plusmember.jp/prod/public/yorushika/contents/discography/647899ce4d95a253fdef62dfba55e198.png',source:'ヨルシカ · 官方作品封面'},
 {id:'magic-lantern',name:'幻燈',url:'https://s3-aop.plusmember.jp/prod/public/yorushika/contents/discography/1a9288cfa072390f962919093a6acf75.jpeg',source:'ヨルシカ · 官方作品封面'}
];
async function imageOf(cover:Cover){if(!cover.url.startsWith('https:'))return cover.url;const id='home-official-'+cover.id;const saved=await window.catalogCoverCache.get(id);if(saved)return saved;return window.catalogCoverCache.save(id,cover.url);}
export async function mountHomeGallery(figure:HTMLElement){
 let state:HomeGalleryState;try{state=await window.homeGallery.get();}catch{return;}if(!figure.isConnected)return;
 const image=figure.querySelector('img')!;const caption=figure.querySelector('figcaption')!;const choices:{url:string;name:string;source:string}[]=[];
 const enabled=covers.filter(item=>!state.hidden.includes(item.id));for(const item of enabled.filter(item=>!item.url.startsWith('https:')))choices.push(item);for(const [index,item] of state.custom.entries())choices.push({url:item.data,name:formatText("我的封面 {1}",index+1),source:'用户添加'});
 let current=0;const show=()=>{const next=choices[current];if(!next){image.hidden=true;caption.textContent=t('请在设置中添加或启用主页封面');return;}image.hidden=false;image.src=next.url;image.alt=next.name+' 封面';caption.replaceChildren(document.createTextNode(next.name),document.createElement('br'),document.createTextNode(next.source));if(!matchMedia('(prefers-reduced-motion: reduce)').matches)image.animate([{opacity:.65},{opacity:1}],{duration:500,easing:'ease-out'});};show();
 void Promise.all(enabled.filter(item=>item.url.startsWith('https:')).map(async item=>{try{return {...item,url:await imageOf(item)}}catch{return null}})).then(items=>{if(!figure.isConnected)return;const wasEmpty=!choices.length;for(const item of items)if(item)choices.push(item);if(wasEmpty&&choices.length)show();});
 const timer=setInterval(()=>{if(!figure.isConnected){clearInterval(timer);return;}if(choices.length>1){current=(current+1)%choices.length;show();}},7000);
}
export async function mountHomeGallerySettings(host:HTMLElement){
 host.className='home-gallery-settings';host.innerHTML=translateMarkup('<h2>主页封面</h2><p>轮流展示启用的官方封面和自己添加的方形图片。官方图片首次需要联网，成功获取后保存在本机。</p><div class="home-gallery-list"></div><button type="button" class="quiet">添加图片</button><p role="status"></p>');const list=host.querySelector<HTMLElement>('.home-gallery-list')!;const add=host.querySelector<HTMLButtonElement>('button')!;const status=host.querySelector<HTMLElement>('[role=status]')!;let state:HomeGalleryState;try{state=await window.homeGallery.get();}catch{status.textContent=t('无法读取主页封面设置');return;}if(!host.isConnected)return;
 const render=()=>{list.replaceChildren();for(const cover of covers){const row=document.createElement('label');row.className='home-gallery-row';const check=document.createElement('input');check.type='checkbox';check.checked=!state.hidden.includes(cover.id);check.onchange=()=>{const hidden=check.checked?state.hidden.filter(id=>id!==cover.id):[...state.hidden,cover.id];void window.homeGallery.set({...state,hidden}).then(saved=>{state=saved;status.textContent='';}).catch(()=>{check.checked=!check.checked;status.textContent=t('保存失败，请重试');});};const text=document.createElement('span');text.textContent=cover.name+' · 官方';row.append(check,text);list.append(row);}state.custom.forEach((item,index)=>{const row=document.createElement('div');row.className='home-gallery-row';const img=document.createElement('img');img.src=item.data;img.alt='';const text=document.createElement('span');text.textContent=formatText("我的封面 {1}",index+1);const remove=document.createElement('button');remove.type='button';remove.className='quiet';remove.textContent=t('移除');remove.onclick=()=>{void window.homeGallery.set({...state,custom:state.custom.filter(x=>x.id!==item.id)}).then(saved=>{state=saved;render();}).catch(()=>{status.textContent=t('移除失败，请重试');});};row.append(img,text,remove);list.append(row);});add.disabled=state.custom.length>=20;};
 add.onclick=()=>choosePlaylistCover(async data=>{state=await window.homeGallery.set({...state,custom:[...state.custom,{id:crypto.randomUUID(),data}]});render();},'主页封面');render();
}
