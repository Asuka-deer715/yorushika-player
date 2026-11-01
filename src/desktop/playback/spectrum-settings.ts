import {t} from '../localization/i18n.js';
const configs={spectrum:{enabled:'player-spectrum-enabled',strength:'player-spectrum-strength',label:'播放栏频谱'},breath:{enabled:'player-breath-enabled',strength:'player-breath-strength',label:'播放栏呼吸光晕'}} as const;
export function spectrumEnabled(){return localStorage.getItem(configs.spectrum.enabled)!=='false';}
export function breathEnabled(){return localStorage.getItem(configs.breath.enabled)!=='false';}
export function applySpectrumSettings(){
 for(const [kind,config] of Object.entries(configs)){const value=Number(localStorage.getItem(config.strength)??8);const strength=Number.isFinite(value)?Math.max(3,Math.min(20,value)):8;document.documentElement.style.setProperty(`--${kind}-color-strength`,strength+'%');}
 window.dispatchEvent(new Event('player-spectrum-settings'));
}
export function mountSpectrumSettings(host:HTMLElement){
 for(const config of Object.values(configs)){
  const row=document.createElement('div');row.className='setting';const label=document.createElement('span');label.textContent=t(config.label);const hint=document.createElement('small');hint.textContent=t('遵循系统减少动态效果设置。');label.append(hint);
  const controls=document.createElement('div');controls.className='spectrum-strength-control';const toggle=document.createElement('input');toggle.type='checkbox';toggle.setAttribute('aria-label',t(config.label));toggle.checked=localStorage.getItem(config.enabled)!=='false';
  const range=document.createElement('input');range.type='range';range.min='3';range.max='20';range.step='1';range.value=String(Math.max(3,Math.min(20,Number(localStorage.getItem(config.strength))||8)));range.setAttribute('aria-label',t(config.label)+' '+t('颜色强度'));const output=document.createElement('output');const update=()=>{output.textContent=range.value+'%';range.disabled=!toggle.checked;};update();
  range.oninput=()=>{localStorage.setItem(config.strength,range.value);update();applySpectrumSettings();};toggle.onchange=()=>{localStorage.setItem(config.enabled,String(toggle.checked));update();applySpectrumSettings();};controls.append(toggle,range,output);row.append(label,controls);host.append(row);
 }
}
