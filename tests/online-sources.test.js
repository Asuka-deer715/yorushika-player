import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {parseSource}=require('../dist/shared/online-sources.js');
const {OnlineSourceStore}=require('../dist/main/online-source-store.js');
test('platform links normalize only allowed song and video destinations',()=>{
 assert.equal(parseSource('https://music.163.com/#/song?id=123&foo=bar').remoteId,'123');
 assert.equal(parseSource('https://y.qq.com/n/ryqq/songDetail/0039MnYb0qxYhV').platform,'qq');
 assert.equal(parseSource('https://www.bilibili.com/video/BV1B7411m7LV?p=2').part,2);
 assert.equal(parseSource('BV1B7411m7LV').platform,'bilibili');
 for(const input of ['javascript:alert(1)','https://music.163.com.evil.test/song?id=1','https://user@music.163.com/song?id=1','https://music.163.com/playlist?id=1','https://www.bilibili.com/video/BV1B7411m7LV?p=-1','https://b23.tv/abc'])assert.throws(()=>parseSource(input));
});
test('source store deduplicates normalized links without modifying local music',()=>{
 const store=new OnlineSourceStore(':memory:');
 try{store.add('BV1B7411m7LV','first');store.add('https://www.bilibili.com/video/BV1B7411m7LV','second');assert.equal(store.list().length,1);assert.equal(store.list()[0].title,'second');store.remove(store.list()[0].key);assert.deepEqual(store.list(),[]);}finally{store.close();}
});
