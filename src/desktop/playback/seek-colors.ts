import {t} from '../localization/i18n.js';
const keys={played:'seek-track-played',remaining:'seek-track-remaining'} as const;
const valid=(color:string|null):color is string=>!!color&&/^#[0-9a-f]{6}$/i.test(color);
export function applySeekColors(){
 const seek=document.getElementById('seek');if(!seek)return;
 const played=localStorage.getItem(keys.played),remaining=localStorage.getItem(keys.remaining);
 seek.classList.toggle('custom-seek-track',valid(played)||valid(remaining));
 for(const [name,value] of [['played',played],['remaining',remaining]] as const){const property=`--seek-${name}-color`;if(valid(value))seek.style.setProperty(property,value);else seek.style.removeProperty(property);}
}
export function mountSeekColors(host:HTMLElement){
 const row=document.createElement('div');row.className='setting';const label=document.createElement('span');label.textContent=t('进度条颜色');const hint=document.createElement('small');hint.textContent=t('分别设置已播放和未播放部分；可恢复跟随主题。');label.append(hint);
 const controls=document.createElement('div');controls.className='seek-color-controls';
 const inputs=new Map<keyof typeof keys,HTMLInputElement>();
 for(const [name,title,theme] of [['played','已播放','--accent'],['remaining','未播放','--line']] as const){const field=document.createElement('label');field.textContent=t(title);const input=document.createElement('input');input.type='color';input.setAttribute('aria-label',t(title)+' '+t('进度条颜色'));const saved=localStorage.getItem(keys[name]);const current=getComputedStyle(document.documentElement).getPropertyValue(theme).trim();input.value=valid(saved)?saved:valid(current)?current:'#888888';input.oninput=()=>{localStorage.setItem(keys[name],input.value);applySeekColors();};inputs.set(name,input);field.append(input);controls.append(field);}
 const reset=document.createElement('button');reset.className='quiet';reset.textContent=t('跟随主题');reset.onclick=()=>{for(const name of Object.keys(keys) as (keyof typeof keys)[])localStorage.removeItem(keys[name]);applySeekColors();for(const [name,theme] of [['played','--accent'],['remaining','--line']] as const){const value=getComputedStyle(document.documentElement).getPropertyValue(theme).trim();if(valid(value))inputs.get(name)!.value=value;}};
 controls.append(reset);row.append(label,controls);host.append(row);
}
