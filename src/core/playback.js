(function registerPlayback(root) {
  class PlaybackController {
    constructor(audio, video) {
      this.audio = audio;
      this.video = video;
      this.mode = 'audio';
      this.generation = 0;
    }

    get current() { return this.mode === 'video' ? this.video : this.audio; }

    playAudio(url) {
      ++this.generation;
      this.video.pause();
      this.mode = 'audio';
      this.audio.src = url;
      return this.audio.play();
    }

    playVideo(url) {
      const generation = ++this.generation;
      this.audio.pause();
      this.mode = 'video';
      this.video.src = url;
      this.video.onloadedmetadata = () => {
        if (generation !== this.generation) return;
        this.video.currentTime = 0;
      };
      return this.video.play();
    }

    toggle() {
      if (!this.current.src) return Promise.resolve(false);
      if (this.current.paused) return Promise.resolve(this.current.play()).then(() => true);
      this.current.pause();
      return Promise.resolve(false);
    }

    seekPercent(percent) {
      const media = this.current;
      if (!Number.isFinite(percent) || !Number.isFinite(media.duration) || media.duration <= 0) return;
      media.currentTime = Math.max(0, Math.min(100, percent)) / 100 * media.duration;
    }

    setVolume(value) {
      if (!Number.isFinite(value)) return;
      const volume = Math.max(0, Math.min(1, value));
      this.audio.volume = this.video.volume = volume;
    }
  }

  root.YorushikaPlayback = Object.freeze({ PlaybackController });
})(globalThis);
