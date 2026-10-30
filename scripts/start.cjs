const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const project = require(path.join(root, 'package.json'));
const localPackage = path.join(root, 'node_modules', 'electron');
const configPath = path.join(root, '.local-electron.json');

function resolveElectron() {
  if (process.env.ELECTRON_BINARY) return process.env.ELECTRON_BINARY;
  if (fs.existsSync(localPackage)) {
    try {
      const executable = require(localPackage);
      if (fs.existsSync(executable)) return executable;
    } catch (error) {
      console.warn(`项目内 Electron 不可用：${error.message}`);
    }
  }
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.electronBinary;
  }
  throw new Error('没有找到 Electron。请安装项目依赖，或在 .local-electron.json 中指定已有运行程序。');
}

try {
  const executable = resolveElectron();
  if (!executable || !path.isAbsolute(executable) || !fs.existsSync(executable)) {
    throw new Error('Electron 路径无效，请检查 ELECTRON_BINARY 或 .local-electron.json。');
  }
  const adjacentManifest = path.resolve(path.dirname(executable), '..', 'package.json');
  let foundVersion;
  if (fs.existsSync(adjacentManifest)) {
    const manifest = JSON.parse(fs.readFileSync(adjacentManifest, 'utf8'));
    if (manifest.name === 'electron') {
      foundVersion = manifest.version;
      if (foundVersion !== project.devDependencies.electron) {
        throw new Error(`Electron 版本不匹配：项目需要 ${project.devDependencies.electron}，找到 ${foundVersion}。`);
      }
    }
  }
  if (process.argv.includes('--check')) {
    console.log(`Electron ${foundVersion ?? '版本未核验'}: ${executable}`);
  } else {
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    const temp = path.join(root, '.runtime', 'temp');
    fs.mkdirSync(temp, { recursive: true });
    env.TEMP = env.TMP = temp;
    const child = spawn(executable, [root], { cwd: root, env, stdio: 'inherit' });
    child.on('error', error => { console.error(`启动 Electron 失败：${error.message}`); process.exitCode = 1; });
    child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
