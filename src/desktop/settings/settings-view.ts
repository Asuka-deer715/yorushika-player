import {setDesktopLyrics} from '../lyrics/desktop-lyrics-toggle.js';
import {translateMarkup} from '../localization/i18n.js';
import {t} from '../localization/i18n.js';
import {showOnboarding} from '../shell/onboarding.js';
import {mountHomeGallerySettings} from '../home/home-gallery.js';
import {mountLyricFontSettings} from '../lyrics/lyric-font-settings.js';
import {enhanceSelect} from '../components/soft-select.js';
import {mountIntroSettings} from './intro-settings.js';
import {mountThemeSettings} from './theme-settings.js';
import type {ThemeManager} from './theme.js';
import type {LyricsView} from '../lyrics/lyrics-view.js';
import {playbackModes,type Player,type PlaybackMode} from '../playback/player.js';
export type SettingsCategory='general'|'appearance'|'animation'|'playback'|'lyrics'|'collection';
export class SettingsView {
 category:SettingsCategory='appearance';
 constructor(private themes:ThemeManager,private player:Player,private lyrics:LyricsView,private openImports:()=>void){}
 mount(host:HTMLElement){
  host.innerHTML=translateMarkup('<h1>设置</h1><div class="settings-tabs" aria-label="设置分类"></div><div class="settings-content"></div>');
  const tabs=host.querySelector<HTMLElement>('.settings-tabs')!;const panel=host.querySelector<HTMLElement>('.settings-content')!;
  const categories:[SettingsCategory,string][]=[['general','常规'],['appearance','外观'],['animation','动画'],['playback','播放'],['lyrics','歌词'],['collection','收藏与导入']];
  const render=()=>{
   tabs.replaceChildren();for(const [id,label] of categories){const button=document.createElement('button');button.type='button';button.textContent=t(label);button.setAttribute('aria-pressed',String(this.category===id));button.onclick=()=>{this.category=id;render();};tabs.append(button);}
   panel.replaceChildren();
   if(this.category==='general'){
    panel.innerHTML=translateMarkup('<h2>常规</h2><div class="setting"><span>关闭窗口时<small>隐藏到托盘后，播放会继续；也可以通过托盘菜单退出。</small></span><select aria-label="关闭窗口时"><option value="ask">每次询问</option><option value="tray">隐藏到托盘</option><option value="quit">退出播放器</option></select></div><p class="close-setting-status" role="status"></p>');
    const guide=document.createElement('div');guide.className='setting';guide.innerHTML=translateMarkup('<span>新手引导<small>再次查看导入、播放和设置的基本操作。</small></span><button class="quiet">重新查看</button>');guide.querySelector('button')!.onclick=showOnboarding;panel.append(guide);const language=document.createElement('div');language.className='setting';language.innerHTML=translateMarkup('<span>界面语言 / 言語 / Language<small>语言支持正在完善，部分页面仍显示中文。</small></span><select aria-label="界面语言 / 言語 / Language"><option value="zh-CN">简体中文</option><option value="ja">日本語</option><option value="en">English</option></select>');panel.prepend(language);
    const languageSelect=language.querySelector('select')!;languageSelect.value=localStorage.getItem('desktop-language')??'zh-CN';languageSelect.onchange=()=>{localStorage.setItem('desktop-language',languageSelect.value);document.documentElement.lang=languageSelect.value;location.reload();};enhanceSelect(languageSelect);
    const songLanguage=document.createElement('div');songLanguage.className='setting';songLanguage.innerHTML=translateMarkup('<span>歌曲标题语言<small>默认优先显示日文；没有可靠译名时保留原名。</small></span><select aria-label="歌曲标题语言"><option value="ja">日语</option><option value="zh">中文</option><option value="en">英语</option><option value="interface">跟随界面语言</option></select>');panel.append(songLanguage);const songSelect=songLanguage.querySelector('select')!;songSelect.value=localStorage.getItem('song-title-language')??'ja';songSelect.onchange=()=>{localStorage.setItem('song-title-language',songSelect.value);window.dispatchEvent(new Event('song-title-language-changed'));};enhanceSelect(songSelect);
    const select=panel.querySelector<HTMLSelectElement>('.setting:not(:first-of-type) select')!;select.disabled=true;
    void window.windowSettings.getCloseBehavior().then(mode=>{if(!select.isConnected)return;select.value=mode;select.disabled=false;enhanceSelect(select);}).catch(()=>{panel.querySelector('.close-setting-status')!.textContent=t('无法读取关闭行为设置');});
    select.onchange=()=>{const mode=select.value as 'ask'|'tray'|'quit';void window.windowSettings.setCloseBehavior(mode).catch(()=>{panel.querySelector('.close-setting-status')!.textContent=t('保存失败，请重试');});};
   }else if(this.category==='appearance'){
    const title=document.createElement('h2');title.textContent=t('外观');panel.append(title);
    const theme=document.createElement('section');panel.append(theme);mountThemeSettings(theme,this.themes);
    const homeCover=document.createElement('section');panel.append(homeCover);void mountHomeGallerySettings(homeCover);
    const font=document.createElement('div');font.className='setting';font.innerHTML=translateMarkup('<span>界面字体<small>切换正文和标题的阅读风格</small></span><select id="font" aria-label="界面字体"><option value="sans">思源黑体</option><option value="serif">装甲明朝</option><option value="genryu">源流明体</option><option value="pearl">台湾圆体</option><option value="akazuki">あかずきんポップ</option></select>');panel.append(font);
    const select=font.querySelector('select')!;select.value=localStorage.getItem('desktop-font')??'sans';select.onchange=()=>{document.body.dataset.font=select.value;localStorage.setItem('desktop-font',select.value)};enhanceSelect(select);
   }else if(this.category==='animation'){
    const title=document.createElement('h2');title.textContent=t('动画');panel.append(title);
    const motion=document.createElement('div');motion.className='setting';motion.innerHTML=translateMarkup('<span>主页水晕入场<small>选择何时展示；遵循系统减少动态效果设置</small></span><select aria-label="主页水晕入场"><option value="once">每次启动首次进入</option><option value="always">每次进入主页</option><option value="off">关闭</option></select>');panel.append(motion);const mode=motion.querySelector('select')!;mode.value=localStorage.getItem('home-entrance-mode')??'once';mode.onchange=()=>localStorage.setItem('home-entrance-mode',mode.value);enhanceSelect(mode);
    const intro=document.createElement('section');intro.className='settings-intro';panel.append(intro);mountIntroSettings(intro);
    const story=document.createElement('div');story.className='setting';story.innerHTML=translateMarkup('<span>跳过故事时间线动画<small>开启后进入时间线时直接显示全部内容。</small></span><input type="checkbox" aria-label="跳过故事时间线动画">');panel.append(story);const skip=story.querySelector<HTMLInputElement>('input')!;skip.checked=localStorage.getItem('story-animation-skip')==='true';skip.onchange=()=>localStorage.setItem('story-animation-skip',String(skip.checked));
   }else if(this.category==='playback'){
    panel.innerHTML=translateMarkup('<h2>播放</h2><div class="setting"><span>播放模式<small>与播放栏同步；顺序播放在列表末尾停止。</small></span><div class="playback-mode-setting"></div></div>');const holder=panel.querySelector<HTMLElement>('.playback-mode-setting')!;const update=()=>{if(!holder.isConnected){this.player.removeEventListener('modechange',update);return;}holder.replaceChildren();const select=document.createElement('select');select.setAttribute('aria-label',t('播放模式'));for(const [id,label] of playbackModes){const option=document.createElement('option');option.value=id;option.textContent=t(label);select.append(option);}select.value=this.player.mode;select.onchange=()=>this.player.setMode(select.value as PlaybackMode);holder.append(select);enhanceSelect(select);};this.player.addEventListener('modechange',update);update();
   }else if(this.category==='lyrics'){
    const section=document.createElement('section');section.className='lyrics-settings';const heading=document.createElement('h2');heading.textContent=t('歌词');section.append(heading);mountLyricFontSettings(section);const desktop=document.createElement('div');desktop.className='setting';desktop.innerHTML=translateMarkup('<span>桌面歌词<small>在桌面浮窗显示当前歌词，可拖动位置。</small></span><input type="checkbox" aria-label="桌面歌词">');section.append(desktop);const unlock=document.createElement('button');unlock.className='quiet';unlock.textContent=t('解锁桌面歌词');unlock.onclick=()=>{void window.auxWindows.unlockLyrics();};section.append(unlock);const toggle=desktop.querySelector<HTMLInputElement>('input')!;toggle.checked=localStorage.getItem('desktop-lyrics')==='true';toggle.onchange=()=>{void setDesktopLyrics(toggle.checked);};const syncDesktopLyrics=()=>{if(!toggle.isConnected){window.removeEventListener('desktop-lyrics-changed',syncDesktopLyrics);return;}toggle.checked=localStorage.getItem('desktop-lyrics')==='true';};window.addEventListener('desktop-lyrics-changed',syncDesktopLyrics);const context=document.createElement('p');context.textContent=this.player.current?'当前版本：'+this.player.current.name:t('播放一首音乐后，可为该版本导入和校准歌词。');section.append(context);const lyricsPanel=document.createElement('div');section.append(lyricsPanel);panel.append(section);if(this.player.current)void this.lyrics.mount(lyricsPanel,this.player.current.id,this.player.current.name,this.player.current.kind!=='mv');
   }else{
    panel.innerHTML=translateMarkup('<h2>收藏与导入</h2><div class="setting"><span>本地收藏<small>导入记录自动保存，源文件保留原位置</small></span><button class="secondary">管理文件</button></div>');panel.querySelector('button')!.onclick=this.openImports;
   }
  };render();
 }
}
