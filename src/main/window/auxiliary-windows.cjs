const {BrowserWindow,ipcMain}=require('electron');
const path=require('node:path');
function registerAuxiliaryWindows(mainWindow){
 const windows={mini:null,lyrics:null};let state={title:'',paused:true,original:'',translation:''};
 const mainOnly=e=>{if(e.sender!==mainWindow.webContents||e.senderFrame!==e.sender.mainFrame)throw Error('不允许的调用来源');};
 const auxiliary=e=>Object.values(windows).find(w=>w&&!w.isDestroyed()&&w.webContents===e.sender&&e.senderFrame===e.sender.mainFrame);
 function publish(){for(const win of Object.values(windows))if(win&&!win.isDestroyed())win.webContents.send('aux:state',state);}
 function open(kind){let win=windows[kind];if(win&&!win.isDestroyed()){win.show();win.focus();return;}
  win=new BrowserWindow({width:kind==='mini'?520:760,height:kind==='mini'?130:130,minWidth:kind==='mini'?400:360,minHeight:100,show:false,frame:false,transparent:true,alwaysOnTop:true,resizable:true,skipTaskbar:true,webPreferences:{preload:path.join(__dirname,'auxiliary-preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});windows[kind]=win;
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',event=>event.preventDefault());
  win.loadFile(path.join(__dirname,'../../desktop/auxiliary.html'),{query:{mode:kind}});win.once('ready-to-show',()=>{win.show();publish();mainWindow.webContents.send('aux:request-state');});
  win.on('closed',()=>{windows[kind]=null;if(!mainWindow.isDestroyed()){mainWindow.webContents.send('aux:closed',kind);if(kind==='mini'){mainWindow.show();mainWindow.focus();}}});
  if(kind==='mini')mainWindow.hide();
 }
 ipcMain.handle('aux:open',(e,kind)=>{mainOnly(e);if(!['mini','lyrics'].includes(kind))throw Error('无效的窗口类型');open(kind);});
 ipcMain.handle('aux:close',(e,kind)=>{mainOnly(e);if(!['mini','lyrics'].includes(kind))throw Error('无效的窗口类型');windows[kind]?.close();});
 ipcMain.handle('aux:unlock-lyrics',e=>{mainOnly(e);if(windows.lyrics&&!windows.lyrics.isDestroyed()){windows.lyrics.setIgnoreMouseEvents(false);windows.lyrics.setResizable(true);windows.lyrics.webContents.send('aux:lock',false);}});
 ipcMain.on('aux:publish',(e,value)=>{mainOnly(e);if(!value||typeof value!=='object')return;state=value;publish();});
 ipcMain.on('aux:action',(e,action)=>{const win=auxiliary(e);if(!win||!['previous','toggle','next','restore','close','earlier','later','lock','unlock','vertical','horizontal'].includes(action))return;if((action==='vertical'||action==='horizontal')&&win===windows.lyrics){win.setMinimumSize(action==='vertical'?180:360,100);win.setSize(action==='vertical'?300:760,action==='vertical'?560:130);return;}if(action==='lock'||action==='unlock'){if(win===windows.lyrics){win.setIgnoreMouseEvents(false);win.setResizable(action==='unlock');win.webContents.send('aux:lock',action==='lock');}return;}if(action==='close'||action==='restore'){win.close();return;}mainWindow.webContents.send('aux:action',action);});
}
module.exports={registerAuxiliaryWindows};
