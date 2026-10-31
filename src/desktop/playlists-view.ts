import { enhanceSelect } from './soft-select.js';
import type { CollectionApi, Playlist } from '../shared/collection.js';
import type { MediaRecord } from '../shared/library.js';
export class PlaylistsView {
 private playlists:Playlist[]=[];
 private active='';
 constructor(private api:CollectionApi,private report:(message:string)=>void,private play:(item:MediaRecord,queue:MediaRecord[])=>void){}
 async mount(container:HTMLElement,records:MediaRecord[]){try{this.playlists=await this.api.playlists();if(container.isConnected)this.render(container,records);}catch(error){this.report((error as Error).message)}}
 private render(container:HTMLElement,records:MediaRecord[]){
  container.replaceChildren();const heading=document.createElement('h1');heading.textContent='我的歌单';container.append(heading);
  const form=document.createElement('form');form.className='actions';const input=document.createElement('input');input.className='search';input.placeholder='新歌单名称';input.setAttribute('aria-label','新歌单名称');input.required=true;input.maxLength=80;const create=document.createElement('button');create.textContent='创建歌单';create.className='primary';form.append(input,create);form.onsubmit=async event=>{event.preventDefault();try{this.playlists=await this.api.createPlaylist(input.value);this.active=this.playlists.at(-1)!.id;this.render(container,records)}catch(error){this.report((error as Error).message)}};container.append(form);
  if(!this.playlists.length){const hint=document.createElement('p');hint.textContent='创建歌单后，勾选多首音乐一次加入。同一首音乐可以放进多个歌单。';container.append(hint);return;}
  const select=document.createElement('select');select.className='search';select.setAttribute('aria-label','选择歌单');for(const playlist of this.playlists){const option=document.createElement('option');option.value=playlist.id;option.textContent=playlist.name;select.append(option);}if(!this.playlists.some(p=>p.id===this.active))this.active=this.playlists[0].id;select.value=this.active;select.onchange=()=>{this.active=select.value;this.render(container,records)};container.append(select);enhanceSelect(select);
  const playlist=this.playlists.find(p=>p.id===this.active)!;const queue=playlist.mediaIds.map(id=>records.find(record=>record.id===id)).filter((record):record is MediaRecord=>!!record&&!record.missing);
  const actions=document.createElement('div');actions.className='actions';const play=document.createElement('button');play.className='primary';play.textContent='顺序播放';play.disabled=!queue.length;play.onclick=()=>this.play(queue[0],queue);actions.append(play);container.append(actions);
  const selected=new Set<string>();const add=document.createElement('button');add.className='secondary';add.textContent='加入歌单';add.disabled=true;const remove=document.createElement('button');remove.className='secondary';remove.textContent='移出歌单';remove.disabled=true;actions.append(add,remove);
  const run=async(operation:'addToPlaylist'|'removeFromPlaylist')=>{try{this.playlists=await this.api[operation](this.active,[...selected]);this.render(container,records);}catch(error){this.report((error as Error).message)}};add.onclick=()=>void run('addToPlaylist');remove.onclick=()=>void run('removeFromPlaylist');
  const note=document.createElement('p');note.textContent='勾选本地音乐，批量加入或移出当前歌单。重复加入不会产生重复条目。';container.append(note);
  for(const record of records.filter(r=>r.kind==='audio')){const row=document.createElement('label');row.className='playlist-row';const check=document.createElement('input');check.type='checkbox';check.onchange=()=>{if(check.checked)selected.add(record.id);else selected.delete(record.id);add.disabled=remove.disabled=!selected.size};const name=document.createElement('span');name.textContent=record.name;const status=document.createElement('small');status.textContent=playlist.mediaIds.includes(record.id)?'已在歌单中':'未加入';row.append(check,name,status);container.append(row);}
 }
}
