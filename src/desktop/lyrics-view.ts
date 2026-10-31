import type { CollectionApi, Lyrics, LyricLanguage } from '../shared/collection.js';
export class LyricsView {
 private data:Lyrics={offset:0,tracks:{original:[],translation:[],romaji:[]}};
 private title='';
 private generation=0;
 private shown={original:true,translation:localStorage.getItem('lyrics-translation')==='true',romaji:localStorage.getItem('lyrics-romaji')==='true'};
 constructor(private api:CollectionApi,private report:(message:string)=>void){}
 async mount(container:HTMLElement,id:string,title:string,showOffset=true){this.title=title;this.shown.translation=localStorage.getItem('lyrics-translation')==='true';this.shown.romaji=localStorage.getItem('lyrics-romaji')==='true';const generation=++this.generation;container.textContent='正在读取歌词…';try{const data=await this.api.lyrics(id);if(generation!==this.generation)return;this.data=data;this.render(container,id,generation,showOffset);}catch(error){if(generation===this.generation){container.textContent='歌词读取失败，请重新打开播放页。';this.report((error as Error).message);}}}
 private render(container:HTMLElement,id:string,generation:number,showOffset=true){
  container.replaceChildren();const controls=document.createElement('div');controls.className='lyric-controls';
  const labels={original:'原文',translation:'翻译',romaji:'罗马音'};
  for(const language of ['original','translation','romaji'] as LyricLanguage[]){
   if(language!=='original'){const label=document.createElement('label');const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=this.shown[language];checkbox.onchange=()=>{this.shown[language]=checkbox.checked;localStorage.setItem('lyrics-'+language,String(checkbox.checked));this.render(container,id,generation,showOffset)};label.append(checkbox,labels[language]);controls.append(label);}
   const button=document.createElement('button');button.className='quiet';button.textContent='导入'+labels[language];button.onclick=async()=>{try{const data=await this.api.importLyrics(id,language);if(generation!==this.generation)return;this.data=data;this.render(container,id,generation,showOffset);}catch(error){this.report((error as Error).message)}};controls.append(button);
  }container.append(controls);
  if(!showOffset)return;
  const offset=document.createElement('label');offset.className='offset';offset.append('歌词延后（秒）');const input=document.createElement('input');input.type='number';input.min='-600';input.max='600';input.step='0.1';input.value=String(this.data.offset/1000);input.onchange=async()=>{const value=Number(input.value)*1000;try{await this.api.setOffset(id,value);if(generation===this.generation)this.data.offset=value;}catch(error){input.value=String(this.data.offset/1000);this.report((error as Error).message)}};offset.append(input);const reset=document.createElement('button');reset.textContent='归零';reset.className='quiet';reset.onclick=()=>{input.value='0';input.dispatchEvent(new Event('change'))};offset.append(reset);container.append(offset);
  const hint=document.createElement('p');hint.className='lyric-hint';hint.textContent='UTF-8 LRC / TXT；正值延后、负值提前，仅影响当前版本。';container.append(hint);

 }
}
