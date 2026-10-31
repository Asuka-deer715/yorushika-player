import {formatText} from '../localization/i18n.js';
import {localizedMarkup} from '../localization/i18n.js';
import {translateMarkup} from '../localization/i18n.js';
import {t} from '../localization/i18n.js';
import type { CollectionApi } from '../../shared/collection.js';
import type { OnlineSourcesApi, OnlineSource } from '../../shared/online-sources.js';
const names={netease:'网易云音乐',qq:'QQ 音乐',bilibili:'哔哩哔哩'};
export class OnlineSourcesView {
 constructor(private api:OnlineSourcesApi,private notify:(text:string)=>void,private pause:()=>void,private current:()=>string|undefined,private collection:CollectionApi){}
 async mount(host:HTMLElement,lyrics=false){
  host.innerHTML=localizedMarkup`<h2>${lyrics?t('平台歌词'):t('在线链接')}</h2><p>${lyrics?t('将已保存的歌曲链接对应歌词用于当前本地版本。'):t('收藏网易云／QQ 单曲或 B 站视频链接。歌曲在原平台打开，视频可在这里观看。')}</p><form class="source-form online-source-form"><label>歌曲或视频链接<input name="url" required maxlength="2048" placeholder="完整链接或 BV 号"></label><label>收藏名称<input name="title" maxlength="200" placeholder="歌曲 / MV 名称（选填）"></label><button class="secondary">保存链接</button></form><p class="source-status" role="status"></p><div class="source-list"></div><div class="online-video"></div>`;
  if(!lyrics){const search=document.createElement('section');search.className='online-discovery';search.innerHTML=translateMarkup('<h3>搜索在线歌曲</h3><p>搜索网易云公开歌曲，在应用内使用平台播放器收听。</p><form class="source-form"><label>歌曲或歌手<input name="query" required maxlength="200" aria-label="搜索在线歌曲"></label><button class="secondary">搜索</button></form><p class="online-search-status" role="status"></p><div class="online-search-results"></div>');host.prepend(search);const form=search.querySelector('form')!;const message=search.querySelector<HTMLElement>('.online-search-status')!;const results=search.querySelector<HTMLElement>('.online-search-results')!;form.onsubmit=event=>{event.preventDefault();const query=(form.elements.namedItem('query') as HTMLInputElement).value.trim();if(!query)return;const button=form.querySelector('button')!;button.disabled=true;message.textContent=t('正在搜索…');results.replaceChildren();void this.collection.searchPlatformLyrics('netease',query,'').then(items=>{if(!search.isConnected)return;message.textContent=items.length?t('选择一首歌收听。'):t('没有找到歌曲，请换个关键词。');for(const item of items){if(!/^\d{1,20}$/.test(item.id))continue;const row=document.createElement('div');row.className='source-row';const title=document.createElement('span');title.textContent=`${item.title} · ${item.artist} · ${item.album||'未知专辑'}`;const play=document.createElement('button');play.className='quiet';play.textContent=t('应用内播放');play.onclick=()=>playNetease(item.id,item.title);const save=document.createElement('button');save.className='quiet';save.textContent=t('收藏链接');save.onclick=()=>{save.disabled=true;void this.api.add('https://music.163.com/#/song?id='+item.id,item.title+' · '+item.artist).then(render).catch(error=>{save.disabled=false;message.textContent=(error as Error).message;});};row.append(title,play,save);results.append(row);}}).catch(error=>{message.textContent=t('搜索失败：')+(error as Error).message;}).finally(()=>button.disabled=false);};}
  const playNetease=(id:string,title:string)=>{this.pause();const area=host.querySelector<HTMLElement>('.online-video')!;area.replaceChildren();const close=document.createElement('button');close.className='quiet';close.textContent=t('关闭在线播放器');close.onclick=()=>area.replaceChildren();const frame=document.createElement('iframe');frame.title=title+' · 网易云播放器';frame.src=`https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=66`;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation allow-popups');frame.allow='autoplay';const hint=document.createElement('p');hint.textContent=t('请使用播放器控件开始播放；可播放范围和音质由网易云决定。');area.append(close,frame,hint);area.scrollIntoView({block:'center',behavior:'smooth'});};
  const status=host.querySelector<HTMLElement>('.source-status')!;
  const list=host.querySelector<HTMLElement>('.source-list')!;
  const task=async(action:()=>Promise<unknown>)=>{try{await action()}catch(error){if(host.isConnected)status.textContent=(error as Error).message;}};
  const render=(sources:OnlineSource[])=>{
   list.replaceChildren();if(!sources.length){list.textContent=t('还没有保存链接。');return;}
   for(const source of sources){
    if(lyrics&&source.platform==='bilibili')continue;
    const row=document.createElement('div');row.className='source-row';
    const label=document.createElement('span');label.textContent=`${source.title} · ${names[source.platform]}`;row.append(label);
    const button=(name:string,action:()=>Promise<unknown>)=>{const b=document.createElement('button');b.className='quiet';b.textContent=t(name);b.onclick=()=>{b.disabled=true;void task(action).finally(()=>b.disabled=false)};row.append(b);return b;};
    button('原平台打开',()=>this.api.open(source.key));
    if(!lyrics&&source.platform==='netease')button('应用内播放',async()=>playNetease(source.remoteId,source.title));
    if(source.platform==='bilibili')button('观看',async()=>{
     this.pause();const area=host.querySelector<HTMLElement>('.online-video')!;area.replaceChildren();
     const close=document.createElement('button');close.className='quiet';close.textContent=t('关闭视频');close.onclick=()=>area.replaceChildren();
     const frame=document.createElement('iframe');frame.title=source.title;frame.allow='fullscreen; autoplay';frame.allowFullscreen=true;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');frame.src=`https://player.bilibili.com/player.html?bvid=${source.remoteId}&p=${source.part}&autoplay=0&danmaku=0`;
     const hint=document.createElement('p');hint.textContent=t('使用视频内控件播放；如平台限制嵌入，请选择“原平台打开”。');area.append(close,frame,hint);area.scrollIntoView({block:'center',behavior:'smooth'});
    });
    else if(lyrics){const b=button('获取并替换可用歌词',async()=>{const id=this.current();if(!id)throw new Error('请先播放需要关联歌词的本地歌曲');status.textContent=t('正在获取歌词…');const result=await this.api.lyrics(source.key,id);if(host.isConnected)status.textContent=formatText("已保存原文 {1} 行；平台未提供的语言保留原有内容。",result.tracks.original.length);this.notify('歌词已保存，重新打开播放页即可查看');});b.disabled=!this.current();}
    button('移除',async()=>render(await this.api.remove(source.key)));list.append(row);
   }
  };
  host.querySelector<HTMLFormElement>('.online-source-form')!.onsubmit=event=>{event.preventDefault();const form=event.currentTarget as HTMLFormElement;const data=new FormData(form);const submit=form.querySelector('button')!;submit.disabled=true;void task(async()=>{render(await this.api.add(String(data.get('url')),String(data.get('title'))));form.reset();status.textContent=t('链接已保存');}).finally(()=>submit.disabled=false);};
  await task(async()=>{const items=await this.api.list();if(host.isConnected)render(items);});
 }
}
