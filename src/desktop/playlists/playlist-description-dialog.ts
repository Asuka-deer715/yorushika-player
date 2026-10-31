import {t} from '../localization/i18n.js';
export function editPlaylistDescription(current:string,save:(value:string)=>Promise<void>){
 const dialog=document.createElement('dialog');dialog.className='edit-dialog playlist-description-dialog';const form=document.createElement('form');
 const title=document.createElement('h2');title.textContent=t('编辑歌单介绍');const input=document.createElement('textarea');input.value=current;input.maxLength=2000;input.rows=6;input.placeholder=t('写下这张歌单的故事…');input.setAttribute('aria-label',t('歌单介绍'));
 const error=document.createElement('p');error.setAttribute('role','status');const actions=document.createElement('div');actions.className='actions';const submit=document.createElement('button');submit.className='primary';submit.textContent=t('保存');const cancel=document.createElement('button');cancel.type='button';cancel.className='quiet';cancel.textContent=t('取消');cancel.onclick=()=>dialog.close();
 form.onsubmit=event=>{event.preventDefault();submit.disabled=true;void save(input.value.trim()).then(()=>dialog.close()).catch(e=>{error.textContent=(e as Error).message;submit.disabled=false;});};actions.append(submit,cancel);form.append(title,input,error,actions);dialog.append(form);document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();input.focus();
}
