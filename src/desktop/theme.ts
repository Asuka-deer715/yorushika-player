export interface Palette { id:string; name:string; bg:string; surface:string; text:string; muted:string; accent:string; line:string }
export const presets:Palette[]=[
 {id:'paper',name:'暖白 · Paper',bg:'#f5f5f1',surface:'#ffffff',text:'#202c35',muted:'#65717b',accent:'#356d8b',line:'#dedfd9'},
 {id:'charcoal',name:'柔黑 · Charcoal',bg:'#1c1d20',surface:'#26282c',text:'#eeeae3',muted:'#b1b0ad',accent:'#c9b18b',line:'#45474c'},
 {id:'rain',name:'Rain and Cappuccino',bg:'#f7f0e5',surface:'#e5eeed',text:'#3e494b',muted:'#646f6d',accent:'#86563b',line:'#b8c8c5'},
 {id:'blue-hour',name:'蓝调夜色 · Blue Hour',bg:'#192630',surface:'#233540',text:'#e5eceb',muted:'#a8bbc3',accent:'#97c8cf',line:'#405760'}
];
export const fields=['bg','surface','text','muted','accent','line'] as const;
export function luminance(hex:string){const c=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
export function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function validPalette(value:unknown):value is Palette {if(!value||typeof value!=='object')return false;const p=value as Palette;return typeof p.id==='string'&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=40&&fields.every(key=>/^#[0-9a-f]{6}$/i.test(p[key]));}
export class ThemeManager {
 custom:Palette[]=[];
 current=presets[0];
 constructor(private native:(background:string,foreground:string)=>Promise<void>){
  try{const saved=JSON.parse(localStorage.getItem('desktop-themes')??'[]');if(Array.isArray(saved))this.custom=saved.filter(validPalette).filter(p=>p.id.startsWith('custom-'));}catch{localStorage.removeItem('desktop-themes');}
  this.current=this.all.find(p=>p.id===localStorage.getItem('desktop-theme'))??presets[0];this.apply(this.current);
 }
 get all(){return [...presets,...this.custom];}
 apply(p:Palette){this.current=p;const root=document.documentElement;for(const key of fields)root.style.setProperty('--'+key,p[key]);const base=p.bg.slice(1).match(/../g)!.map(v=>parseInt(v,16));const surface=p.surface.slice(1).match(/../g)!.map(v=>parseInt(v,16));for(let level=1;level<=3;level++){const color=base.map((v,i)=>Math.max(0,Math.min(255,v+Math.sign(surface[i]-v)*Math.min(Math.abs(surface[i]-v),level*5))));root.style.setProperty('--layer-'+level,'#'+color.map(v=>v.toString(16).padStart(2,'0')).join(''));}const dark=luminance(p.bg)<.3;root.style.colorScheme=dark?'dark':'light';root.dataset.theme=p.id;root.style.setProperty('--mark-filter',dark?'none':'brightness(.35)');root.style.setProperty('--on-accent',contrast(p.accent,'#ffffff')>=contrast(p.accent,'#17242c')?'#ffffff':'#17242c');localStorage.setItem('desktop-theme',p.id);void this.native(p.bg,p.text).catch(error=>console.error('窗口配色同步失败',error));}
 save(p:Palette){if(!validPalette(p))throw new Error('请填写名称和有效的六位颜色值');const index=this.custom.findIndex(row=>row.id===p.id);if(index<0)this.custom.push(p);else this.custom[index]=p;this.persist();this.apply(p);}
 remove(id:string){this.custom=this.custom.filter(p=>p.id!==id);this.persist();if(this.current.id===id)this.apply(presets[0]);}
 private persist(){localStorage.setItem('desktop-themes',JSON.stringify(this.custom));}
}
