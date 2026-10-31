export type PlaylistSort = 'oldest' | 'newest' | 'custom';
const key = (id:string) => 'playlist-sort:' + id;
export function playlistSort(id:string):PlaylistSort {
 const value=localStorage.getItem(key(id));
 return value==='oldest'||value==='newest'?value:'custom';
}
export function setPlaylistSort(id:string,mode:PlaylistSort) {
 localStorage.setItem(key(id),mode);
}
