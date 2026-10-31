import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
const require=createRequire(import.meta.url);
const {LibraryStore}=require('../dist/main/library/library-store.js');
const {CollectionStore}=require('../dist/main/collection/collection-store.js');
const {parseLyrics}=require('../dist/shared/collection.js');
test('歌单手动顺序独立保存，并保留加入先后',()=>{
 const root=resolve('.runtime/tests');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'playlist-order-'));const file=join(dir,'library.sqlite');const library=new LibraryStore(file);let store=new CollectionStore(file);
 try{
  for(let i=0;i<3;i++)library.add(`G:/fixture/${i}.mp3`,String(i),'audio');const ids=library.list().map(item=>item.id);const playlist=store.create('order')[0];const other=store.create('other')[1];store.add(playlist.id,ids);store.add(other.id,[ids[0]]);
  store.reorder(playlist.id,[ids[2],ids[0],ids[1]]);assert.deepEqual(store.playlists()[0].mediaIds,[ids[2],ids[0],ids[1]]);assert.deepEqual(store.playlists()[0].addedMediaIds,ids);assert.throws(()=>store.reorder(playlist.id,[ids[0],ids[0],ids[1]]));
  store.close();store=new CollectionStore(file);assert.deepEqual(store.playlists()[0].mediaIds,[ids[2],ids[0],ids[1]]);assert.deepEqual(store.playlists()[1].mediaIds,[ids[0]]);store.reorder(playlist.id,[...store.playlists()[0].addedMediaIds].reverse());assert.deepEqual(store.playlists()[0].mediaIds,[...ids].reverse());
 }finally{store.close();library.close();rmSync(dir,{recursive:true});}
});
test('playlist relations and per-version lyrics survive restart',()=>{
 const root=resolve('.runtime/tests');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'collection-'));const file=join(dir,'library.sqlite');const library=new LibraryStore(file);let store=new CollectionStore(file);
 try{library.add('G:/fixture/audio.mp3','audio','audio');library.add('G:/fixture/video.mp4','video','mv');const [a,v]=library.list();const p=store.create('one')[0];assert.ok(p.createdAt);store.renamePlaylist(p.id,'renamed');store.setPlaylistCover(p.id,'data:image/png;base64,dGVzdA==');library.rename(a.id,'new title');const q=store.create('two')[1];store.add(p.id,[a.id,a.id]);store.add(q.id,[a.id]);assert.deepEqual(store.playlists().map(p=>p.mediaIds),[[a.id],[a.id]]);assert.throws(()=>store.add(p.id,[v.id,'missing']));assert.deepEqual(store.playlists()[0].mediaIds,[a.id]);store.saveLyrics(a.id,'original',parseLyrics('[00:01.00]hello'));store.setOffset(a.id,500);store.assignCatalog(a.id,'15','爆弾魔');assert.throws(()=>store.assignCatalog(v.id,'15','爆弾魔'));store.saveLyrics(v.id,'original',parseLyrics('[00:05.00]video'));store.close();store=new CollectionStore(file);assert.equal(store.lyrics(a.id).offset,500);assert.equal(store.playlists()[0].name,'renamed');assert.ok(store.playlists()[0].createdAt);assert.equal(store.playlists()[0].cover,'data:image/png;base64,dGVzdA==');assert.equal(library.get(a.id).name,'new title');assert.equal(library.get(a.id).path,'G:/fixture/audio.mp3');assert.deepEqual(store.catalogAssignments(),[{mediaId:a.id,releaseId:'15',track:'爆弾魔'}]);store.unassignCatalog(a.id);assert.deepEqual(store.catalogAssignments(),[]);assert.equal(store.lyrics(v.id).tracks.original[0].time,5);assert.equal(store.lyrics(v.id).offset,0);store.remove(p.id,[a.id]);assert.deepEqual(store.playlists()[1].mediaIds,[a.id]);assert.equal(library.list().length,2);
 }finally{store.close();library.close();rmSync(dir,{recursive:true});}
});
test('lyrics preserve plain text and expand repeated timestamps',()=>{assert.deepEqual(parseLyrics('[ti:title]\n[offset:-500]\n[00:02.00][00:01.00]line\nplain'),[{time:.5,text:'line'},{time:1.5,text:'line'},{time:null,text:'plain'}]);});
