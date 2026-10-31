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
<td valign="top"><h3>📝 Make personal playlists</h3><p>Browse playlist cards, view their tracks and add the current song from the player. Rename playlists and crop a square cover. New playlists record their creation date; older ones may not have one.</p></td>
<td valign="top"><h3>▶️ Choose how to listen</h3><p>Use the playback queue with sequential, repeat-all, repeat-one or shuffle modes. Control volume and mute, restore your last session, or keep listening with the compact player and system tray.</p></td>
</tr>
<tr>
<td valign="top"><h3>💬 Follow the lyrics</h3><p>Import LRC/TXT lyrics, show original text, translations and romanization, adjust their font sizes independently, and click a line to seek. Desktop lyrics and per-version timing adjustments are available.</p></td>
<td valign="top"><h3>🎬 Watch or just listen</h3><p>Play local MVs and live videos in split, background or fullscreen layouts. Switch to an audio-style view while the MV audio continues; linked audio and video can have separate lyric timing.</p></td>
</tr>
<tr>
<td valign="top"><h3>🎨 Personalize the space</h3><p>Choose a preset or custom palette, adjust typography and entrance effects, and rotate official artwork or your own cropped images on the home page.</p></td>
<td valign="top"><h3>🔎 Find lyrics and artwork</h3><p>Newly imported audio can be matched against NetEase lyrics and artwork; Online links also offers manual lookup and association. Ambiguous results do not automatically overwrite existing data. Availability depends on the provider and network.</p></td>
</tr>
</table>

Video import accepts ordinary files or a Bilibili download cache directory. Cache conversion requires FFmpeg, which is **not yet bundled with a source build**; the workflow has only been verified with FFmpeg available in the development environment. End users do not need to install `ffprobe`.

## Usage

- **Local MV**: import audio and video, then select **MV** on the player bar. A single linked or clearly name-matched video plays directly; multiple candidates can be selected. An associated audio track's lyrics can be used when the video has none.
- **Lyrics and artwork**: play a local track and search under Online links. Local lyric import is in Settings; MV lyric timing can be adjusted from the player bar. Online services can change or become unavailable.
- **Bilibili cache**: select the download directory, then an output directory. Original cache files are retained; large videos need sufficient disk space.
- **Data location**: packaged builds default to the current user's application-data directory; development builds use `.runtime/` in the project. Relink files after moving them.

## Work in progress

Complete release data and the official MV list, matching accuracy, multilingual title aliases, full media codec coverage, bundled Bilibili conversion dependencies, and a signed release are not complete. The language selector is present, but Japanese and English interface translations are unfinished. Account login and private playlist synchronization are not implemented.

## Development

Node.js 24+ is required. Commands use the user's normal system defaults; developers can choose their own project and cache locations.

```powershell
npm install
npm start
npm test
npm run package:win
```

`start.cmd` is for source development. The locally built `Yorushika-Dev.exe` starts the source build without a console and still requires Node.js and development dependencies; its source is `scripts/source-launcher.cs`. Regular users should use the complete package from Releases. `font-candidates/`, `.runtime/`, `.local-electron.json`, and personal media are excluded from the repository.

The current source references `src/renderer/yorushika-official-mark.svg` and `src/renderer/yorushika-official-album.jpeg`; these assets are not included in the public repository. Supply them only after confirming the appropriate rights. Candidate fonts are also excluded. Without those assets, parts of the interface and intro may be incomplete.

## Assets and licensing

This is an unofficial fan project, not affiliated with ヨルシカ or music platforms. Music, video, lyrics, artwork, trademarks and fonts belong to their respective rights holders. No source-code license has been selected; public repository visibility does not by itself grant redistribution rights. Official release information is available from the [Yorushika website](https://yorushika.com/discography/).

The interface organization takes inspiration from [Twilight Echo](https://github.com/Px-asen/Twilight_Echo); its source code was not copied.
