const {Tray,Menu}=require('electron');
class PlayerTray {
 constructor(icon,window,quit,restart){
  this.tray=new Tray(icon);
  this.tray.setToolTip('Yorushika Player');
  const show=()=>{if(window.isMinimized())window.restore();window.show();window.focus();};
  this.tray.on('click',show);
  this.tray.setContextMenu(Menu.buildFromTemplate([
   {label:'显示播放器',click:show},
   {label:'隐藏到托盘',click:()=>window.hide()},
   {type:'separator'},
   {label:'重启播放器',click:restart},
   {label:'退出播放器',click:quit}
  ]));
  window.once('closed',()=>this.destroy());
 }
 destroy(){if(!this.tray.isDestroyed())this.tray.destroy();}
}
module.exports={PlayerTray};
