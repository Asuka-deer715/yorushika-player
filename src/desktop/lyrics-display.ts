import type { CollectionApi, Lyrics, LyricLanguage } from '../shared/collection.js';
export class LyricsDisplay {
 private generation=0;
 private data:Lyrics={offset:0,tracks:{original:[],translation:[],romaji:[]}};
 private host:HTMLElement|null=null;
 private active:number|null=null;
 private visible=true;
 private time=0;
 constructor(private api:CollectionApi,private seek:(time:number)=>void){}
 async mount(host:HTMLElement,id:string,fallbackId?:string,findLinkedAudio=false){this.host=host;this.active=null;const generation=++this.generation;host.textContent='正在读取歌词…';try{let data=await this.api.lyrics(id);if(!Object.values(data.tracks).some(lines=>lines.length)){const linked=fallbackId??(findLinkedAudio?await this.api.audioForVideo(id):null);if(linked)data=await this.api.lyrics(linked);}if(generation!==this.generation)return;this.data=data;this.render();}catch{if(generation===this.generation)host.textContent='歌词读取失败，请在设置中重试。';}}
 private render(preservePosition=false){
  const host=this.host!;
  const previous=preservePosition?host.querySelector<HTMLElement>('.reading-lyrics'):null;
  const oldScroll=previous?.scrollTop??0;
  const anchor=previous&&!previous.hidden?[...previous.querySelectorAll<HTMLElement>('.lyric-group')].find(row=>row.getBoundingClientRect().bottom>previous.getBoundingClientRect().top):undefined;
  const anchorTime=anchor?.dataset.time;
  const anchorTop=anchor&&previous?anchor.getBoundingClientRect().top-previous.getBoundingClientRect().top:0;
  host.replaceChildren();
  const viewport=document.createElement('div');viewport.className='lyrics reading-lyrics';viewport.hidden=!this.visible;viewport.setAttribute('aria-label','同步歌词');
  const languages:LyricLanguage[]=['original'];for(const language of ['translation','romaji'] as const)if(localStorage.getItem('lyrics-'+language)==='true')languages.push(language);
  const times=[...new Set(languages.flatMap(language=>this.data.tracks[language].flatMap(line=>line.time===null?[]:[line.time])))].sort((a,b)=>a-b);
  for(const time of times){const group=document.createElement('div');group.className='lyric-group';group.dataset.time=String(time);group.tabIndex=0;group.setAttribute('role','button');group.setAttribute('aria-label','跳转到 '+Math.floor(time/60)+':'+String(Math.floor(time%60)).padStart(2,'0'));const actual=Math.max(0,time+this.data.offset/1000);const stamp=document.createElement('span');stamp.className='lyric-timestamp';stamp.textContent=Math.floor(actual/60)+':'+String(Math.floor(actual%60)).padStart(2,'0');stamp.setAttribute('aria-hidden','true');group.append(stamp);group.title='跳转到 '+stamp.textContent;const seek=()=>this.seek(actual);group.onclick=seek;group.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();seek();}};for(const language of languages)for(const line of this.data.tracks[language].filter(line=>line.time===time)){const text=document.createElement('p');text.className='lyric-'+language;text.textContent=line.text;group.append(text);}viewport.append(group);}
  for(const language of languages){const plain=this.data.tracks[language].filter(line=>line.time===null);if(plain.length){const section=document.createElement('section');for(const line of plain){const text=document.createElement('p');text.className='lyric-'+language;text.textContent=line.text;section.append(text);}viewport.append(section);}}
  if(!viewport.childElementCount)viewport.textContent='暂无歌词，可在设置中在线查找或导入。';
  host.append(viewport);const tools=document.createElement('div');tools.className='lyric-shortcuts';
  for(const [language,label,title] of [['translation','译','显示中文翻译'],['romaji','音','显示罗马音']] as const){const button=document.createElement('button');button.textContent=label;button.title=title;button.setAttribute('aria-label',title);button.setAttribute('aria-pressed',String(localStorage.getItem('lyrics-'+language)==='true'));button.disabled=!this.data.tracks[language].length;if(button.disabled)button.title='当前版本没有'+(language==='translation'?'翻译':'罗马音');button.onclick=()=>{localStorage.setItem('lyrics-'+language,String(localStorage.getItem('lyrics-'+language)!=='true'));this.render(true);};tools.append(button);}
  const toggle=document.createElement('button');toggle.textContent='词';toggle.title='显示或隐藏歌词';toggle.setAttribute('aria-label',toggle.title);toggle.setAttribute('aria-pressed',String(this.visible));toggle.onclick=()=>{this.visible=!this.visible;viewport.hidden=!this.visible;toggle.setAttribute('aria-pressed',String(this.visible));if(this.visible){this.active=null;this.update(this.time);}};tools.append(toggle);host.append(tools);
  if(preservePosition){
   viewport.style.scrollBehavior='auto';
   viewport.scrollTop=oldScroll;
   const newAnchor=[...viewport.querySelectorAll<HTMLElement>('.lyric-group')].find(row=>row.dataset.time===anchorTime);
   if(newAnchor&&!viewport.hidden)viewport.scrollTop+=newAnchor.getBoundingClientRect().top-viewport.getBoundingClientRect().top-anchorTop;
   viewport.style.removeProperty('scroll-behavior');
   const active=[...viewport.querySelectorAll<HTMLElement>('.lyric-group')].filter(row=>Number(row.dataset.time)<=this.time-this.data.offset/1000).at(-1);
   this.active=active?Number(active.dataset.time):null;
  }
  this.update(this.time);
 }
 update(time:number){this.time=time;if(!this.host?.isConnected)return;const rows=[...this.host.querySelectorAll<HTMLElement>('.lyric-group')];const active=rows.filter(row=>Number(row.dataset.time)<=time-this.data.offset/1000).at(-1);for(const row of rows){row.classList.toggle('active',row===active);row.classList.toggle('played',!!active&&Number(row.dataset.time)<Number(active.dataset.time));}const stamp=active?Number(active.dataset.time):null;if(active&&stamp!==this.active&&this.visible){const viewport=this.host.querySelector<HTMLElement>('.reading-lyrics')!;viewport.scrollTop+=active.getBoundingClientRect().top-viewport.getBoundingClientRect().top-viewport.clientHeight/2+active.clientHeight/2;}this.active=stamp;}
}
