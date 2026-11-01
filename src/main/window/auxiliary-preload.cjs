const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('auxiliary',{onLock:callback=>ipcRenderer.on('aux:lock',(_event,locked)=>callback(locked)),onState:callback=>ipcRenderer.on('aux:state',(_event,state)=>callback(state)),action:action=>ipcRenderer.send('aux:action',action)});
