// Hand-drawn approximation of the four kana; strokes are independent so that
// the wordmark is written rather than revealed as a rectangular wipe.
export function createIntroWordmark(duration:number,reduced:boolean):SVGSVGElement {
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 520 165');svg.setAttribute('aria-label','ヨルシカ');svg.classList.add('intro-wordmark');
 const strokes=[
  'M18 19 C31 14 44 11 57 12 C70 10 76 10 80 15',
  'M76 49 C58 66 27 92 10 118',
  'M84 31 C90 58 84 98 77 129 C75 136 52 148 26 153',
  'M235 7 C209 33 185 60 163 86 C145 108 130 126 121 141',
  'M201 83 C200 100 194 121 196 136 C197 146 204 143 211 139 L229 126',
  'M283 26 C290 23 299 22 307 25',
  'M284 45 C292 44 300 45 305 45',
  'M402 16 C366 46 332 79 299 115 L273 148',
  'M432 45 C439 42 446 41 453 40',
  'M516 3 C493 15 469 45 448 72 C430 95 410 123 396 154',
  'M493 40 C501 36 508 36 509 44 C512 67 506 112 493 148'
 ];
 strokes.forEach((shape,index)=>{const path=document.createElementNS(ns,'path');path.setAttribute('d',shape);path.setAttribute('pathLength','1');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','4');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);if(!reduced){const start=duration*(.08+index*.048);const length=duration*.13;path.animate([{strokeDasharray:'1 1',strokeDashoffset:'1'},{strokeDasharray:'1 1',strokeDashoffset:'0'}],{duration:length,delay:start,fill:'both',easing:'ease-out'});}});
 return svg;
}
