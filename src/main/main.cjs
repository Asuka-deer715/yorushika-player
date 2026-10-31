const { app, BrowserWindow, Menu, protocol, net, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { mediaResponse } = require('./media-response.cjs');

const fs = require('node:fs');
const { LibraryStore } = require('../../dist/main/library-store.js');
const { LibraryService } = require('../../dist/main/library-service.js');
const { registerLibraryIpc } = require('../../dist/main/library-ipc.js');
const dataRoot = process.env.YORUSHIKA_DATA_DIR || (app.isPackaged ? app.getPath('userData') : path.resolve(__dirname, '../../.runtime'));
for (const name of ['userData', 'sessionData', 'temp', 'logs', 'crashDumps']) {
  const directory = path.join(dataRoot, name);
  fs.mkdirSync(directory, { recursive: true });
  app.setPath(name, directory);
}
app.commandLine.appendSwitch('disk-cache-dir', path.join(dataRoot, 'cache'));
protocol.registerSchemesAsPrivileged([{ scheme: 'local-media', privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true } }]);
const { CollectionStore } = require('../../dist/main/collection-store.js');
const { registerCollectionIpc } = require('../../dist/main/collection-ipc.js');
const { OnlineSourceStore, registerOnlineSourcesIpc } = require('../../dist/main/online-sources-ipc.js');
const {PlayerTray}=require('./tray.cjs');
let playerTray;
const windowColors=new WeakMap();
const introWindows=new WeakSet();
let sourceStore;
let collectionStore;
let store;
const entryPath = path.join(__dirname, '..', 'desktop', 'index.html');
const entryUrl = pathToFileURL(entryPath).href;

function createWindow() {
  Menu.setApplicationMenu(null);
  const window = new BrowserWindow({
    icon: path.join(__dirname, '../desktop/assets/elma.ico'),
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 650,
    backgroundColor: '#f5f5f1',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#f5f5f1', symbolColor: '#202c35', height: 58 },
    webPreferences: {
      preload: path.resolve(__dirname, '../../dist/main/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== entryUrl) event.preventDefault();
  });
  window.once('ready-to-show', () => window.show());
  window.loadFile(entryPath);
  playerTray=new PlayerTray(path.join(__dirname,'../desktop/assets/elma.ico'),window,()=>app.quit());
}

app.whenReady().then(() => {
  ipcMain.handle('appearance:visible',event=>{
    if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');
    const window=BrowserWindow.fromWebContents(event.sender);
    if(window.isVisible())return;
    return new Promise(resolve=>window.once('show',()=>resolve()));
  });
  ipcMain.handle('appearance:intro',(event,active)=>{
    if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl||typeof active!=='boolean')throw new Error('不允许的调用');
    const window=BrowserWindow.fromWebContents(event.sender);
    if(active)introWindows.add(window);else introWindows.delete(window);
    const colors=windowColors.get(window)??{color:'#f5f5f1',symbolColor:'#202c35'};
    window.setTitleBarOverlay(active?{color:'#17242c',symbolColor:'#17242c'}:colors);
    window.setClosable(!active);window.setMinimizable(!active);window.setMaximizable(!active);
  });
  ipcMain.handle('appearance:colors',(event,background,foreground)=>{
    if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');
    if(![background,foreground].every(value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)))throw new Error('无效的颜色');
    const window=BrowserWindow.fromWebContents(event.sender);window.setBackgroundColor(background);const colors={color:background,symbolColor:foreground};windowColors.set(window,colors);if(!introWindows.has(window))window.setTitleBarOverlay(colors);
  });
  store = new LibraryStore(path.join(dataRoot, 'library.sqlite'));
  collectionStore = new CollectionStore(path.join(dataRoot, 'library.sqlite'));
  registerCollectionIpc(collectionStore, entryUrl);
  sourceStore = new OnlineSourceStore(path.join(dataRoot, 'library.sqlite'));
  registerOnlineSourcesIpc(sourceStore, collectionStore, entryUrl);
  registerLibraryIpc(new LibraryService(store), entryUrl);
  protocol.handle('local-media', async request => {
    const url = new URL(request.url);
    if (url.host !== 'library' || !/^\/[0-9a-f-]{36}$/.test(url.pathname)) return new Response('Invalid media ID', { status: 400 });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
    try {
      const media = store.get(url.pathname.slice(1));
      return await mediaResponse(media.path,request);
    } catch (error) {
      console.error('媒体读取失败', error);
      return new Response('Media unavailable', { status: 404 });
    }
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => { playerTray?.destroy(); sourceStore?.close(); collectionStore?.close(); store?.close(); });
