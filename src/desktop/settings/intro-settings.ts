import {translateMarkup} from '../localization/i18n.js';
import { enhanceSelect } from '../components/soft-select.js';
import { playIntro } from '../shell/intro.js';
export function mountIntroSettings(host:HTMLElement){
 host.className='intro-settings';
 host.innerHTML=translateMarkup('<h2>开场动画</h2><div class="setting"><span>启动时显示<small>每次打开应用播放；可点击跳过或按 Esc。</small></span><input id="intro-enabled" aria-label="启动时显示开场动画" type="checkbox"></div><div class="setting"><label for="intro-duration">动画时长</label><select id="intro-duration"><option value="1">1 秒</option><option value="1.5">1.5 秒</option><option value="2">2 秒</option></select><button id="intro-replay" class="quiet">立即重播</button></div><p class="lyric-hint">跟随系统“减少动态效果”偏好时，显示静态标志并保留跳过按钮。</p>');
 const enabled=host.querySelector<HTMLInputElement>('#intro-enabled')!;
 enabled.checked=localStorage.getItem('desktop-intro')!=='false';enabled.onchange=()=>localStorage.setItem('desktop-intro',String(enabled.checked));
 const duration=host.querySelector<HTMLSelectElement>('#intro-duration')!;const saved=localStorage.getItem('desktop-intro-seconds');duration.value=saved==='1'||saved==='1.5'||saved==='2'?saved:'1.5';duration.onchange=()=>localStorage.setItem('desktop-intro-seconds',duration.value);enhanceSelect(duration);
 host.querySelector<HTMLButtonElement>('#intro-replay')!.onclick=()=>void playIntro(true);
}
