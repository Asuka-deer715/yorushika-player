import {translations} from './translations.js';
import {supplementalTranslations} from './supplement-translations.js';
export function t(text:string){const language=localStorage.getItem('desktop-language');const entry=supplementalTranslations[text]??translations[text];return entry?(language==='ja'?entry[0]:language==='en'?entry[1]:text):text;}

export function formatText(text:string,...values:unknown[]){return t(text).replace(/\{(\d+)\}/g,(match,index:string)=>Number(index)<=values.length?String(values[Number(index)-1]):match);}

/** Translate template markup before inserting values, so user data is never treated as UI copy. */
export function localizedMarkup(parts:TemplateStringsArray,...values:unknown[]){
 const prefix='__YORU_I18N_SLOT_';
 let markup=parts[0];for(let i=0;i<values.length;i++)markup+=`${prefix}${i}__`+parts[i+1];
 markup=translateMarkup(markup);
 return markup.replace(/__YORU_I18N_SLOT_(\d+)__/g,(_,index:string)=>String(values[Number(index)]));
}

/** Translate fixed interface markup before it is inserted; dynamic user content is untouched. */
export function translateMarkup(markup:string){
 if(!['ja','en'].includes(localStorage.getItem('desktop-language')??''))return markup;
 const template=document.createElement('template');template.innerHTML=markup;
 translateStaticUI(template.content);return template.innerHTML;
}
export function translateStaticUI(root:Node){
 if(!['ja','en'].includes(localStorage.getItem('desktop-language')??''))return;
 const visit=(node:Node)=>{
  if(node instanceof HTMLScriptElement||node instanceof HTMLStyleElement)return;
  const translate=(value:string)=>{const slots:string[]=[];const key=value.replace(/__YORU_I18N_SLOT_\d+__/g,slot=>{slots.push(slot);return `{${slots.length}}`;});return formatText(key,...slots);};
  if(node.nodeType===Node.TEXT_NODE){const value=node.textContent??'';const trimmed=value.trim();if(trimmed)node.textContent=value.replace(trimmed,translate(trimmed));}
  if(node instanceof Element)for(const attr of ['aria-label','title','placeholder','alt']){const value=node.getAttribute(attr);if(value)node.setAttribute(attr,translate(value));}
  node.childNodes.forEach(visit);
 };
 visit(root);
}
