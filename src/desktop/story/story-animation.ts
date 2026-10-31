/** Reveal chapters as they enter the horizontal viewport, once per visit. */
export function animateStoryTimeline(viewport: HTMLElement, track: HTMLElement) {
 if (localStorage.getItem('story-animation-skip') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const nodes = Array.from(track.querySelectorAll<HTMLElement>('.story-node'));
 track.classList.add('story-animating');
 nodes.forEach(node => node.classList.add('story-awaiting'));
 let reached = 0;
 const extendLine = () => {
  const visibleEnd = Math.min(track.scrollWidth, viewport.scrollLeft + viewport.clientWidth);
  reached = Math.max(reached, visibleEnd / track.scrollWidth);
  track.style.setProperty('--story-line-progress', String(reached));
 };
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.isIntersecting) continue;
   const node = entry.target as HTMLElement;
   node.classList.remove('story-awaiting');
   node.classList.add('story-revealed');
   observer.unobserve(node);
  }
 }, {root: viewport, threshold: 0.15});
 nodes.forEach(node => observer.observe(node));
 viewport.addEventListener('scroll', extendLine, {passive:true});
 requestAnimationFrame(extendLine);
 const page = viewport.closest('#page');
 if (page) {
  const lifecycle = new MutationObserver(() => {
   if (viewport.isConnected) return;
   observer.disconnect();
   viewport.removeEventListener('scroll', extendLine);
   lifecycle.disconnect();
  });
  lifecycle.observe(page, {childList:true, subtree:true});
 }
}
