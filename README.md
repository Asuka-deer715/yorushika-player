<div align="center">

# Yorushika Player

<img src="src/desktop/assets/elma.svg" width="128" alt="Elma">

**为喜欢的声音留一个位置。**<br>
一个围绕ヨルシカ及个人收藏的 Windows 本地音乐播放器。

[简体中文](README.md) · [English](README.en.md)

[下载 Windows 版](https://github.com/Asuka-deer715/yorushika-player/releases) · [快速开始](#快速开始) · [功能一览](#功能一览) · [开发](#开发) · [问题反馈](https://github.com/Asuka-deer715/yorushika-player/issues)

</div>

> 项目仍在开发。GitHub 上最新源码包含的功能可能多于 Releases 中的 v0.1.2 预览包；此次源码更新不代表已发布新安装包。

## 快速开始

1. 在 [Releases](https://github.com/Asuka-deer715/yorushika-player/releases) 下载 Windows x64 预览包，并完整解压。
2. 运行 `Yorushika.exe`，在「导入与整理」中选择自己持有的音乐或视频。
3. 点击播放栏打开完整播放页，在设置里调整字体、配色、歌词和开场动画。

已发布的 v0.1.2 包不需要安装 Node.js 或运行命令。请保留解压出的全部文件；该包未签名。音乐和视频默认保留在原位置，应用保存文件关联。

## 功能一览

以下描述当前源码开发版：

- **本地收藏**：导入音乐和视频，搜索、建立歌单、检查丢失文件并重新关联。
- **播放与歌词**：播放队列、音量和静音、上次播放状态恢复；支持 LRC／TXT、原文、翻译、罗马音、时间偏移及点击歌词跳转。
- **完整播放页**：封面、歌词和本地 MV；可关联多个视频版本，切换媒体时从头播放。
- **作品目录**：浏览已核对的乐队、n-buna、suis 和部分合作作品；曲目显示待收录或本地同名候选。目录与自动匹配仍在完善。
- **个性化**：暖白、柔黑、Rain and Cappuccino、蓝调夜色和自定义配色；可配置开场动画，支持系统托盘。
- **在线资料**：网易云、QQ 音乐和 LRCLIB 歌词搜索入口，以及在线封面关联；来源可用性取决于网络和平台。QQ 歌词获取在开发环境中未验证成功。

选择「导入视频」可选择普通视频文件或 B 站下载缓存目录。缓存导入需要 FFmpeg 合并音视频并保存新文件；**FFmpeg 还没有随当前源码构建的应用包提供**，该功能目前只在具备可用 FFmpeg 的开发环境中验证过。普通用户无需安装 `ffprobe`。

## 使用说明

- **本地 MV**：先导入音频和视频，在播放栏点击「MV」。一个已关联或明确同名的视频会直接播放；多个候选可选择。没有单独歌词的视频可沿用关联音频的歌词。
- **歌词与封面**：播放本地歌曲后，在「在线链接」搜索；本地歌词导入及时间偏移位于「设置」。网络服务可能变更或不可用。
- **B 站缓存**：选择下载目录，再选择转换结果的保存目录。原缓存保持不变；较大的视频需要足够的磁盘空间。
- **数据位置**：打包版默认使用当前用户的应用数据目录；开发版使用项目内 `.runtime/`。移动源文件后需要重新关联。

## 尚在完善

专辑封面和完整发行资料、作品自动匹配与手动修正、跨语言别名搜索、完整音视频格式兼容性、B 站缓存转换依赖随包分发及正式签名发布仍未完成。账号登录和私人歌单同步目前不在已实现功能中。

## 开发

需要 Node.js 24+。以下命令使用各用户系统的默认位置；开发目录和缓存可按个人环境配置。

```powershell
npm install
npm start
npm test
npm run package:win
```

`start.cmd` 仅用于源码开发；普通用户使用 Releases 中的完整应用包。项目内 `font-candidates/`、`.runtime/`、`.local-electron.json` 和用户媒体不提交仓库。

源码界面目前引用的官方标志和专辑图像位于 `src/renderer/yorushika-official-mark.svg` 与 `src/renderer/yorushika-official-album.jpeg`，这两项不包含在公开仓库中；在确认使用权限后需自行提供。字体候选同样不随源码仓库发布。缺少这些素材时，界面或开场画面可能不完整。

## 素材与许可

这是非官方粉丝项目，与ヨルシカ及音乐平台没有官方关联。音乐、视频、歌词、封面、商标和字体的权利属于各自权利人。源代码尚未指定开源许可证；公开仓库并不自动授予再分发权限。官方发行资料可查阅 [ヨルシカ官方网站](https://yorushika.com/discography/)。

界面组织参考 [Twilight Echo](https://github.com/Px-asen/Twilight_Echo)，未复制其源代码。
