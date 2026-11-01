const bandLogo = '../renderer/yorushika-official-mark.svg';

export function createGalleryImage(): HTMLImageElement {
  const image = document.createElement('img');
  image.alt = '';
  image.src = bandLogo;
  image.style.objectFit = 'contain';
  image.style.padding = '20%';
  return image;
}

export async function showGalleryImage(image: HTMLImageElement, source: string, name: string): Promise<void> {
  if (!source) return;
  const candidate = new Image();
  candidate.src = source;
  await candidate.decode();
  if (!image.isConnected) return;
  image.src = source;
  image.alt = name;
  image.style.removeProperty('object-fit');
  image.style.removeProperty('padding');
}
