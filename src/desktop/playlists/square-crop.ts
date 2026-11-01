export function bindSquareCrop(canvas: HTMLCanvasElement, image: HTMLImageElement,
  x: HTMLInputElement, y: HTMLInputElement, zoom: HTMLInputElement) {
  const context = canvas.getContext('2d')!;
  const side = () => Math.min(image.naturalWidth, image.naturalHeight) / Number(zoom.value);
  const draw = () => {
    const size = side();
    x.disabled = image.naturalWidth <= size;
    y.disabled = image.naturalHeight <= size;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (image.naturalWidth - size) * Number(x.value) / 100,
      (image.naturalHeight - size) * Number(y.value) / 100, size, size,
      0, 0, canvas.width, canvas.height);
  };
  x.oninput = y.oninput = zoom.oninput = draw;
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';
  let drag: {id: number; x: number; y: number} | undefined;
  canvas.onpointerdown = event => {
    if (event.button !== 0) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  };
  canvas.onpointermove = event => {
    if (!drag || drag.id !== event.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    const size = side();
    const shift = (input: HTMLInputElement, delta: number, extent: number, pixels: number) => {
      if (extent > 0 && pixels > 0) input.value = String(Math.max(0, Math.min(100,
        Number(input.value) - delta / pixels * size / extent * 100)));
    };
    shift(x, event.clientX - drag.x, image.naturalWidth - size, rect.width);
    shift(y, event.clientY - drag.y, image.naturalHeight - size, rect.height);
    drag.x = event.clientX; drag.y = event.clientY;
    draw();
  };
  const end = () => { drag = undefined; canvas.style.cursor = 'grab'; };
  canvas.onpointerup = canvas.onpointercancel = canvas.onlostpointercapture = end;
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    zoom.value = String(Math.max(1, Math.min(4, Number(zoom.value) + (event.deltaY < 0 ? .1 : -.1))));
    draw();
  }, {passive: false});
  draw();
}
