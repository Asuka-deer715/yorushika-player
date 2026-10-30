import type { CollectionApi, Lyrics, LyricLanguage } from '../shared/collection.js';
export class LyricsDisplay {
 private generation=0;
 private data:Lyrics={offset:0,tracks:{original:[],translation:[],romaji:[]}};
 private host:HTMLElement|null=null;
 private active:number|null=null;
 private visible=true;
 private time=0;
 constructor(private api:CollectionApi){}
 async mount(host:HTMLElement,id:string){this.host=host;this.active=null;const generation=++this.generation;host.textContent='正在读取歌词…';try{const data=await this.api.lyrics(id);if(generation!==this.generation)return;this.data=data;this.render();}catch{if(generation===this.generation)host.textContent='歌词读取失败，请在设置中重试。';}}
 private render(){
  const host=this.host!;host.replaceChildren();
  const viewport=document.createElement('div');viewport.className='lyrics reading-lyrics';viewport.hidden=!this.visible;viewport.setAttribute('aria-label','同步歌词');
  const languages:LyricLanguage[]=['original'];for(const language of ['translation','romaji'] as const)if(localStorage.getItem('lyrics-'+language)==='true')languages.push(language);
  const times=[...new Set(languages.flatMap(language=>this.data.tracks[language].flatMap(line=>line.time===null?[]:[line.time])))].sort((a,b)=>a-b);
  for(const time of times){const group=document.createElement('div');group.className='lyric-group';group.dataset.time=String(time);for(const language of languages)for(const line of this.data.tracks[language].filter(line=>line.time===time)){const text=document.createElement('p');text.className='lyric-'+language;text.textContent=line.text;group.append(text);}viewport.append(group);}
  for(const language of languages){const plain=this.data.tracks[language].filter(line=>line.time===null);if(plain.length){const section=document.createElement('section');for(const line of plain){const text=document.createElement('p');text.className='lyric-'+language;text.textContent=line.text;section.append(text);}viewport.append(section);}}
  if(!viewport.childElementCount)viewport.textContent='暂无歌词，可在设置中在线查找或导入。';
  host.append(viewport);const tools=document.createElement('div');tools.className='lyric-shortcuts';
  for(const [language,label,title] of [['translation','译','显示中文翻译'],['romaji','音','显示罗马音']] as const){const button=document.createElement('button');button.textContent=label;button.title=title;button.setAttribute('aria-label',title);button.setAttribute('aria-pressed',String(localStorage.getItem('lyrics-'+language)==='true'));button.disabled=!this.data.tracks[language].length;if(button.disabled)button.title='当前版本没有'+(language==='translation'?'翻译':'罗马音');button.onclick=()=>{localStorage.setItem('lyrics-'+language,String(localStorage.getItem('lyrics-'+language)!=='true'));this.active=null;this.render();};tools.append(button);}
  const toggle=document.createElement('button');toggle.textContent='词';toggle.title='显示或隐藏歌词';toggle.setAttribute('aria-label',toggle.title);toggle.setAttribute('aria-pressed',String(this.visible));toggle.onclick=()=>{this.visible=!this.visible;this.active=null;this.render();};tools.append(toggle);host.append(tools);this.update(this.time);
 }
 update(time:number){this.time=time;if(!this.host?.isConnected)return;const rows=[...this.host.querySelectorAll<HTMLElement>('.lyric-group')];const active=rows.filter(row=>Number(row.dataset.time)<=time-this.data.offset/1000).at(-1);for(const row of rows)row.classList.toggle('active',row===active);const stamp=active?Number(active.dataset.time):null;if(active&&stamp!==this.active&&this.visible){const viewport=this.host.querySelector<HTMLElement>('.reading-lyrics')!;viewport.scrollTop+=active.getBoundingClientRect().top-viewport.getBoundingClientRect().top-viewport.clientHeight/2+active.clientHeight/2;}this.active=stamp;}
}
