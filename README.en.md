<div align="center">

# Yorushika Player

<img src="src/desktop/assets/elma.svg" width="128" alt="Elma">

**A place for the sounds you love.**<br>
A local-first Windows music player centered on ヨルシカ and your own collection.

[简体中文](README.md) · [English](README.en.md)

[Download for Windows](https://github.com/Asuka-deer715/yorushika-player/releases) · [Getting started](#getting-started) · [Features](#features) · [Development](#development) · [Report an issue](https://github.com/Asuka-deer715/yorushika-player/issues)

</div>

> This project is under development. The latest source contains features not included in the v0.1.2 preview on Releases; this source update is not a new installer release.

## Getting started

1. Download the Windows x64 preview from [Releases](https://github.com/Asuka-deer715/yorushika-player/releases) and extract the entire archive.
2. Run `Yorushika.exe`, then import audio or video files you own.
3. Open the full player from the playback bar. Configure fonts, colors, lyrics and the intro in Settings.

The published v0.1.2 preview requires neither Node.js nor a terminal. Keep the extracted files together; the preview is unsigned. Imported media remains in its original location and the application stores a reference to it.

## Features

These features describe the current development source; the published preview may differ.

<table>
<tr>
<td width="50%" valign="top"><h3>🎵 Organize local media</h3><p>Import and manage audio and video separately, search and rename entries, and relink moved files. Your original media stays in place.</p></td>
<td width="50%" valign="top"><h3>📚 Explore Yorushika releases</h3><p>Browse the band, n-buna, suis and selected collaborations. Match local tracks or assign them manually; unmatched audio stays under Other. Link your own local music videos to tracks.</p></td>
</tr>
<tr>
<td valign="top"><h3>📝 Make personal playlists</h3><p>Browse personal playlists, choose local songs in a separate picker, remove tracks, and arrange them manually or by date added. Add songs from their More menu or the player, and customize playlist names and covers.</p></td>
<td valign="top"><h3>▶️ Choose how to listen</h3><p>Use the playback queue with sequential, repeat-all, repeat-one or shuffle modes. Control volume and mute, restore your last session, or keep listening with the compact player and system tray.</p></td>
</tr>
<tr>
<td valign="top"><h3>💬 Follow the lyrics</h3><p>Import LRC/TXT lyrics, show original text, translations and romanization, adjust their font sizes independently, and click a line to seek. Desktop lyrics and per-version timing adjustments are available.</p></td>
<td valign="top"><h3>🎬 Watch or just listen</h3><p>Play local MVs and live videos in split, background or fullscreen layouts. Select embedded text, ASS/SSA or common PGS image subtitles; styled and image tracks are prepared with a progress indicator and cached.</p></td>
</tr>
<tr>
<td valign="top"><h3>🎨 Personalize the space</h3><p>Choose a preset or custom palette, adjust typography and entrance effects, and rotate official artwork or your own cropped images on the home page.</p></td>
<td valign="top"><h3>🔎 Find lyrics and artwork</h3><p>Newly imported audio can be matched against NetEase lyrics and artwork; Online links also offers manual lookup and association. Ambiguous results do not automatically overwrite existing data. Availability depends on the provider and network.</p></td>
</tr>
</table>

A draggable story timeline connects releases, dates, official sources and fan interpretations. The interface offers Chinese, Japanese and English, and the onboarding guide can be reopened from Settings. Public NetEase songs can be tried in the embedded platform player; availability remains subject to the provider.

Video import accepts ordinary files or a Bilibili download cache directory. Bilibili cache conversion and embedded image/styled subtitles use FFmpeg. The current packaging script bundles a developer-provided FFmpeg executable; older published previews may not include it. End users do not need to install `ffprobe`.

## Usage

- **Local MV**: import audio and video, then select **MV** on the player bar. A single linked or clearly name-matched video plays directly; multiple candidates can be selected. An associated audio track's lyrics can be used when the video has none.
- **Lyrics and artwork**: play a local track and search under Online links. Local lyric import is in Settings; MV lyric timing can be adjusted from the player bar. Online services can change or become unavailable.
- **Bilibili cache**: select the download directory, then an output directory. Original cache files are retained; large videos need sufficient disk space.
- **Embedded subtitles**: select a track on the player screen. Image and ASS/SSA subtitles are cached on first preparation; time depends on video duration, resolution and hardware. The original video is not modified. Special ASS fonts may differ if they are not available locally.
- **Data location**: packaged builds default to the current user's application-data directory; development builds use `.runtime/` in the project. Relink files after moving them.

## Work in progress

Complete release data and the official MV list, matching accuracy, multilingual title aliases, full media codec coverage, and a signed release are not complete. The main screens support Chinese, Japanese and English; messages returned by platforms or the operating system may remain in their original language. Account login and private playlist synchronization are not implemented.

## Development

Node.js 24+ is required. Commands use the user's normal system defaults; developers can choose their own project and cache locations.

```powershell
npm install
npm start
npm test
# Before packaging, point YORUSHIKA_FFMPEG to an existing ffmpeg.exe
$env:YORUSHIKA_FFMPEG = "<full path to your ffmpeg.exe>"
npm run package:win
```

Source files are grouped by feature: `src/desktop/` contains player, lyrics, playlists, catalog, video and settings UI; `src/main/` contains the library, collection, online services, subtitles and window management; `src/shared/` holds shared types and utilities. Build scripts and tests live in `scripts/` and `tests/`.

`start.cmd` is for source development. The locally built `Yorushika-Dev.exe` starts the source build without a console and still requires Node.js and development dependencies; its source is `scripts/source-launcher.cs`. Regular users should use the complete package from Releases. `font-candidates/`, `.runtime/`, `.local-electron.json`, and personal media are excluded from the repository.

The current source references `src/renderer/yorushika-official-mark.svg` and `src/renderer/yorushika-official-album.jpeg`; these assets are not included in the public repository. Supply them only after confirming the appropriate rights. Candidate fonts are also excluded. Without those assets, parts of the interface and intro may be incomplete.

## Assets and licensing

This is an unofficial fan project, not affiliated with ヨルシカ or music platforms. Music, video, lyrics, artwork, trademarks and fonts belong to their respective rights holders. No source-code license has been selected; public repository visibility does not by itself grant redistribution rights. Official release information is available from the [Yorushika website](https://yorushika.com/discography/).

The interface organization takes inspiration from [Twilight Echo](https://github.com/Px-asen/Twilight_Echo); its source code was not copied.
