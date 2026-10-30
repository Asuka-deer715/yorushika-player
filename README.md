# Yorushika Player / 夜鹿播放器

面向 Windows 的本地音乐播放器，以 Yorushika（ヨルシカ）的作品与个人收藏为中心。当前为持续开发中的源码版本，没有安装包。

A local-first Windows music player centered on Yorushika and your personal collection. This is a work-in-progress source release; no installer is provided yet.

## 中文

### 已实现

- TypeScript 重写界面，融合式标题栏，完整播放页向上展开、向下收回；Esc 返回原浏览页。
- 批量导入本地音频和视频，SQLite 保存文件引用；去重、搜索、失效文件重新关联。
- 播放／暂停、进度、音量、上一首／下一首与单曲循环。
- 创建歌单、批量加入／移出，同一媒体可属于多个歌单。
- 每个媒体版本独立关联原文、翻译、罗马音歌词，支持 UTF-8 LRC／TXT、时间偏移、高亮和滚动。
- 视频左右布局与压暗背景布局；本机字体候选切换。

导入只记录原路径，不复制、移动或删除源文件。换电脑需要重新关联媒体。实际格式兼容性取决于 Electron 内置解码能力，文件扩展名可被导入不代表所有编码均可播放。

### 启动

需要 Node.js 24 或更高版本、npm 和 Windows。

```powershell
npm install
npm start
```

依赖准备好后，可以直接双击项目根目录的 **start.cmd**。它会编译后启动；构建失败时保留窗口显示错误。

本机也可使用未提交的 `.local-electron.json` 复用已有工具链：其中 `electronBinary` 指向 Electron 可执行文件，邻近 `node_modules` 必须包含 Electron、TypeScript 和 `@types/node`。推荐新用户安装项目依赖。

开发时应用数据、SQLite、缓存与临时目录位于项目内 `.runtime/`，编译文件位于 `dist/`，均不提交 Git。请把项目放在有写权限的目录。需要全部下载到 G 盘时，先在当前 PowerShell 设置 npm、Electron 和临时目录：

```powershell
$env:npm_config_cache = 'G:\DevCache\npm'
$env:ELECTRON_CACHE = 'G:\DevCache\electron'
$env:TEMP = $env:TMP = 'G:\DevCache\temp'
New-Item -ItemType Directory -Force $env:TEMP | Out-Null
npm install
```

### 尚未完成

自动在线歌词和翻译查询、作品目录与匹配、专辑排序、MV／现场分类、开场动画、首次引导、混合多语言歌词的自动识别，以及正式打包发布。目前翻译文本仍需导入；应用不自动生成翻译。

### 素材

本仓库不包含用户音视频、歌词、运行数据库、官方封面／标志或字体候选。界面中的本地素材引用用于开发预览；新克隆缺少图片时可能显示空白图位，字体使用系统后备。完整素材缺失体验仍待完善。

官方图像本机路径为 `src/renderer/yorushika-official-album.jpeg` 和 `src/renderer/yorushika-official-mark.svg`。只有获得使用权限后才应自行放入。公开仓库不代表获得音乐、歌词、商标或字体的使用授权。项目代码的开源许可证尚未选定；public 可见性不等于许可任意再分发。

UI 信息组织参考 [Twilight Echo](https://github.com/Px-asen/Twilight_Echo)，未引入其源代码。新界面位于 `src/desktop/`；`src/renderer/` 与 `src/core/` 保留为旧样本，不是当前页面入口。

## English

### Features

- Rewritten TypeScript desktop interface with integrated window controls and a slide-up full player. Press Esc to return to browsing.
- Batch local audio/video imports, persistent SQLite references, search, deduplication and relinking missing files.
- Playback controls, seeking, volume, previous/next and repeat.
- Persistent playlists with batch add/remove and many-to-many membership.
- Separate original, translated and romanized lyric tracks per media version. UTF-8 LRC/TXT, timing offsets, highlighting and scrolling are supported.
- Split video/lyrics and dimmed background-video layouts.

Imports reference existing files without copying, moving or deleting them. Decoder support depends on Electron; an accepted file extension does not guarantee codec compatibility.

### Run

Install Node.js 24+ and npm on Windows, then run `npm install` followed by `npm start`. Once dependencies are available, double-click **start.cmd** in the repository root. The launcher builds before opening the app.

Runtime data is stored under `.runtime/`; compiled output is under `dist/`. Both are excluded from Git. Use a writable project directory. An optional, untracked `.local-electron.json` can reuse an existing Electron/TypeScript toolchain on a development machine.

### Status and assets

Online lyric/translation lookup, editable release catalogs, matching, album sorting, video categories, intro animation, onboarding and distribution packages are unfinished. Translations currently require manual import.

Official images, candidate fonts, personal media, lyrics and runtime databases are excluded. Local image references may appear empty in a fresh clone; fonts fall back to system fonts. Only add artwork and fonts you have permission to use. No source-code license has been selected yet; public visibility alone is not a redistribution license.

The UI organization takes inspiration from [Twilight Echo](https://github.com/Px-asen/Twilight_Echo), without copying its source code.

## Structure / 目录

| Path | Purpose |
| --- | --- |
| `src/desktop/` | Current TypeScript UI and playback / 当前界面与播放 |
| `src/main/` | Electron, IPC, file dialogs and SQLite / 桌面与数据层 |
| `src/shared/` | API contracts and lyric parsing / 类型契约与歌词解析 |
| `scripts/` | Build and launch / 构建与启动 |
| `tests/` | Logic and persistence tests / 逻辑与持久化测试 |

```powershell
npm run build
npm test
```

Tests cover selected logic and persistence paths; they do not replace real-device codec and visual testing. / 测试覆盖部分逻辑与持久化路径，不代替真实媒体和视觉验收。
