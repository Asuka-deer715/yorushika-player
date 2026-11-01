import {mountSidebarToggle} from './shell/sidebar-toggle.js';
import {applySeekColors} from './playback/seek-colors.js';
import {mountVolumePopup} from './playback/volume-popup.js';
import {applySeekAppearance} from './playback/seek-appearance.js';
import {mountPlayerSpectrum} from './playback/player-spectrum.js';
import {mountBookmarks,mountBookmarkManager,type Bookmark} from './lyrics/bookmarks.js';
import {createDesktopLyricsToggle} from './lyrics/desktop-lyrics-toggle.js';
import {mountGallery} from './gallery/gallery-view.js';
import {localizedSongName} from '../shared/song-aliases.js';
import {applyAudioPrefix} from '../shared/media-name.js';
import {removeMediaDialog} from './components/remove-media-dialog.js';
import {playlistSongMenu} from './playlists/playlist-song-menu.js';
import {localizedMarkup} from './localization/i18n.js';
import {translateMarkup} from './localization/i18n.js';
import {t,formatText,translateStaticUI} from './localization/i18n.js';
import {showOnboarding} from './shell/onboarding.js';
import {mountStoryTimeline} from './story/story-timeline.js';
import {installPlaybackMode} from './playback/playback-mode.js';
import {createPlaybackMore} from './playback/playback-more.js';
import {mountHomeGallery} from './home/home-gallery.js';
import {renameDialog} from './components/rename-dialog.js';
import {applyLyricFonts} from './lyrics/lyric-font-settings.js';
import {installAuxiliarySync} from './shell/auxiliary-sync.js';
import {LyricOffsetControl} from './lyrics/lyric-offset-control.js';
import { installVideoFullscreen } from './video/video-fullscreen.js';
import {VideoSubtitles} from './video/video-subtitles.js';
import { installCloseDialog } from './shell/close-dialog.js';
import {VideosView} from './video/videos-view.js';
import { SettingsView } from './settings/settings-view.js';
import { matchingVideos } from './playback/mv-matching.js';
import { CatalogView } from './catalog/catalog-view.js';
import { onlineLyricsForm } from './lyrics/online-lyrics-view.js';
import { enhanceSelect } from './components/soft-select.js';
import { ThemeManager } from './settings/theme.js';
import { playIntro } from './shell/intro.js';
import { OnlineSourcesView } from './online/online-sources-view.js';
import type { OnlineSourcesApi } from '../shared/online-sources.js';
import { LyricsDisplay } from './lyrics/lyrics-display.js';
import { PlaybackTransition } from './playback/playback-transition.js';
import { LyricsView } from './lyrics/lyrics-view.js';
import { PlaylistsView } from './playlists/playlists-view.js';
import type { CollectionApi } from '../shared/collection.js';
import { icon } from './components/icons.js';
import { Player } from './playback/player.js';
import type { LibraryApi, MediaRecord, MediaKind } from '../shared/library.js';
declare global { interface Window { storySources:{open(url:string):Promise<void>;details():Promise<Record<string,string>|null>}; homeGallery:{get():Promise<import('./home/home-gallery.js').HomeGalleryState>;set(state:import('./home/home-gallery.js').HomeGalleryState):Promise<import('./home/home-gallery.js').HomeGalleryState>}; catalogCoverCache:{get(id:string):Promise<string>;save(id:string,url:string):Promise<string>}; auxWindows:{unlockLyrics():Promise<void>;open(kind:'mini'|'lyrics'):Promise<void>;close(kind:'mini'|'lyrics'):Promise<void>;publish(state:unknown):void;onAction(callback:(action:string)=>void):void;onRequest(callback:()=>void):void;onClosed(callback:(kind:string)=>void):void}; catalogSearch:{open(title:string,artist:string):Promise<void>;official():Promise<void>}; closeDialog:{onRequest(callback:()=>void):void;respond(mode:'tray'|'quit'|'cancel',remember:boolean):Promise<void>}; windowSettings:{getCloseBehavior():Promise<'ask'|'tray'|'quit'>;setCloseBehavior(mode:'ask'|'tray'|'quit'):Promise<void>}; appearance:{setIntro(active:boolean):Promise<void>;whenVisible():Promise<void>;setColors(background:string,foreground:string):Promise<void>}; sources: OnlineSourcesApi; library: LibraryApi; collection: CollectionApi } }
const element = <T extends HTMLElement = HTMLElement>(id:string) => document.getElementById(id) as T;
translateStaticUI(document.body);
mountSidebarToggle();
const escape = (value:string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const themes=new ThemeManager((bg,fg)=>window.appearance.setColors(bg,fg));
const player = new Player();
mountPlayerSpectrum(player,document.querySelector<HTMLElement>('.player')!);
const videoSubtitles=new VideoSubtitles(player,window.library,notify);
const catalogView=new CatalogView((item,queue)=>{if(item.kind==='mv'){mvOrigin=null;void player.play(item,queue);open('now');}else void player.play(item,queue);},window.collection);
const playbackTransition = new PlaybackTransition();
const lyricsView=new LyricsView(window.collection,notify);
const settingsView=new SettingsView(themes,player,lyricsView,()=>open('imports'));
const lyricsDisplay=new LyricsDisplay(window.collection,time=>{if(Number.isFinite(player.media.duration))player.media.currentTime=Math.min(time,player.media.duration)});
const playlistsView=new PlaylistsView(window.collection,notify,(item,queue)=>{void player.play(item,queue)});
const sourcesView=new OnlineSourcesView(window.sources,notify,()=>{player.audio.pause();player.video.pause();},()=>player.current?.id,window.collection);
let videoLayout='split';
let mvAudioOnly=false;
let mvOrigin:MediaRecord|null=null;
let mvOriginQueue:MediaRecord[]=[];
let records:MediaRecord[]=[];
function playBookmark(item:Bookmark){const media=records.find(row=>row.id===item.id&&!row.missing);if(!media){notify('找不到这首歌，请重新关联文件');return;}void player.play(media,records.filter(row=>row.kind===media.kind&&!row.missing),item.time??0);open('now');}

let route='home';
let importKind:MediaKind='audio';
let query='';
let browseState={route:'home',query:'',scroll:0};
let noticeTimer:ReturnType<typeof setTimeout>;
const videosView=new VideosView(window.library,(item,queue)=>{mvOrigin=null;void player.play(item,queue);open('now');},items=>{if(player.current?.kind==='mv'&&!items.some(item=>item.id===player.current?.id)){player.media.pause();player.current=null;player.queue=[];player.dispatchEvent(new Event('change'));}else player.queue=player.queue.filter(item=>items.some(record=>record.id===item.id));updateRecords(items);render();},notify,()=>void importFiles('mv'));
const routes=[['home','home','乐队作品'],['catalog','disc','专辑'],['story','book','故事时间线'],['gallery','gallery','画廊'],['videos','video','MV 与现场'],['playlists','folder','我的歌单'],['imports','import','导入与整理'],['online','music','在线链接']];
document.addEventListener('toggle',event=>{const menu=event.target;if(!(menu instanceof HTMLDetailsElement)||!menu.open||!menu.classList.contains('catalog-more'))return;document.querySelectorAll<HTMLDetailsElement>('details.catalog-more[open]').forEach(other=>{if(other!==menu&&!other.contains(menu)&&!menu.contains(other))other.open=false;});},true);
document.addEventListener('pointerdown',event=>{const target=event.target as Node;document.querySelectorAll<HTMLDetailsElement>('details.catalog-more[open]').forEach(menu=>{if(!menu.contains(target))menu.open=false;});});
function songDisplayName(name:string){let language=localStorage.getItem('song-title-language')??'ja';if(language==='interface')language=localStorage.getItem('desktop-language')??'zh';return localizedSongName(name,language==='zh-CN'?'zh':language as 'ja'|'en'|'zh');}
window.addEventListener('song-title-language-changed',()=>{render();if(player.current)element('track-title').textContent=songDisplayName(player.current.name);});
const time=(value:number)=>Number.isFinite(value)?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'0:00';
function notify(message:string,duration=6500){element('notice').textContent=message;element('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>element('notice').hidden=true,duration)}
let animateStoryOnRender=false;
function open(next:string){
 if(next===route){if(next==='story'){animateStoryOnRender=true;render();}return;}
 const update=()=>{
  if(next==='now')browseState={route,query,scroll:document.querySelector('main')!.scrollTop};
  route=next;animateStoryOnRender=next==='story';query='';render();document.querySelector('main')!.scrollTop=0;
 };
 if(next==='now')void playbackTransition.run('open',update);
 else {
  update();
  if(next==='home')animateHome();
  else if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const page=element('page');page.getAnimations().forEach(animation=>animation.cancel());
   page.animate([{opacity:.82,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
  }
 }
}
let homeEntrancePlayed=false;
function animateHome(){
 const mode=localStorage.getItem('home-entrance-mode')??'once';
 if(mode==='off'||(mode!=='always'&&homeEntrancePlayed)||route!=='home'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 homeEntrancePlayed=true;
 const elements=document.querySelectorAll<HTMLElement>('#page .feature h1,#page .feature p,#page .feature button,#page .feature figure,#page > .section-heading,#page > .empty,#page > .media-list');
 elements.forEach((el,index)=>el.animate([{opacity:0,filter:'blur(7px)',transform:'translateY(8px) scale(.99)'},{opacity:1,filter:'blur(0)',transform:'translateY(0) scale(1)'}],{duration:750,delay:Math.min(index*90,360),easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}));
}
function closePlayer(){
 void playbackTransition.run('close',()=>{
  route=browseState.route;query=browseState.query;render();
  document.querySelector('main')!.scrollTop=browseState.scroll;element('open-player').focus();
 });
}

function rows(items:MediaRecord[]){return localizedMarkup`<div class="media-list">${items.map((item,index)=>localizedMarkup`<div class="track"><button data-play="${item.id}" aria-label="播放 ${escape(item.name)}" ${item.missing?'disabled':''}>${icon('play')}</button><button class="name" data-play="${item.id}" ${item.missing?'disabled':''}>${escape(item.name)}</button><small>${item.missing?t('文件不可用'):item.kind==='audio'?t('本地音频'):mvAudioOnly?t('MV 音频'):t('本地视频')}</small>${route==='imports'?localizedMarkup`<details class="catalog-more"><summary>更多</summary><div class="catalog-more-panel"><button data-rename="${item.id}">重命名</button><button data-relink="${item.id}">重新关联</button><button data-remove-media="${item.id}">从播放器移除</button>${item.kind==='audio'?`<span data-song-menu="${item.id}"></span>`:''}</div></details>`:localizedMarkup`<button data-rename="${item.id}" class="quiet">重命名</button><button data-relink="${item.id}" class="quiet">重新关联</button>${item.kind==='audio'?`<span data-song-menu="${item.id}"></span>`:''}`}</div>`).join('')}</div>`}
function empty(kind:MediaKind){return localizedMarkup`<div class="empty"><h3>${kind==='audio'?t('把喜欢的声音留在这里'):t('把音乐的画面收进来')}</h3><p>${kind==='audio'?t('导入你持有的本地音乐，随时翻阅、聆听。文件会保留在原来的位置。'):t('导入本地 MV 或现场视频，在完整播放页中观看。')}</p><button class="primary" data-import="${kind}">${kind==='audio'?t('导入音乐'):t('导入视频')}</button>${kind==='audio'?localizedMarkup`<button class="quiet" data-import-folder>导入文件夹</button>`:''}</div>`}
function render(){
 document.body.classList.toggle('playback-page',route==='now');
 element('navigation').innerHTML=routes.map(([id,symbol,title])=>`<button data-route="${id}" ${route===id?'aria-current="page"':''}>${icon(symbol)}${t(title)}</button>`).join('');
 element('breadcrumb').textContent=route==='catalog'?t('专辑与作品'):t(routes.find(item=>item[0]===route)?.[2]??(route==='now'?'正在播放':route==='bookmarks'?'歌词书签':'设置'));element('breadcrumb').classList.toggle('catalog-breadcrumb',route==='catalog');
 // 视频元素始终由播放器持有，页面重绘只移动挂载位置。
 element('media-host').append(player.video);
 const page=element('page');
 if(route==='home')page.innerHTML=localizedMarkup`<section class="feature"><div><h1>让故事，<br>在旋律里继续。</h1><p>从一张唱片，到一段记忆。<br>在这里，慢慢听夜鹿。</p><button class="primary" data-route="imports" data-audio-source>打开我的音乐</button></div><figure><img src="../renderer/yorushika-official-album.jpeg" alt="だから僕は音楽を辞めた 专辑封面"><figcaption>だから僕は音楽を辞めた<br>ヨルシカ · 封面展示</figcaption></figure></section><div class="section-heading"><h2>我的收藏</h2><small>${records.filter(item=>item.kind==='audio').length} 首本地音乐</small></div>${records.some(item=>item.kind==='audio')?rows(records.filter(item=>item.kind==='audio').slice(0,6)):empty('audio')}`;
 else if(route==='story'){page.innerHTML='<div id="story-page"></div>';mountStoryTimeline(element('story-page'),id=>{catalogView.openRelease(id);open('catalog');},animateStoryOnRender);animateStoryOnRender=false;}
 else if(route==='gallery'){page.innerHTML='<div id="gallery-page"></div>';void mountGallery(element('gallery-page'));}
 else if(route==='catalog'){page.innerHTML='<div id="catalog-page"></div>';catalogView.mount(element('catalog-page'),records);}
 else if(route==='videos'){page.innerHTML='<div id="videos-page"></div>';videosView.mount(element('videos-page'),records);}

 else if(route==='online'){page.innerHTML=translateMarkup('<div id="online-sources"></div><section class="lyrics-settings"><h2>在线歌词与封面</h2><div id="online-lyrics"></div><div id="online-link-lyrics"></div></section>');void sourcesView.mount(element('online-sources'));const target=element('online-lyrics');if(player.current)target.append(onlineLyricsForm(window.collection,player.current.id,player.current.name,()=>notify(t('歌词已保存'))));else target.textContent=t('先播放一首本地音乐，再查找对应歌词。');void sourcesView.mount(element('online-link-lyrics'),true);}
 else if(route==='imports'){const allItems=records.filter(item=>item.kind===importKind);const items=allItems.filter(item=>item.name.toLowerCase().includes(query.toLowerCase()));page.innerHTML=localizedMarkup`<h1>导入与整理</h1><p>建立文件关联，保留你的收藏原貌。</p><div class="settings-tabs" aria-label="来源分类"><button type="button" data-import-category="audio" aria-pressed="${importKind==='audio'}">歌曲源</button><button type="button" data-import-category="mv" aria-pressed="${importKind==='mv'}">视频源</button></div><div class="section-heading"><h2>${importKind==='audio'?t('歌曲源'):t('视频源')}</h2><small>${formatText('{1} 个文件',allItems.length)}</small></div><div class="actions"><button class="primary" data-import="${importKind}">${importKind==='audio'?t('导入音乐'):t('导入视频')}</button>${importKind==='audio'?localizedMarkup`<button class="quiet" data-import-folder>导入文件夹</button>`:''}<button class="quiet" id="refresh">重新检查文件</button>${importKind==='audio'?localizedMarkup`<button class="quiet" id="import-prefix">歌曲前缀</button>`:''}</div><input class="search" id="search" aria-label="搜索已导入文件" placeholder="搜索已导入文件" value="${escape(query)}"><div id="results">${items.length?rows(items):query?localizedMarkup`<p>没有找到匹配的文件。</p>`:localizedMarkup`<div class="empty"><h3>${importKind==='audio'?t('还没有歌曲文件'):t('还没有视频文件')}</h3><p>导入后会在这里显示。文件保留原位置，移动后可重新关联。</p></div>`}</div>`;}
 else if(route==='playlists'){page.innerHTML='<div id="playlists-page"></div>';void playlistsView.mount(element('playlists-page'),records);}
 else if(route==='bookmarks'){mountBookmarkManager(page,playBookmark,()=>open('home'));}
 else if(route==='settings'){page.innerHTML='<div id="settings-page"></div>';settingsView.mount(element('settings-page'));}
 else if(route==='now'){const item=player.current;page.innerHTML=localizedMarkup`<div class="section-heading"><h1>正在播放</h1><button class="icon-button" id="close-player" aria-label="收起播放页，返回浏览" title="返回浏览（Esc）">${icon('down')}</button></div>${item?localizedMarkup`<section class="listening ${item.kind==='mv'&&!mvAudioOnly&&videoLayout==='background'?'background-video':''}"><div id="visual" class="${item.kind==='audio'||mvAudioOnly?'listening-art':''}">${item.kind==='audio'||mvAudioOnly?'<img src="../renderer/yorushika-official-mark.svg" alt="夜鹿">':''}</div><div><h1>${escape(item.kind==='audio'?songDisplayName(item.name):item.name)}</h1><p>${item.kind==='audio'?t('本地音频'):mvAudioOnly?t('MV 音频'):t('本地视频')}</p><div id="lyrics-panel"></div></div></section>`:empty('audio')}`;if(item){void updateCover();void lyricsDisplay.mount(element('lyrics-panel'),item.id,item.kind==='mv'?mvOrigin?.id:undefined,item.kind==='mv',item.name);if(item.kind==='mv'&&!mvAudioOnly){element('visual').append(player.video);const subtitlesHost=document.createElement('aside');subtitlesHost.className='video-subtitles-host';page.querySelector('.listening')!.append(subtitlesHost);videoSubtitles.mount(subtitlesHost);if(videoLayout==='background'){const info=page.querySelector('#visual + div')!;const title=info.querySelector('h1')!;const subtitle=info.querySelector('p')!;const centered=document.createElement('div');centered.className='background-track-title';centered.title=item.name;centered.append(title,subtitle);page.querySelector('.section-heading')!.append(centered);}const layouts=document.createElement('button');layouts.className='quiet';layouts.textContent=videoLayout==='split'?t('切换为背景视频'):t('切换为左右布局');layouts.onclick=()=>{videoLayout=videoLayout==='split'?'background':'split';render()};page.querySelector('.section-heading')!.append(layouts,installVideoFullscreen(page.querySelector<HTMLElement>('.listening')!,player.video,notify));}}}
 if(route==='home')void mountHomeGallery(page.querySelector('figure')!);
 document.querySelectorAll<HTMLButtonElement>('[data-route]').forEach(button=>button.onclick=()=>{if(button.hasAttribute('data-audio-source'))importKind='audio';open(button.dataset.route!);});
 document.querySelectorAll<HTMLButtonElement>('[data-import]').forEach(button=>button.onclick=()=>void importFiles(button.dataset.import as MediaKind));
 document.querySelectorAll<HTMLButtonElement>('[data-import-folder]').forEach(button=>button.onclick=()=>void importAudioFolder(button));
 bindRows();
 const search=document.getElementById('search') as HTMLInputElement|null;
 if(search)search.oninput=()=>{query=search.value;const kind=importKind;const items=records.filter(item=>item.kind===kind&&item.name.toLowerCase().includes(query.toLowerCase()));element('results').innerHTML=items.length?rows(items):localizedMarkup`<p>没有找到匹配的文件。</p>`;bindRows()};
 if(route==='imports'){element('refresh').onclick=()=>void load();const prefixButton=document.getElementById('import-prefix');if(prefixButton)prefixButton.onclick=()=>renameDialog(t('歌曲前缀'),localStorage.getItem('audio-import-prefix')??'ヨルシカ',async value=>{localStorage.setItem('audio-import-prefix',value);},true);page.querySelectorAll<HTMLButtonElement>('[data-import-category]').forEach(button=>button.onclick=()=>{importKind=button.dataset.importCategory as MediaKind;query='';render();});}
 if(route==='now')element('close-player').onclick=closePlayer;
 if(route==='now'){const button=document.createElement('button');button.className='icon-button playback-settings';button.innerHTML=icon('settings');button.title=t('歌词设置');button.setAttribute('aria-label',t('歌词设置'));button.onclick=()=>{settingsView.category='lyrics';open('settings');};page.append(button);}

}
function updateRecords(items:MediaRecord[]){records=items;if(player.current){const updated=items.find(item=>item.id===player.current!.id);if(updated)player.current.name=updated.name;}for(const item of player.queue){const updated=items.find(row=>row.id===item.id);if(updated)item.name=updated.name;}}
function bindRows(){document.querySelectorAll<HTMLButtonElement>('[data-remove-media]').forEach(button=>button.onclick=()=>{const item=records.find(row=>row.id===button.dataset.removeMedia)!;removeMediaDialog(item.name,async()=>{const items=await window.library.removeMedia(item.id);if(player.current?.id===item.id){player.media.pause();player.current=null;player.queue=[];player.dispatchEvent(new Event('change'));}else player.queue=player.queue.filter(row=>row.id!==item.id);updateRecords(items);render();});});document.querySelectorAll<HTMLElement>('[data-song-menu]').forEach(host=>{host.replaceChildren(playlistSongMenu(window.collection,host.dataset.songMenu!,notify,route==='imports'?'移动至列表':'更多'));});document.querySelectorAll<HTMLButtonElement>('[data-rename]').forEach(button=>button.onclick=()=>{const item=records.find(row=>row.id===button.dataset.rename)!;renameDialog('重命名'+(item.kind==='audio'?t('歌曲'):t('视频')),item.name,async name=>{updateRecords(await window.library.rename(item.id,item.kind==='audio'?applyAudioPrefix(name,localStorage.getItem('audio-import-prefix')??'ヨルシカ'):name));render();});});document.querySelectorAll<HTMLButtonElement>('[data-play]').forEach(button=>button.onclick=()=>{const item=records.find(item=>item.id===button.dataset.play)!;if(item.kind==='mv')mvOrigin=null;void player.play(item,records.filter(row=>row.kind===item.kind&&!row.missing));if(item.kind==='mv')open('now')});document.querySelectorAll<HTMLButtonElement>('[data-relink]').forEach(button=>button.onclick=async()=>{try{records=await window.library.relink(button.dataset.relink!);render()}catch(error){notify((error as Error).message)}})}
async function load(){try{records=await window.library.list();if(!player.current){const saved=localStorage.getItem('playback-session');if(saved){try{const session=JSON.parse(saved);const item=records.find(row=>row.id===session.id&&!row.missing);const queue=(Array.isArray(session.queue)?session.queue:[]).map((id:string)=>records.find(row=>row.id===id&&!row.missing)).filter(Boolean) as MediaRecord[];if(item)player.restore(item,queue.length?queue:[item],Number.isFinite(session.position)?Math.max(0,session.position):0);}catch{localStorage.removeItem('playback-session');}}}render()}catch(error){notify(formatText("无法读取收藏：{1}",(error as Error).message))}}
const metadataInFlight=new Set<string>();const playbackMetadataAttempted=new Set<string>();
async function autoFindMetadata(ids:string[],announce=true){let lyrics=0,cover=0;for(const id of ids){if(metadataInFlight.has(id))continue;metadataInFlight.add(id);try{const result=await window.collection.autoMetadata(id);if(result.lyrics)lyrics++;if(result.cover)cover++;if(result.cover)window.dispatchEvent(new CustomEvent('cover-changed',{detail:id}));if(result.lyrics){window.dispatchEvent(new Event('lyrics-updated'));if(route==='now'&&player.current?.id===id)void lyricsDisplay.mount(element('lyrics-panel'),id);}}catch(error){console.warn('自动查找失败',error);}finally{metadataInFlight.delete(id);}}if(announce)notify(formatText("自动查找完成：{1} 首歌词、{2} 张封面；未匹配的可在在线链接手动查找。",lyrics,cover),6000);}
async function importAudioFolder(button:HTMLButtonElement){
 button.disabled=true;const originalLabel=button.textContent;button.textContent=t('正在扫描…');
 try{
  const result=await window.library.importAudioFolder(localStorage.getItem('audio-import-prefix')??'ヨルシカ');if(!result)return;
  records=result.items;render();if(result.importedIds?.length)void autoFindMetadata(result.importedIds,false);
  const scan=result.scan!;const summary=formatText('扫描到 {1} 首，导入 {2} 首，跳过 {3} 首已导入。',scan.found,result.importedIds?.length??0,scan.duplicates);
  const failures=result.failures.length?formatText('另有 {1} 项未能读取：{2}',result.failures.length,result.failures.slice(0,3).map(item=>item.name).join('、')):'';
  notify(summary+(failures?' '+failures:'')+(result.importedIds?.length?' '+t('正在后台查找歌词与封面。'):''),8000);
 }catch(error){notify(t('导入失败：')+(error as Error).message.replace(/^Error invoking remote method '[^']+': Error: /,''));}
 finally{button.disabled=false;button.textContent=originalLabel;}
}
async function importFiles(kind:MediaKind){try{const result=await window.library.importFiles(kind,localStorage.getItem('audio-import-prefix')??'ヨルシカ');records=result.items;render();if(kind==='audio'&&result.importedIds?.length)void autoFindMetadata(result.importedIds);if(result.cache){const summary=formatText("找到 {1} 组缓存，成功导入 {2} 个视频，可在“MV 与现场”查看。",result.cache.found,result.cache.converted);notify(result.failures.length?summary+' '+result.failures.map(item=>`${item.name}：${item.message}`).join('；'):summary);}else if(result.failures.length)notify(result.failures.map(item=>`${item.name}：${item.message}`).join('；'))}catch(error){notify('导入失败：'+(error as Error).message.replace(/^Error invoking remote method '[^']+': Error: /,''))}}
const lyricOffsetControl=new LyricOffsetControl(window.collection,offset=>lyricsDisplay.setOffset(offset),notify);
const mvButton=document.createElement('button');mvButton.className='quiet';mvButton.textContent='MV';mvButton.title=t('选择本地 MV');mvButton.setAttribute('aria-label',t('选择本地 MV'));mvButton.setAttribute('aria-expanded','false');const mvPanel=document.createElement('div');mvPanel.className='current-queue mv-picker';mvPanel.hidden=true;document.body.append(mvPanel);document.querySelector('.volume')!.before(mvButton,lyricOffsetControl.element,createDesktopLyricsToggle());
async function showMvChoices(){
 const current=player.current;const linkedAudio=current?.kind==='mv'&&!mvOrigin?await window.collection.audioForVideo(current.id):null;const audio=current?.kind==='audio'?current:(mvOrigin??records.find(item=>item.id===linkedAudio)??null);mvPanel.replaceChildren();
 const heading=document.createElement('strong');heading.textContent=t('本地 MV');mvPanel.append(heading);
 const line=(message:string)=>{mvPanel.hidden=true;mvButton.setAttribute('aria-expanded','false');notify(message,1500);};
 if(!audio){line(t('请先播放一首本地音频，再选择关联视频。'));return;}
 if(current?.kind==='mv'){const back=document.createElement('button');back.textContent=t('切回音频（保留进度）');back.onclick=()=>{const position=player.media.currentTime;void player.play(audio,mvOriginQueue.length?mvOriginQueue:records.filter(item=>item.kind==='audio'&&!item.missing),position);mvOrigin=null;mvPanel.hidden=true;mvButton.setAttribute('aria-expanded','false');open('now');};mvPanel.append(back);}
 const linked=await window.collection.videos(audio.id);if(!mvPanel.isConnected||mvPanel.hidden)return;
 const videos=records.filter(item=>item.kind==='mv'&&!item.missing);if(!videos.length){line(t('还没有本地视频，请先到“MV 与现场”导入。'));return;}
 const suggested=new Set(matchingVideos(audio.name,videos).map(item=>item.id));const candidates=videos.filter(v=>linked.includes(v.id)||suggested.has(v.id));
 const preferred=videos.filter(v=>linked.includes(v.id));const choices=preferred.length?preferred:candidates;
 const playVideo=async(video:MediaRecord)=>{try{await window.collection.linkVideo(audio.id,video.id);if(current?.kind==='audio'){mvOrigin=audio;mvOriginQueue=player.queue.slice();}mvPanel.hidden=true;mvButton.setAttribute('aria-expanded','false');void player.play(video,[video]);open('now');}catch(error){line((error as Error).message)}};
 if(current?.kind==='audio'&&choices.length===1){await playVideo(choices[0]);return;}
 if(current?.kind==='audio'&&!choices.length){line(t('没有找到与当前歌曲匹配的 MV'));return;}
 const makeRow=(video:MediaRecord,container:HTMLElement)=>{const row=document.createElement('div');const play=document.createElement('button');play.textContent=(linked.includes(video.id)?t('已关联 · '):suggested.has(video.id)?t('名称相符 · '):t('手动关联 · '))+video.name;play.onclick=()=>void playVideo(video);row.append(play);if(linked.includes(video.id)){const remove=document.createElement('button');remove.className='quiet';remove.textContent=t('取消关联');remove.onclick=async()=>{await window.collection.unlinkVideo(audio.id,video.id);void showMvChoices();};row.append(remove);}container.append(row);};
 if(!candidates.length){const p=document.createElement('p');p.textContent=t('没有找到名称相符的 MV。');mvPanel.append(p);}else for(const video of candidates)makeRow(video,mvPanel);
 const others=videos.filter(v=>!linked.includes(v.id)&&!suggested.has(v.id));if(others.length){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=t('手动选择其他视频');details.append(summary);const hint=document.createElement('p');hint.textContent=t('请选择当前歌曲对应的视频，点击后将保存关联。');details.append(hint);for(const video of others)makeRow(video,details);mvPanel.append(details);}

}
let mvDismiss:ReturnType<typeof setTimeout>|undefined;
const closeMv=()=>{clearTimeout(mvDismiss);mvPanel.hidden=true;mvButton.setAttribute('aria-expanded','false');};
const scheduleMvClose=()=>{clearTimeout(mvDismiss);mvDismiss=setTimeout(()=>{if(!mvPanel.matches(':hover')&&!mvButton.matches(':hover'))closeMv();},1000);};
for(const target of [mvButton,mvPanel]){target.addEventListener('pointerleave',scheduleMvClose);target.addEventListener('pointerenter',()=>clearTimeout(mvDismiss));}
mvButton.onclick=()=>{if(player.current?.kind==='mv'){closeMv();mvAudioOnly=!mvAudioOnly;mvButton.textContent=mvAudioOnly?'MV':t('切音频');mvButton.title=mvAudioOnly?t('恢复 MV 画面'):t('切换为音频画面');mvButton.setAttribute('aria-label',mvButton.title);if(route==='now')render();return;}clearTimeout(mvDismiss);mvPanel.hidden=!mvPanel.hidden;mvButton.setAttribute('aria-expanded',String(!mvPanel.hidden));if(!mvPanel.hidden)void showMvChoices();};
const playbackMore=createPlaybackMore(player,window.collection,()=>mvOrigin?.id,notify);document.querySelector('.volume')!.before(playbackMore);
const queueButton=document.createElement('button');queueButton.className='quiet';queueButton.textContent=t('播放列表');queueButton.setAttribute('aria-expanded','false');queueButton.setAttribute('aria-controls','current-queue');const queuePanel=document.createElement('div');queuePanel.id='current-queue';queuePanel.className='current-queue';queuePanel.hidden=true;document.body.append(queuePanel);document.querySelector('.volume')!.before(queueButton);
function renderQueue(){queuePanel.replaceChildren();const heading=document.createElement('strong');heading.textContent=t('播放列表');queuePanel.append(heading);if(!player.queue.length){const empty=document.createElement('p');empty.textContent=t('还没有播放的歌曲');queuePanel.append(empty);}for(const item of player.queue){const button=document.createElement('button');button.type='button';button.textContent=item.name;button.setAttribute('aria-current',String(item.id===player.current?.id));button.onclick=()=>{void player.play(item,player.queue);renderQueue();};queuePanel.append(button);}}
let queueDismiss:ReturnType<typeof setTimeout>|undefined;
function closeQueue(){clearTimeout(queueDismiss);queuePanel.hidden=true;queueButton.setAttribute('aria-expanded','false');}
function scheduleQueueClose(){clearTimeout(queueDismiss);queueDismiss=setTimeout(()=>{if(!queuePanel.matches(':hover')&&!queueButton.matches(':hover'))closeQueue();},1000);}
queuePanel.addEventListener('pointerleave',scheduleQueueClose);queueButton.addEventListener('pointerleave',scheduleQueueClose);queuePanel.addEventListener('pointerenter',()=>clearTimeout(queueDismiss));queueButton.addEventListener('pointerenter',()=>clearTimeout(queueDismiss));queuePanel.addEventListener('focusout',()=>setTimeout(()=>{if(!queuePanel.contains(document.activeElement)&&document.activeElement!==queueButton&&!queuePanel.matches(':hover')&&!queueButton.matches(':hover'))scheduleQueueClose();},0));
queueButton.onclick=()=>{clearTimeout(queueDismiss);queuePanel.hidden=!queuePanel.hidden;queueButton.setAttribute('aria-expanded',String(!queuePanel.hidden));if(!queuePanel.hidden)renderQueue();};let queueTrack:string|undefined;player.addEventListener('change',()=>{if(!queuePanel.hidden&&queueTrack!==player.current?.id){queueTrack=player.current?.id;renderQueue();}});
const titleSearch=element('title-search');const searchToggle=element<HTMLButtonElement>('search-toggle');const titleField=element<HTMLInputElement>('title-search-field');const searchClose=element<HTMLButtonElement>('search-close');const titleResults=element('title-search-results');
function closeTitleSearch(){titleSearch.dataset.open='false';searchToggle.setAttribute('aria-expanded','false');titleField.disabled=searchClose.disabled=true;titleResults.hidden=true;titleField.value='';}
searchToggle.onclick=()=>{if(titleSearch.dataset.open==='true'){closeTitleSearch();searchToggle.focus();return;}titleSearch.dataset.open='true';searchToggle.setAttribute('aria-expanded','true');titleField.disabled=searchClose.disabled=false;titleField.focus();};searchClose.onclick=()=>{closeTitleSearch();searchToggle.focus();};
titleField.oninput=()=>{const term=titleField.value.normalize('NFKC').trim().toLocaleLowerCase();titleResults.replaceChildren();titleResults.hidden=!term;if(!term)return;const matches=records.filter(item=>item.kind==='audio'&&item.name.normalize('NFKC').toLocaleLowerCase().includes(term));if(!matches.length){const empty=document.createElement('p');empty.textContent=t('没有找到本地歌曲');titleResults.append(empty);}for(const item of matches.slice(0,30)){const button=document.createElement('button');button.textContent=item.name;button.disabled=item.missing;button.onclick=()=>{void player.play(item,records.filter(row=>row.kind==='audio'&&!row.missing));closeTitleSearch();};titleResults.append(button);}};
titleSearch.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeTitleSearch();searchToggle.focus();}});document.addEventListener('pointerdown',event=>{if(!titleSearch.contains(event.target as Node))closeTitleSearch();});
element('settings').innerHTML=icon('settings');element('settings').setAttribute('aria-label',t('设置'));
installPlaybackMode(player);element('previous').innerHTML=icon('previous');element('next').innerHTML=icon('next');element('toggle').innerHTML=icon('play');
element('previous').onclick=()=>player.next(-1);element('next').onclick=()=>player.next(1);element('toggle').onclick=()=>player.toggle();element('open-player').onclick=()=>open('now');element('settings').onclick=()=>open('settings');element('mini-mode').onclick=()=>{void window.auxWindows.open('mini')};mountBookmarks(document.querySelector<HTMLElement>('.sidebar-bottom')!,()=>open('bookmarks'));
mvButton.before(document.querySelector<HTMLElement>('.volume')!);
mountVolumePopup(document.querySelector<HTMLElement>('.volume')!);applySeekAppearance();applySeekColors();
const volumeInput=element<HTMLInputElement>('volume');const volumeToggle=element<HTMLButtonElement>('volume-toggle');let savedVolume=Number(volumeInput.value)||75;
function updateVolume(value:number){player.volume(value/100);volumeInput.value=String(value);element('volume-value').textContent=value+'%';volumeToggle.innerHTML=icon(value===0?'mute':'volume');element('volume-open').innerHTML=icon(value===0?'mute':'volume');volumeToggle.setAttribute('aria-label',value===0?t('恢复音量'):t('静音'));volumeToggle.title=value===0?t('恢复音量'):t('静音');}
volumeInput.oninput=()=>{const value=Number(volumeInput.value);if(value>0)savedVolume=value;updateVolume(value);};volumeToggle.onclick=()=>{const value=Number(volumeInput.value);if(value>0){savedVolume=value;updateVolume(0);}else updateVolume(savedVolume);};updateVolume(savedVolume);
element<HTMLInputElement>('seek').oninput=event=>{const seek=event.target as HTMLInputElement;seek.style.setProperty('--seek-progress',Number(seek.value)/10+'%');player.seek(Number(seek.value)/1000);};
for(const media of [player.audio,player.video])media.addEventListener('play',()=>document.querySelector('.online-video')?.replaceChildren());
async function updateCover(){const id=player.current?.id;const mini=document.querySelector<HTMLImageElement>('.mini-art img')!;const art=document.querySelector<HTMLImageElement>('.listening-art img');const fallback='../renderer/yorushika-official-mark.svg';if(!id){mini.src=fallback;return;}let url=await window.collection.cover(id);if(!url&&player.current?.kind==='mv'){const audio=mvOrigin?.id??await window.collection.audioForVideo(id);if(audio)url=await window.collection.cover(audio);}if(player.current?.id!==id)return;for(const img of [mini,art])if(img){img.onerror=()=>{img.onerror=null;img.src=fallback;img.classList.remove('cover-image');};img.src=url||fallback;img.classList.toggle('cover-image',!!url);}}
window.addEventListener('cover-changed',()=>void updateCover());
let lastSessionSave=0;
function saveSession(){if(player.current&&!player.restoring)localStorage.setItem('playback-session',JSON.stringify({id:player.current.id,queue:player.queue.map(item=>item.id),position:Number.isFinite(player.media.currentTime)?player.media.currentTime:0}));}
window.addEventListener('beforeunload',saveSession);
player.addEventListener('failure',event=>notify((event as CustomEvent<string>).detail));
let displayedTrack:string|null=null;
player.addEventListener('change',()=>{lyricOffsetControl.sync(player.current?.kind==='mv'?player.current.id:null);if(player.current&&(Date.now()-lastSessionSave>1500||displayedTrack!==player.current.id)){saveSession();lastSessionSave=Date.now();}if(displayedTrack!==player.current?.id){mvAudioOnly=false;mvButton.textContent=player.current?.kind==='mv'?t('切音频'):'MV';mvButton.title=player.current?.kind==='mv'?t('切换为音频画面'):t('选择本地 MV');mvButton.setAttribute('aria-label',mvButton.title);displayedTrack=player.current?.id??null;if(player.current?.kind==='audio'&&!playbackMetadataAttempted.has(player.current.id)){playbackMetadataAttempted.add(player.current.id);void autoFindMetadata([player.current.id],false);}if(route==='now'||route==='settings'||route==='online')render();void updateCover();}const media=player.media;lyricsDisplay.update(media.currentTime);element('track-title').textContent=player.current?(player.current.kind==='audio'?songDisplayName(player.current.name):player.current.name):'选择一首，开始聆听';element('track-description').textContent=player.current?.kind==='mv'?t('本地视频'):t('本地音乐 · Yorushika');element('toggle').innerHTML=icon(media.paused?'play':'pause');element('elapsed').textContent=time(media.currentTime);element('duration').textContent=time(media.duration);element<HTMLInputElement>('seek').value=String(Number.isFinite(media.duration)&&media.duration>0?media.currentTime/media.duration*1000:0);element<HTMLInputElement>('seek').style.setProperty('--seek-progress',Number(element<HTMLInputElement>('seek').value)/10+'%')});
applyLyricFonts();document.documentElement.lang=localStorage.getItem('desktop-language')??'zh-CN';document.body.dataset.font=localStorage.getItem('desktop-font')??'sans';render();void load();

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.fullscreenElement){event.preventDefault();void document.exitFullscreen();}else if(event.key==='Escape'&&route==='now'){event.preventDefault();closePlayer();}});

void window.appearance.whenVisible().then(()=>playIntro()).then(played=>{if(played&&route==='home')homeEntrancePlayed=true;else animateHome();if(localStorage.getItem('onboarding-complete')!=='true')showOnboarding();});

installCloseDialog();
installAuxiliarySync(player,window.collection,()=>mvOrigin?.id);
