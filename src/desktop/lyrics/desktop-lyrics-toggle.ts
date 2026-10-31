import {t} from '../localization/i18n.js';
export function setDesktopLyrics(enabled:boolean){
 localStorage.setItem('desktop-lyrics',String(enabled));
 window.dispatchEvent(new Event('desktop-lyrics-changed'));
 return enabled?window.auxWindows.open('lyrics'):window.auxWindows.close('lyrics');
}
export function createDesktopLyricsToggle(){
 const button=document.createElement('button');button.className='desktop-lyrics-toggle';button.type='button';button.textContent='词';
 const update=()=>{const active=localStorage.getItem('desktop-lyrics')==='true';button.setAttribute('aria-pressed',String(active));button.title=t('桌面歌词');button.setAttribute('aria-label',t('桌面歌词'));};
 button.onclick=()=>void setDesktopLyrics(localStorage.getItem('desktop-lyrics')!=='true');
 window.addEventListener('desktop-lyrics-changed',update);update();return button;
}
