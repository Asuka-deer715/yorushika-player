const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
// 复用本机已有工具链；缺失时明确停止，不自动安装。
let modules = path.join(root, 'node_modules');
if (!fs.existsSync(path.join(modules, 'typescript'))) {
  const local = JSON.parse(fs.readFileSync(path.join(root, '.local-electron.json'), 'utf8'));
  modules = path.resolve(path.dirname(local.electronBinary), '../..');
}
const ts = require(path.join(modules, 'typescript'));
const files = ['online/online-sources-ipc', 'collection/collection-store', 'collection/collection-ipc', 'library/library-store', 'library/library-service', 'library/library-ipc', 'preload'].map(name => path.join(root, 'src/main', name + '.ts'));
const options = {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10, ignoreDeprecations: '6.0',
  strict: true, noEmitOnError: true, skipLibCheck: true,
  rootDir: path.join(root, 'src'), outDir: path.join(root, 'dist'),
  typeRoots: [path.join(modules, '@types')], types: ['node'],
  paths: { electron: [path.join(modules, 'electron/electron.d.ts')] },
};
const program = ts.createProgram(files, options);
const result = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: f => f, getCurrentDirectory: () => root, getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  fs.writeFileSync(path.join(root, 'dist/package.json'), '{"type":"commonjs"}');
  console.log('TypeScript 编译与严格类型检查通过');
}

const uiOptions = { ...options, module: ts.ModuleKind.ES2022, outDir: path.join(root, 'dist/browser') };
const ui = ts.createProgram([path.join(root, 'src/desktop/app.ts')], uiOptions);
const uiResult = ui.emit();
const uiErrors = ts.getPreEmitDiagnostics(ui).concat(uiResult.diagnostics);
if (uiErrors.length) { console.error(ts.formatDiagnosticsWithColorAndContext(uiErrors, {getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'})); process.exitCode=1; }
