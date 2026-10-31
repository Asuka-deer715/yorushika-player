const storageKey = 'catalog-excluded-matches';
const key = (mediaId: string, releaseId: string, track: string) => JSON.stringify([mediaId, releaseId, track]);
export function catalogExcluded(mediaId: string, releaseId: string, track: string) {
 return (JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]).includes(key(mediaId, releaseId, track));
}
export function excludeCatalogMatch(mediaId: string, releaseId: string, track: string) {
 const items = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]);
 items.add(key(mediaId, releaseId, track));
 localStorage.setItem(storageKey, JSON.stringify([...items]));
}
export function restoreCatalogMatches(mediaId: string) {
 const items = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
 localStorage.setItem(storageKey, JSON.stringify(items.filter(item => (JSON.parse(item) as string[])[0] !== mediaId)));
}
export function hasCatalogExclusions(mediaId: string) {
 return (JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]).some(item => (JSON.parse(item) as string[])[0] === mediaId);
}
