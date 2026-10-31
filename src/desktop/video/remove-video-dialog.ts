import {t} from '../localization/i18n.js';

export function removeVideoDialog(name:string,remove:()=>Promise<void>){
 const dialog=document.createElement('dialog');dialog.className='edit-dialog';
 const heading=document.createElement('h2');heading.textContent=t('移除视频');
 const description=document.createElement('p');description.textContent=t('确定从播放器中移除该视频吗？本地视频文件会保留，相关的歌曲和作品关联将被移除。');
 const title=document.createElement('strong');title.textContent=name;
 const error=document.createElement('p');error.setAttribute('role','status');
 const actions=document.createElement('div');actions.className='actions';
 const confirm=document.createElement('button');confirm.className='primary';confirm.textContent=t('移除');
 const cancel=document.createElement('button');cancel.className='quiet';cancel.textContent=t('取消');cancel.onclick=()=>dialog.close();
 confirm.onclick=()=>{confirm.disabled=true;void remove().then(()=>dialog.close()).catch(e=>{error.textContent=(e as Error).message;confirm.disabled=false;});};
 actions.append(confirm,cancel);dialog.append(heading,title,description,error,actions);document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();
}
