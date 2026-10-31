export function installCloseDialog(){
 window.closeDialog.onRequest(()=>{
  const dialog=document.createElement('dialog');dialog.className='close-dialog';dialog.innerHTML=`<h2>关闭播放器</h2><p>关闭窗口时，想要如何处理？</p><p class="close-dialog-detail">隐藏到托盘后，音乐会继续播放。点击托盘图标可重新打开播放器。</p><label><input type="checkbox"> 记住我的选择 <small>（可在设置中更改）</small></label><div class="close-dialog-actions"><button type="button" data-action="cancel">取消</button><button type="button" data-action="quit">退出播放器</button><button type="button" class="primary" data-action="tray">隐藏到托盘</button></div>`;
  document.body.append(dialog);let answered=false;
  const respond=(mode:'tray'|'quit'|'cancel')=>{if(answered)return;answered=true;const remember=dialog.querySelector<HTMLInputElement>('input')!.checked;dialog.close();dialog.remove();void window.closeDialog.respond(mode,remember);};
  dialog.querySelectorAll<HTMLButtonElement>('button').forEach(button=>button.onclick=()=>respond(button.dataset.action as 'tray'|'quit'|'cancel'));
  dialog.addEventListener('cancel',event=>{event.preventDefault();respond('cancel');});dialog.showModal();dialog.querySelector<HTMLButtonElement>('[data-action="tray"]')!.focus();
 });
}
