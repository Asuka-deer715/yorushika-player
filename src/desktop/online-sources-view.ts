import type { OnlineSourcesApi, OnlineSource } from '../shared/online-sources.js';
const names={netease:'网易云音乐',qq:'QQ 音乐',bilibili:'哔哩哔哩'};
export class OnlineSourcesView {
 constructor(private api:OnlineSourcesApi,private notify:(text:string)=>void,private pause:()=>void,private current:()=>string|undefined){}
 async mount(host:HTMLElement,lyrics=false){
  host.innerHTML=`<h2>${lyrics?'平台歌词':'在线链接'}</h2><p>${lyrics?'将已保存的歌曲链接对应歌词用于当前本地版本。':'收藏网易云／QQ 单曲或 B 站视频链接。歌曲在原平台打开，视频可在这里观看。'}</p><form class="source-form"><label>歌曲或视频链接<input name="url" required maxlength="2048" placeholder="完整链接或 BV 号"></label><label>收藏名称<input name="title" maxlength="200" placeholder="歌曲 / MV 名称（选填）"></label><button class="secondary">保存链接</button></form><p class="source-status" role="status"></p><div class="source-list"></div><div class="online-video"></div>`;
  const status=host.querySelector<HTMLElement>('.source-status')!;
  const list=host.querySelector<HTMLElement>('.source-list')!;
  const task=async(action:()=>Promise<unknown>)=>{try{await action()}catch(error){if(host.isConnected)status.textContent=(error as Error).message;}};
  const render=(sources:OnlineSource[])=>{
   list.replaceChildren();if(!sources.length){list.textContent='还没有保存链接。';return;}
   for(const source of sources){
    if(lyrics&&source.platform==='bilibili')continue;
    const row=document.createElement('div');row.className='source-row';
    const label=document.createElement('span');label.textContent=`${source.title} · ${names[source.platform]}`;row.append(label);
    const button=(name:string,action:()=>Promise<unknown>)=>{const b=document.createElement('button');b.className='quiet';b.textContent=name;b.onclick=()=>{b.disabled=true;void task(action).finally(()=>b.disabled=false)};row.append(b);return b;};
    button('原平台打开',()=>this.api.open(source.key));
    if(source.platform==='bilibili')button('观看',async()=>{
     this.pause();const area=host.querySelector<HTMLElement>('.online-video')!;area.replaceChildren();
     const close=document.createElement('button');close.className='quiet';close.textContent='关闭视频';close.onclick=()=>area.replaceChildren();
     const frame=document.createElement('iframe');frame.title=source.title;frame.allow='fullscreen; autoplay';frame.allowFullscreen=true;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');frame.src=`https://player.bilibili.com/player.html?bvid=${source.remoteId}&p=${source.part}&autoplay=0&danmaku=0`;
     const hint=document.createElement('p');hint.textContent='使用视频内控件播放；如平台限制嵌入，请选择“原平台打开”。';area.append(close,frame,hint);area.scrollIntoView({block:'center',behavior:'smooth'});
    });
    else if(lyrics){const b=button('获取并替换可用歌词',async()=>{const id=this.current();if(!id)throw new Error('请先播放需要关联歌词的本地歌曲');status.textContent='正在获取歌词…';const result=await this.api.lyrics(source.key,id);if(host.isConnected)status.textContent=`已保存原文 ${result.tracks.original.length} 行；平台未提供的语言保留原有内容。`;this.notify('歌词已保存，重新打开播放页即可查看');});b.disabled=!this.current();}
    button('移除',async()=>render(await this.api.remove(source.key)));list.append(row);
   }
  };
  host.querySelector('form')!.onsubmit=event=>{event.preventDefault();const form=event.currentTarget as HTMLFormElement;const data=new FormData(form);const submit=form.querySelector('button')!;submit.disabled=true;void task(async()=>{render(await this.api.add(String(data.get('url')),String(data.get('title'))));form.reset();status.textContent='链接已保存';}).finally(()=>submit.disabled=false);};
  await task(async()=>{const items=await this.api.list();if(host.isConnected)render(items);});
 }
}
