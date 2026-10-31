const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const metadata = require('../package.json');
const local = path.join(root, '.local-electron.json');
const executable = process.env.ELECTRON_BINARY || (fs.existsSync(path.join(root, 'node_modules/electron')) ? require(path.join(root, 'node_modules/electron')) : JSON.parse(fs.readFileSync(local, 'utf8')).electronBinary);
const build = spawnSync(process.execPath, [path.join(__dirname, 'build.cjs')], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const destination = path.join(root, 'release', `Yorushika-${metadata.version}-win-x64`);
if (fs.existsSync(destination)) throw new Error(`Output already exists: ${destination}`);
fs.cpSync(path.dirname(executable), destination, { recursive: true });
fs.renameSync(path.join(destination, 'electron.exe'), path.join(destination, 'Yorushika.exe'));
const iconResult = spawnSync(process.execPath,[path.join(__dirname,'apply-windows-icon.cjs'),path.join(destination,'Yorushika.exe'),executable],{stdio:'inherit'});
if(iconResult.status!==0)throw new Error('Windows icon generation failed');
const app = path.join(destination, 'resources', 'app');
fs.mkdirSync(app, { recursive: true });
for (const folder of ['dist/main', 'dist/shared', 'dist/browser', 'src/main', 'src/desktop']) fs.cpSync(path.join(root, folder), path.join(app, folder), { recursive: true });
fs.copyFileSync(path.join(root, 'dist/package.json'), path.join(app, 'dist/package.json'));
fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: metadata.name, productName: 'Yorushika', version: metadata.version, main: metadata.main, type: 'module' }));
// Keep the approved visual assets in the application bundle.
const assets = path.join(app, 'src/renderer');
fs.mkdirSync(assets, { recursive: true });
for (const name of ['yorushika-official-mark.svg', 'yorushika-official-album.jpeg']) {
 fs.copyFileSync(path.join(root, 'src/renderer', name), path.join(assets, name));
}
for (const file of ['src/desktop/index.html', 'dist/browser/desktop/app.js', 'dist/browser/desktop/settings-view.js']) {
 const filename = path.join(app, file);
 let text = fs.readFileSync(filename, 'utf8');

 text = text.replace(/<option value="(?:serif|genryu|pearl|akazuki)">[^<]*<\/option>/g, '').replace('思源黑体', '系统字体');
 fs.writeFileSync(filename, text);
}
const css = path.join(app, 'src/desktop/desktop.css');
fs.writeFileSync(css, fs.readFileSync(css, 'utf8').replace(/@font-face\{[^}]*\}/g, ''));
fs.copyFileSync(path.join(root, 'README.md'), path.join(destination, 'README.md'));
console.log(destination);
