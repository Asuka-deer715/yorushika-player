import type {CollectionApi} from '../shared/collection.js';
export class LyricOffsetControl {
 readonly element=document.createElement('div');
 private id:string|null=null;private offset=0;private generation=0;
 constructor(private api:CollectionApi,private apply:(offset:number)=>void,private report:(message:string)=>void){this.element.className='mv-lyric-offset';this.element.hidden=true;}
 sync(id:string|null){if(id===this.id)return;this.id=id;const generation=++this.generation;this.element.hidden=!id;if(!id)return;this.element.replaceChildren();void this.api.lyrics(id).then(data=>{if(generation!==this.generation)return;this.offset=data.offset;this.render();}).catch(()=>this.report('无法读取歌词时间设置'));}
 private render(){
  this.element.replaceChildren();const earlier=document.createElement('button');earlier.className='quiet';earlier.textContent='−';earlier.title='歌词提前 0.5 秒';earlier.setAttribute('aria-label',earlier.title);
  const value=document.createElement('button');value.className='quiet';value.title='点击重置歌词时间';value.setAttribute('aria-label','重置歌词时间');value.textContent=`歌词 ${this.offset>0?'+':''}${(this.offset/1000).toFixed(1)}s`;
  const later=document.createElement('button');later.className='quiet';later.textContent='+';later.title='歌词延后 0.5 秒';later.setAttribute('aria-label',later.title);
  const save=async(offset:number)=>{const id=this.id;if(!id)return;earlier.disabled=value.disabled=later.disabled=true;try{await this.api.setOffset(id,offset);if(this.id!==id)return;this.offset=offset;this.apply(offset);window.dispatchEvent(new Event('lyrics-offset-changed'));this.render();}catch{this.report('歌词时间保存失败');if(this.id===id)this.render();}};
  earlier.onclick=()=>void save(Math.max(-600000,this.offset-500));later.onclick=()=>void save(Math.min(600000,this.offset+500));value.onclick=()=>void save(0);this.element.append(earlier,value,later);
 }
}
