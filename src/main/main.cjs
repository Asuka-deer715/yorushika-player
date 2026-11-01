const { app, BrowserWindow, Menu, protocol, net, ipcMain, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { mediaResponse } = require('./library/media-response.cjs');

const fs = require('node:fs');
const { LibraryStore } = require('../../dist/main/library/library-store.js');
const { LibraryService } = require('../../dist/main/library/library-service.js');
const { registerLibraryIpc } = require('../../dist/main/library/library-ipc.js');
const dataRoot = process.env.YORUSHIKA_DATA_DIR || (app.isPackaged ? app.getPath('userData') : path.resolve(__dirname, '../../.runtime'));
for (const name of ['userData', 'sessionData', 'temp', 'logs', 'crashDumps']) {
  const directory = path.join(dataRoot, name);
  fs.mkdirSync(directory, { recursive: true });
  app.setPath(name, directory);
}
const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) {
  app.quit();
} else {
app.on('second-instance', () => {
  const window = BrowserWindow.getAllWindows()[0];
  if (!window) return;
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
});
app.commandLine.appendSwitch('disk-cache-dir', path.join(dataRoot, 'cache'));
protocol.registerSchemesAsPrivileged([{ scheme: 'local-media', privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true, corsEnabled: true } }]);
const { CollectionStore } = require('../../dist/main/collection/collection-store.js');
const { registerCollectionIpc } = require('../../dist/main/collection/collection-ipc.js');
const { OnlineSourceStore, registerOnlineSourcesIpc } = require('../../dist/main/online/online-sources-ipc.js');
const {PlayerTray}=require('./window/tray.cjs');
const {CloseBehavior}=require('./window/close-behavior.cjs');
const closeBehavior=new CloseBehavior(app,path.join(dataRoot,'window-preferences.json'));
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
      backgroundThrottling: false,
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== entryUrl) event.preventDefault();
  });
  require('./window/auxiliary-windows.cjs').registerAuxiliaryWindows(window);
  closeBehavior.attach(window);
  window.once('ready-to-show', () => window.show());
  window.loadFile(entryPath);
  playerTray=new PlayerTray(path.join(__dirname,'../desktop/assets/elma.ico'),window,()=>app.quit(),()=>{app.relaunch();app.quit();});
}

app.whenReady().then(() => {
  require('./catalog/catalog-cover-cache.cjs').registerCatalogCoverCache(dataRoot,entryUrl);
  require('./home/home-gallery.cjs').registerHomeGallery(dataRoot,entryUrl);
  ipcMain.handle('story:source',(event,url)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl||!['https://www.lawson.co.jp/lab/tsuushin/art/1464247_4659.html','https://yorushika.com/news/detail/11644','https://yorushika.com/feature/exhibition_sun','https://yorushika.com/news/detail/11312','https://yorushika.com/news/detail/11499','https://yorushika.com/news/detail/11519','https://tablet.wacom.co.jp/article/drawing-with-wacom124','https://www.universal-music.co.jp/yorushika/products/upzz-1852/','https://store-annex.universal-music.co.jp/product/dued1266/','https://www.universal-music.co.jp/yorushika/news/2019-08-27/','https://yorushika.com/news/detail/11127','https://sp.universal-music.co.jp/yorushika/sousaku/','https://music.fanplus.co.jp/news/20190413321e430f7','https://sp.universal-music.co.jp/yorushika/elma/'].includes(url))throw new Error('无效的资料来源');return shell.openExternal(url);});
  require('./story/story-details.cjs').registerStoryDetails(dataRoot,entryUrl,app.isPackaged);
  ipcMain.handle('catalog:official-videos',event=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');return shell.openExternal('https://yorushika.com/news/9/');});
  ipcMain.handle('catalog:open-search',(event,title,artist)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl||typeof title!=='string'||title.length>200||typeof artist!=='string'||artist.length>200)throw new Error('无效的搜索');return shell.openExternal('https://music.163.com/#/search/m/?s='+encodeURIComponent([title,artist].filter(Boolean).join(' '))+'&type=1');});
  ipcMain.handle('window:close-response',(event,mode,remember)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');closeBehavior.respond(BrowserWindow.fromWebContents(event.sender),mode,remember);});
  ipcMain.handle('window:close-behavior:get',event=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');return closeBehavior.get();});
  ipcMain.handle('window:close-behavior:set',(event,mode)=>{if(event.senderFrame!==event.sender.mainFrame||event.senderFrame.url!==entryUrl)throw new Error('不允许的调用来源');closeBehavior.set(mode);});
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
  const subtitleOverlay=require('./subtitles/subtitle-overlay.cjs').registerSubtitleOverlay(dataRoot,entryUrl,store);
  protocol.handle('local-media', async request => {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
    try {
      if(url.host==='subtitle')return await mediaResponse(subtitleOverlay.filePath(url.pathname.slice(1)),request);
      if (url.host !== 'library' || !/^\/[0-9a-f-]{36}$/.test(url.pathname)) return new Response('Invalid media ID', { status: 400 });
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

}
