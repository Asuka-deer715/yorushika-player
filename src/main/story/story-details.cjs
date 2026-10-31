const fs = require('node:fs');
const path = require('node:path');
const {ipcMain} = require('electron');

function registerStoryDetails(dataRoot, entryUrl, isPackaged) {
 ipcMain.handle('story:details', event => {
  if (event.senderFrame !== event.sender.mainFrame || event.senderFrame.url !== entryUrl) throw new Error('不允许的调用来源');
  if (isPackaged) return null;
  const file = path.join(dataRoot, 'story-details.json');
  if (!fs.existsSync(file)) return {};
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Object.fromEntries(Object.entries(content).filter(([, value]) => typeof value === 'string'));
 });
}
module.exports = {registerStoryDetails};
