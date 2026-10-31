import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {LibraryStore}=require('../dist/main/library/library-store.js');
const {CollectionStore}=require('../dist/main/collection/collection-store.js');
test('local video links persist, deduplicate and validate types',()=>{
 const root=process.cwd().replaceAll('\\','/')+'/.runtime/video-link-test-'+process.pid+'.sqlite';
 const library=new LibraryStore(root);let collection=new CollectionStore(root);
 try{library.add('G:/fixture/song.mp3','song','audio');library.add('G:/fixture/mv.mp4','mv','mv');const [audio,video]=library.list();collection.linkVideo(audio.id,video.id);collection.linkVideo(audio.id,video.id);collection.addCatalogVideo('15','逃亡',video.id);collection.addCatalogVideo('15','逃亡',video.id);assert.equal(collection.catalogVideos().length,1);assert.throws(()=>collection.addCatalogVideo('15','逃亡',audio.id));assert.equal(collection.audioForVideo(video.id),audio.id);library.add('G:/fixture/other.mp3','other','audio');const other=library.list().find(item=>item.name==='other');collection.linkVideo(other.id,video.id);assert.equal(collection.audioForVideo(video.id),null);collection.unlinkVideo(other.id,video.id);assert.equal(collection.audioForVideo(video.id),audio.id);assert.deepEqual(collection.videos(audio.id),[video.id]);assert.throws(()=>collection.linkVideo(video.id,audio.id));collection.close();collection=new CollectionStore(root);assert.deepEqual(collection.videos(audio.id),[video.id]);assert.equal(collection.catalogVideos()[0].videoId,video.id);collection.removeCatalogVideo('15','逃亡',video.id);assert.equal(collection.catalogVideos().length,0);collection.unlinkVideo(audio.id,video.id);assert.deepEqual(collection.videos(audio.id),[]);}finally{collection.close();library.close();require('node:fs').unlinkSync(root);}
});
