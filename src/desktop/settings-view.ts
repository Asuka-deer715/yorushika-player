import {enhanceSelect} from './soft-select.js';
import {mountIntroSettings} from './intro-settings.js';
import {mountThemeSettings} from './theme-settings.js';
import type {ThemeManager} from './theme.js';
import type {LyricsView} from './lyrics-view.js';
import type {Player} from './player.js';
export type SettingsCategory='general'|'appearance'|'playback'|'lyrics'|'collection';
export class SettingsView {
 category:SettingsCategory='appearance';
 constructor(private themes:ThemeManager,private player:Player,private lyrics:LyricsView,private openImports:()=>void){}
 mount(host:HTMLElement){
  host.innerHTML='<h1>设置</h1><div class="settings-tabs" aria-label="设置分类"></div><div class="settings-content"></div>';
  const tabs=host.querySelector<HTMLElement>('.settings-tabs')!;const panel=host.querySelector<HTMLElement>('.settings-content')!;
  const categories:[SettingsCategory,string][]=[['general','常规'],['appearance','外观'],['playback','播放'],['lyrics','歌词'],['collection','收藏与导入']];
  const render=()=>{
   tabs.replaceChildren();for(const [id,label] of categories){const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(this.category===id));button.onclick=()=>{this.category=id;render();};tabs.append(button);}
   panel.replaceChildren();
   if(this.category==='general'){
    panel.innerHTML='<h2>常规</h2><div class="setting"><span>关闭窗口时<small>隐藏到托盘后，播放会继续；也可以通过托盘菜单退出。</small></span><select aria-label="关闭窗口时"><option value="ask">每次询问</option><option value="tray">隐藏到托盘</option><option value="quit">退出播放器</option></select></div><p class="close-setting-status" role="status"></p>';
    const language=document.createElement('div');language.className='setting';language.innerHTML='<span>界面语言 / 言語 / Language<small>语言支持正在完善，部分页面仍显示中文。</small></span><select aria-label="界面语言 / 言語 / Language"><option value="zh-CN">简体中文</option><option value="ja">日本語</option><option value="en">English</option></select>';panel.prepend(language);
    const languageSelect=language.querySelector('select')!;languageSelect.value=localStorage.getItem('desktop-language')??'zh-CN';languageSelect.onchange=()=>{localStorage.setItem('desktop-language',languageSelect.value);document.documentElement.lang=languageSelect.value;render();};enhanceSelect(languageSelect);
    const select=panel.querySelector<HTMLSelectElement>('.setting:not(:first-of-type) select')!;select.disabled=true;
    void window.windowSettings.getCloseBehavior().then(mode=>{if(!select.isConnected)return;select.value=mode;select.disabled=false;enhanceSelect(select);}).catch(()=>{panel.querySelector('.close-setting-status')!.textContent='无法读取关闭行为设置';});
    select.onchange=()=>{const mode=select.value as 'ask'|'tray'|'quit';void window.windowSettings.setCloseBehavior(mode).catch(()=>{panel.querySelector('.close-setting-status')!.textContent='保存失败，请重试';});};
   }else if(this.category==='appearance'){
    const title=document.createElement('h2');title.textContent='外观';panel.append(title);
    const theme=document.createElement('section');panel.append(theme);mountThemeSettings(theme,this.themes);
    const font=document.createElement('div');font.className='setting';font.innerHTML='<span>界面字体<small>切换正文和标题的阅读风格</small></span><select id="font" aria-label="界面字体"><option value="sans">思源黑体</option><option value="serif">装甲明朝</option><option value="genryu">源流明体</option><option value="pearl">台湾圆体</option><option value="akazuki">あかずきんポップ</option></select>';panel.append(font);
    const select=font.querySelector('select')!;select.value=localStorage.getItem('desktop-font')??'sans';select.onchange=()=>{document.body.dataset.font=select.value;localStorage.setItem('desktop-font',select.value)};enhanceSelect(select);
    const motion=document.createElement('div');motion.className='setting';motion.innerHTML='<span>主页水晕入场<small>选择何时展示；遵循系统减少动态效果设置</small></span><select aria-label="主页水晕入场"><option value="once">每次启动首次进入</option><option value="always">每次进入主页</option><option value="off">关闭</option></select>';panel.append(motion);const mode=motion.querySelector('select')!;mode.value=localStorage.getItem('home-entrance-mode')??'once';mode.onchange=()=>localStorage.setItem('home-entrance-mode',mode.value);enhanceSelect(mode);
    const intro=document.createElement('section');intro.className='settings-intro';panel.append(intro);mountIntroSettings(intro);
   }else if(this.category==='playback'){
    panel.innerHTML='<h2>播放</h2><div class="setting"><span>单曲循环<small>重复播放当前音乐或视频</small></span><input type="checkbox" aria-label="单曲循环"></div>';const repeat=panel.querySelector<HTMLInputElement>('input')!;repeat.checked=this.player.audio.loop;repeat.onchange=()=>{this.player.audio.loop=this.player.video.loop=repeat.checked;localStorage.setItem('desktop-repeat',String(repeat.checked));};
   }else if(this.category==='lyrics'){
    const section=document.createElement('section');section.className='lyrics-settings';const heading=document.createElement('h2');heading.textContent='歌词';section.append(heading);const context=document.createElement('p');context.textContent=this.player.current?'当前版本：'+this.player.current.name:'播放一首音乐后，可为该版本导入和校准歌词。';section.append(context);const lyricsPanel=document.createElement('div');section.append(lyricsPanel);panel.append(section);if(this.player.current)void this.lyrics.mount(lyricsPanel,this.player.current.id,this.player.current.name);
   }else{
    panel.innerHTML='<h2>收藏与导入</h2><div class="setting"><span>本地收藏<small>导入记录自动保存，源文件保留原位置</small></span><button class="secondary">管理文件</button></div>';panel.querySelector('button')!.onclick=this.openImports;
   }
  };render();
 }
}
