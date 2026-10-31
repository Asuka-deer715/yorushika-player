export class PlaybackTransition {
  private running = false;

  async run(direction: 'open' | 'close', update: () => void): Promise<void> {
    if (this.running) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }
    this.running = true;
    document.documentElement.dataset.playbackTransition = direction;
    const transition = document.startViewTransition(update);
    try {
      await transition.finished;
    } finally {
      delete document.documentElement.dataset.playbackTransition;
      this.running = false;
    }
  }
}
