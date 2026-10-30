# Yorushika Player / 夜鹿播放器

面向 Windows 的本地音乐播放器，以 Yorushika（ヨルシカ）的作品与个人收藏为中心。当前为持续开发中的预览版，提供包含运行时的 Windows x64 ZIP 应用包。

A local-first Windows music player centered on Yorushika and your personal collection. This is a work-in-progress preview with a self-contained Windows x64 ZIP application.

## 中文

### 已实现

- TypeScript 重写界面，融合式标题栏，完整播放页向上展开、向下收回；Esc 返回原浏览页。
- 批量导入本地音频和视频，SQLite 保存文件引用；去重、搜索、失效文件重新关联。
- 播放／暂停、进度、音量、上一首／下一首与单曲循环。
- 创建歌单、批量加入／移出，同一媒体可属于多个歌单。
- 每个媒体版本独立关联原文、翻译、罗马音歌词，支持 UTF-8 LRC／TXT、时间偏移、高亮和滚动。
- 视频左右布局与压暗背景布局；本机字体候选切换。

导入只记录原路径，不复制、移动或删除源文件。换电脑需要重新关联媒体。实际格式兼容性取决于 Electron 内置解码能力，文件扩展名可被导入不代表所有编码均可播放。

### 下载与使用

1. 在 [Releases](https://github.com/Asuka-deer715/yorushika-player/releases) 下载 `Yorushika-0.1.2-win-x64.zip`，不要下载 Source code。
2. 完整解压到你选择的文件夹。
3. 双击 `Yorushika.exe`，然后导入本地音乐。

不需要 Node.js、npm 或命令行。应用包包含 Electron 运行时；请保留解压出的配套文件，不要只移动 exe。该预览包尚未代码签名。

应用数据默认保存在当前 Windows 用户的 `%APPDATA%/yorushika-player` 下，不要求 G 盘。缓存与日志也使用该用户的数据目录。源媒体始终保留原位置。

### 开发者运行

仅开发源码时需要 Node.js 24+：

```powershell
npm install
npm start
npm run package:win
```

使用 npm、Electron 和系统的默认缓存路径，不强制指定盘符。开发运行数据位于 `.runtime/`，打包输出位于 `release/`。本机工具链复用配置 `.local-electron.json` 不提交仓库。`start.cmd` 是开发启动入口，普通用户使用应用包中的 exe。

### 尚未完成

源码开发版已加入可跳过／重播的启动动画、网易云／QQ 单曲链接收藏、平台歌词获取入口和 B 站 BV／链接嵌入入口。网易云实测返回原文、翻译和罗马音；QQ 歌词请求在开发环境受阻，暂未验证可用。设置中获取歌词只替换平台返回的语言，其他语言保留；应用不自动生成翻译。B 站使用官方外链播放器，示例视频返回不可用，尚未验证实际播放，且不与本地进度条同步。

以上改动尚未包含在 v0.1.2 下载包中。音乐平台音频导入／在线播放、平台内歌曲搜索、歌单批量导入、作品目录与匹配、专辑排序、MV／现场分类、首次引导、混合多语言歌词自动识别及正式安装器仍未完成。

### 素材

应用包保留当前展示的专辑封面与夜鹿标志，使用系统字体。图片来自 [Yorushika 官方作品页面](https://yorushika.com/discography/detail/6/)，权利归原权利人所有；本项目非官方项目，不宣称已获得官方授权。用户媒体、歌词、运行数据库和字体候选不随包发布。

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

### Download and run

Download `Yorushika-0.1.2-win-x64.zip` from [Releases](https://github.com/Asuka-deer715/yorushika-player/releases), extract the entire archive, and double-click **Yorushika.exe**. No Node.js, npm or terminal is required. Keep the accompanying runtime files together. This preview is not code-signed.

Application data defaults to the current Windows user's `%APPDATA%/yorushika-player` directory. No particular drive letter is required. Media stays in its original location.

Developers only: install Node.js 24+, then run `npm install`, `npm start`, and `npm run package:win` as needed. Standard system/package-manager cache locations are used. Development data lives in `.runtime/`; packages are generated under `release/`.

### Status and assets

The source development build now includes a skippable/replayable intro, NetEase/QQ song-link bookmarks, a platform-lyrics action in Settings, and a Bilibili BV/link embed. NetEase returned original, translated and romanized lyrics in a live check. QQ lyric requests were blocked in the development environment. Only languages returned by the provider are replaced. Bilibili uses its official external player; the sample video was unavailable, so actual playback remains unverified and is not synchronized with local transport controls.

These changes are not included in the v0.1.2 download. Platform audio import/streaming, platform song search, playlist URL import, editable release catalogs, matching, album sorting, video categories, onboarding and signed installers remain unfinished.

The application bundle retains the album artwork and Yorushika mark used in the interface, and uses system fonts. Candidate fonts, personal media, lyrics and runtime databases are excluded. Artwork is sourced from the [official Yorushika release page](https://yorushika.com/discography/detail/6/). Rights remain with their respective owners; this is an unofficial project and does not claim official permission. No source-code license has been selected yet; public visibility alone is not a redistribution license.

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
