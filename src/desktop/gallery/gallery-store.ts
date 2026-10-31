export interface GalleryImage {id:string; name:string; image:Blob; category?:'fanart'}

function database():Promise<IDBDatabase> {
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('yorushika-gallery',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
async function transaction<T>(mode:IDBTransactionMode, action:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T> {
 const db=await database();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('images',mode);
  const request=action(tx.objectStore('images'));
  tx.oncomplete=()=>{db.close();resolve(request.result);};
  tx.onerror=()=>{db.close();reject(tx.error);};
  tx.onabort=()=>{db.close();reject(tx.error);};
 });
}
export const galleryStore={
 list:()=>transaction<GalleryImage[]>('readonly',store=>store.getAll()),
 add:(item:GalleryImage)=>transaction<IDBValidKey>('readwrite',store=>store.add(item)),
 remove:(id:string)=>transaction<undefined>('readwrite',store=>store.delete(id)),
};
