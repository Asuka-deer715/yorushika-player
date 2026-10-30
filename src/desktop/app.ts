import { PlaybackTransition } from './playback-transition.js';
import { LyricsView } from './lyrics-view.js';
import { PlaylistsView } from './playlists-view.js';
import type { CollectionApi } from '../shared/collection.js';
import { icon } from './icons.js';
import { Player } from './player.js';
import type { LibraryApi, MediaRecord, MediaKind } from '../shared/library.js';
declare global { interface Window { library: LibraryApi; collection: CollectionApi } }
const element = <T extends HTMLElement = HTMLElement>(id:string) => document.getElementById(id) as T;
const escape = (value:string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const player = new Player();
const playbackTransition = new PlaybackTransition();
const lyricsView=new LyricsView(window.collection,notify);
const playlistsView=new PlaylistsView(window.collection,notify,(item,queue)=>{void player.play(item,queue)});
let videoLayout='split';
let records:MediaRecord[]=[];
let route='home';
let query='';
let browseState={route:'home',query:'',scroll:0};
let noticeTimer:ReturnType<typeof setTimeout>;
const routes=[['home','home','乐队作品'],['library','music','本地音乐'],['videos','video','MV 与现场'],['playlists','folder','我的歌单'],['imports','import','导入与整理']];
const time=(value:number)=>Number.isFinite(value)?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'0:00';
function notify(message:string){element('notice').textContent=message;element('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>element('notice').hidden=true,6500)}
function open(next:string){
 if(next===route)return;
 const update=()=>{
  if(next==='now')browseState={route,query,scroll:document.querySelector('main')!.scrollTop};
  route=next;query='';render();document.querySelector('main')!.scrollTop=0;
 };
 if(next==='now')void playbackTransition.run('open',update);else update();
}
function closePlayer(){
 void playbackTransition.run('close',()=>{
  route=browseState.route;query=browseState.query;render();
  document.querySelector('main')!.scrollTop=browseState.scroll;element('open-player').focus();
 });
}

function rows(items:MediaRecord[]){return `<div class="media-list">${items.map((item,index)=>`<div class="track"><button data-play="${item.id}" aria-label="播放 ${escape(item.name)}" ${item.missing?'disabled':''}>${icon('play')}</button><button class="name" data-play="${item.id}" ${item.missing?'disabled':''}>${escape(item.name)}</button><small>${item.missing?'文件不可用':item.kind==='audio'?'本地音频':'本地视频'}</small><button data-relink="${item.id}" class="quiet">重新关联</button></div>`).join('')}</div>`}
function empty(kind:MediaKind){return `<div class="empty"><h3>${kind==='audio'?'把喜欢的声音留在这里':'把音乐的画面收进来'}</h3><p>${kind==='audio'?'导入你持有的本地音乐，随时翻阅、聆听。文件会保留在原来的位置。':'导入本地 MV 或现场视频，在完整播放页中观看。'}</p><button class="primary" data-import="${kind}">${kind==='audio'?'导入音乐':'导入视频'}</button></div>`}
function render(){
 document.body.classList.toggle('playback-page',route==='now');
 element('navigation').innerHTML=routes.map(([id,symbol,title])=>`<button data-route="${id}" ${route===id?'aria-current="page"':''}>${icon(symbol)}${title}</button>`).join('');
 element('breadcrumb').textContent=routes.find(item=>item[0]===route)?.[2]??(route==='now'?'正在播放':'设置');
 // 视频元素始终由播放器持有，页面重绘只移动挂载位置。
 element('media-host').append(player.video);
 const page=element('page');
 if(route==='home')page.innerHTML=`<section class="feature"><div><h1>让故事，<br>在旋律里继续。</h1><p>从一张唱片，到一段记忆。<br>在这里，慢慢听夜鹿。</p><button class="primary" data-route="library">打开我的音乐</button></div><figure><img src="../renderer/yorushika-official-album.jpeg" alt="だから僕は音楽を辞めた 专辑封面"><figcaption>だから僕は音楽を辞めた<br>ヨルシカ · 封面展示</figcaption></figure></section><div class="section-heading"><h2>我的收藏</h2><small>${records.filter(item=>item.kind==='audio').length} 首本地音乐</small></div>${records.some(item=>item.kind==='audio')?rows(records.filter(item=>item.kind==='audio').slice(0,6)):empty('audio')}`;
 else if(route==='library'||route==='videos'){const kind=route==='library'?'audio':'mv';const items=records.filter(item=>item.kind===kind&&item.name.toLowerCase().includes(query.toLowerCase()));page.innerHTML=`<div class="section-heading"><h1>${kind==='audio'?'本地音乐':'MV 与现场'}</h1><button class="primary" data-import="${kind}">导入${kind==='audio'?'音乐':'视频'}</button></div><input class="search" id="search" aria-label="搜索已导入文件" placeholder="搜索已导入文件" value="${escape(query)}"><div id="results">${items.length?rows(items):query?'<div class="empty"><p>没有找到匹配的文件，试试其他名称。</p></div>':empty(kind)}</div>`;}
 else if(route==='imports')page.innerHTML=`<h1>导入与整理</h1><p>建立文件关联，保留你的收藏原貌。</p><div class="actions"><button class="primary" data-import="audio">导入音乐</button><button class="secondary" data-import="mv">导入视频</button><button class="quiet" id="refresh">重新检查文件</button></div>${records.length?rows(records):'<div class="empty"><h3>收藏从第一首开始</h3><p>支持批量选择。同一路径不会重复导入；文件移动后，可以通过“重新关联”找回。</p></div>'}`;
 else if(route==='playlists'){page.innerHTML='<div id="playlists-page"></div>';void playlistsView.mount(element('playlists-page'),records);}
 else if(route==='settings')page.innerHTML=`<h1>设置</h1><p>让聆听更合你的习惯。</p><div class="setting"><span>界面字体<small>切换正文和标题的阅读风格</small></span><select id="font"><option value="sans">思源黑体</option><option value="serif">装甲明朝</option><option value="genryu">源流明体</option><option value="pearl">台湾圆体</option><option value="akazuki">あかずきんポップ</option></select></div><div class="setting"><span>单曲循环<small>重复播放当前音乐或视频</small></span><input type="checkbox" id="repeat" aria-label="单曲循环" ${player.audio.loop?'checked':''}></div><div class="setting"><span>本地收藏<small>导入记录自动保存，源文件保留原位置</small></span><button class="secondary" data-route="imports">管理文件</button></div>`;
 else if(route==='now'){const item=player.current;page.innerHTML=`<div class="section-heading"><h1>正在播放</h1><button class="quiet" id="close-player">返回浏览 · Esc</button></div>${item?`<section class="listening ${item.kind==='mv'&&videoLayout==='background'?'background-video':''}"><div id="visual" class="${item.kind==='audio'?'listening-art':''}">${item.kind==='audio'?'<img src="../renderer/yorushika-official-mark.svg" alt="夜鹿">':''}</div><div><h1>${escape(item.name)}</h1><p>${item.kind==='audio'?'本地音频':'本地视频'}</p><button class="primary" id="page-toggle">播放 / 暂停</button><div id="lyrics-panel"></div></div></section>`:empty('audio')}`;if(item){void lyricsView.mount(element('lyrics-panel'),item.id);if(item.kind==='mv'){element('visual').append(player.video);const layouts=document.createElement('button');layouts.className='quiet';layouts.textContent=videoLayout==='split'?'切换为背景视频':'切换为左右布局';layouts.onclick=()=>{videoLayout=videoLayout==='split'?'background':'split';render()};page.querySelector('.section-heading')!.append(layouts);}}}
 document.querySelectorAll<HTMLButtonElement>('[data-route]').forEach(button=>button.onclick=()=>open(button.dataset.route!));
 document.querySelectorAll<HTMLButtonElement>('[data-import]').forEach(button=>button.onclick=()=>void importFiles(button.dataset.import as MediaKind));
 bindRows();
 const search=document.getElementById('search') as HTMLInputElement|null;
 if(search)search.oninput=()=>{query=search.value;const kind=route==='library'?'audio':'mv';const items=records.filter(item=>item.kind===kind&&item.name.toLowerCase().includes(query.toLowerCase()));element('results').innerHTML=items.length?rows(items):'<p>没有找到匹配的文件。</p>';bindRows()};
 if(route==='imports')element('refresh').onclick=()=>void load();
 if(route==='now')element('close-player').onclick=closePlayer;
 if(route==='now'&&player.current)element('page-toggle').onclick=()=>player.toggle();
 if(route==='settings'){const font=element<HTMLSelectElement>('font');font.value=localStorage.getItem('desktop-font')??'sans';font.onchange=()=>{document.body.dataset.font=font.value;localStorage.setItem('desktop-font',font.value)};element<HTMLInputElement>('repeat').onchange=event=>{const repeat=(event.target as HTMLInputElement).checked;player.audio.loop=player.video.loop=repeat;localStorage.setItem('desktop-repeat',String(repeat))};}
}
function bindRows(){document.querySelectorAll<HTMLButtonElement>('[data-play]').forEach(button=>button.onclick=()=>{const item=records.find(item=>item.id===button.dataset.play)!;void player.play(item,records.filter(row=>row.kind===item.kind&&!row.missing));if(item.kind==='mv')open('now')});document.querySelectorAll<HTMLButtonElement>('[data-relink]').forEach(button=>button.onclick=async()=>{try{records=await window.library.relink(button.dataset.relink!);render()}catch(error){notify((error as Error).message)}})}
async function load(){try{records=await window.library.list();render()}catch(error){notify(`无法读取收藏：${(error as Error).message}`)}}
async function importFiles(kind:MediaKind){try{const result=await window.library.importFiles(kind);records=result.items;render();if(result.failures.length)notify(result.failures.map(item=>`${item.name}：${item.message}`).join('；'))}catch(error){notify((error as Error).message)}}
element('settings').innerHTML=icon('settings');element('settings').setAttribute('aria-label','设置');
element('previous').innerHTML=icon('previous');element('next').innerHTML=icon('next');element('toggle').innerHTML=icon('play');
element('previous').onclick=()=>player.next(-1);element('next').onclick=()=>player.next(1);element('toggle').onclick=()=>player.toggle();element('open-player').onclick=()=>open('now');element('settings').onclick=()=>open('settings');element('import-shortcut').onclick=()=>void importFiles('audio');
element<HTMLInputElement>('volume').oninput=event=>player.volume(Number((event.target as HTMLInputElement).value)/100);
element<HTMLInputElement>('seek').oninput=event=>player.seek(Number((event.target as HTMLInputElement).value)/1000);
player.addEventListener('failure',event=>notify((event as CustomEvent<string>).detail));
let displayedTrack:string|null=null;
player.addEventListener('change',()=>{if(displayedTrack!==player.current?.id){displayedTrack=player.current?.id??null;if(route==='now')render();}const media=player.media;lyricsView.update(media.currentTime);element('track-title').textContent=player.current?.name??'选择一首，开始聆听';element('track-description').textContent=player.current?.kind==='mv'?'本地视频':'本地音乐 · Yorushika';element('toggle').innerHTML=icon(media.paused?'play':'pause');element('elapsed').textContent=time(media.currentTime);element('duration').textContent=time(media.duration);element<HTMLInputElement>('seek').value=String(Number.isFinite(media.duration)&&media.duration>0?media.currentTime/media.duration*1000:0)});
document.body.dataset.font=localStorage.getItem('desktop-font')??'sans';player.audio.loop=player.video.loop=localStorage.getItem('desktop-repeat')==='true';render();void load();

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&route==='now'){event.preventDefault();closePlayer();}});
