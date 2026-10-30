const { app, BrowserWindow, Menu, protocol, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

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
let collectionStore;
let store;
const entryPath = path.join(__dirname, '..', 'desktop', 'index.html');
const entryUrl = pathToFileURL(entryPath).href;

function createWindow() {
  Menu.setApplicationMenu(null);
  const window = new BrowserWindow({
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
}

app.whenReady().then(() => {
  store = new LibraryStore(path.join(dataRoot, 'library.sqlite'));
  collectionStore = new CollectionStore(path.join(dataRoot, 'library.sqlite'));
  registerCollectionIpc(collectionStore, entryUrl);
  registerLibraryIpc(new LibraryService(store), entryUrl);
  protocol.handle('local-media', async request => {
    const url = new URL(request.url);
    if (url.host !== 'library' || !/^\/[0-9a-f-]{36}$/.test(url.pathname)) return new Response('Invalid media ID', { status: 400 });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
    try {
      const media = store.get(url.pathname.slice(1));
      return await net.fetch(pathToFileURL(media.path).href, { method: request.method, headers: request.headers });
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

app.on('will-quit', () => { collectionStore?.close(); store?.close(); });
