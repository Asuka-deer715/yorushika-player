import {t} from '../localization/i18n.js';
export function removeMediaDialog(name:string,remove:()=>Promise<void>){
 const dialog=document.createElement('dialog');dialog.className='edit-dialog';
 const title=document.createElement('h2');title.textContent=t('从播放器移除');
 const item=document.createElement('strong');item.textContent=name;
 const description=document.createElement('p');description.textContent=t('将从播放器和歌单中移除该记录及其关联的歌词、封面；原始文件会保留。');
 const status=document.createElement('p');status.setAttribute('role','status');const actions=document.createElement('div');actions.className='actions';
 const confirm=document.createElement('button');confirm.className='primary';confirm.textContent=t('移除');
 const cancel=document.createElement('button');cancel.className='quiet';cancel.textContent=t('取消');cancel.onclick=()=>dialog.close();
 confirm.onclick=()=>{confirm.disabled=true;void remove().then(()=>dialog.close()).catch(error=>{status.textContent=(error as Error).message;confirm.disabled=false;});};
 actions.append(confirm,cancel);dialog.append(title,item,description,status,actions);document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();
}
