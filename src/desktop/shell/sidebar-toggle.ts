import {t} from '../localization/i18n.js';

export function mountSidebarToggle(){
 const sidebar=document.querySelector<HTMLElement>('.layout > aside');
 if(!sidebar)return;
 const contents=sidebar.querySelectorAll<HTMLElement>('nav,.sidebar-bottom');
 sidebar.id='main-sidebar';
 const button=document.createElement('button');button.type='button';button.className='sidebar-toggle';button.setAttribute('aria-controls',sidebar.id);
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
 let collapsed=localStorage.getItem('sidebar-collapsed')==='true';
 const update=()=>{document.body.classList.toggle('sidebar-collapsed',collapsed);contents.forEach(element=>{element.inert=collapsed;});button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',t(collapsed?'展开菜单':'收起菜单'));button.title=t(collapsed?'展开菜单':'收起菜单');};
 button.onclick=()=>{collapsed=!collapsed;localStorage.setItem('sidebar-collapsed',String(collapsed));update();};
 sidebar.prepend(button);update();
}
