const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('auxiliary',{onState:callback=>ipcRenderer.on('aux:state',(_event,state)=>callback(state)),action:action=>ipcRenderer.send('aux:action',action)});
