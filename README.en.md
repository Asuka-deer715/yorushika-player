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

The following describes the current development source:

- **Local collection**: import audio and video, search, create playlists, and relink missing files.
- **Playback and lyrics**: playback queue, volume and mute, previous-session restoration; LRC/TXT lyrics, translation, romanization, offsets and click-to-seek.
- **Full player**: artwork, lyrics, and linked local MV versions. Switching media starts the selected version from the beginning.
- **Release catalog**: browse verified band, n-buna, suis and selected collaboration releases, with missing tracks and local same-name candidates. The catalog and matching are still being developed.
- **Personalization**: Paper, Charcoal, Rain and Cappuccino, Blue Hour and custom palettes; configurable intro and system tray.
- **Online metadata**: NetEase, QQ Music and LRCLIB lyric search, plus online artwork association. Availability depends on the provider and network. QQ lyric retrieval has not been verified successfully in the development environment.

### Organize your collection

- Manage audio and video sources separately while keeping the original media files; relink files after moving them.
- Browse band, n-buna, suis and collaboration releases, including missing tracks and local candidates.
- Create playlists, search your collection, and browse music videos and live performances.

### Listen with lyrics and video

- Open the full player, inspect the queue, and control playback, volume and mute.
- Import original, translated and romanized lyrics, adjust their timing and click synchronized lines to seek.
- Link local music videos to songs and watch in split or background layout; videos can use the linked song's lyrics.
- Look up lyrics and artwork under Online links; availability and results depend on third-party services.

### Make it yours

- Choose a preset or custom palette, font and lyric display options in Settings.
- Configure the intro and home-page ink animation. Choose whether closing hides the app to the tray or exits, and change that choice later in Settings.

The video import action accepts ordinary files or a Bilibili download cache directory. Cache conversion uses FFmpeg to combine separate streams into a new MP4; **FFmpeg is not yet bundled with a source build**. This workflow has only been verified with an existing FFmpeg installation in the development environment. End users do not need to install `ffprobe`.

## Usage

- **Local MV**: import audio and video, then select **MV** on the player bar. A single linked or clearly name-matched video plays directly; multiple candidates can be selected. An associated audio track's lyrics can be used when the video has none.
- **Lyrics and artwork**: play a local track and search under Online links. Local lyric import and timing adjustment are in Settings. Online services can change or become unavailable.
- **Bilibili cache**: select the download directory, then an output directory. Original cache files are retained; large videos need sufficient disk space.
- **Data location**: packaged builds default to the current user's application-data directory; development builds use `.runtime/` in the project. Relink files after moving them.

## Work in progress

Album artwork and complete release data, automatic matching and manual correction, multilingual title aliases, full media codec coverage, bundled Bilibili conversion dependencies, and a signed release are not complete. Account login and private playlist synchronization are not implemented.

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
