import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const collaborations=asModule(await readFile(new URL('../dist/browser/desktop/catalog/collaboration-releases.js',import.meta.url),'utf8'));
const data=asModule((await readFile(new URL('../dist/browser/desktop/catalog/catalog-data.js',import.meta.url),'utf8')).replace('./collaboration-releases.js',collaborations));
const names=asModule(await readFile(new URL('../dist/browser/shared/media-name.js',import.meta.url),'utf8'));
const translations=asModule(await readFile(new URL('../dist/browser/shared/song-translations.js',import.meta.url),'utf8'));
const aliases=asModule((await readFile(new URL('../dist/browser/shared/song-aliases.js',import.meta.url),'utf8')).replace('./song-translations.js',translations));
const source=(await readFile(new URL('../dist/browser/desktop/catalog/catalog-matching.js',import.meta.url),'utf8')).replace('../../shared/media-name.js',names).replace('../../shared/song-aliases.js',aliases).replace('./catalog-data.js',data);
const {catalogMatches,unmatchedCatalogAudio}=await import(asModule(source));
const release={id:'album',name:'盗作',date:'2020-07-29',category:'band',tracks:['逃亡','強盗と花束'],source:''};
const song=name=>({id:name,name,kind:'audio',url:'',missing:false});
test('matches imported filenames while keeping unrelated artists and versions separate',()=>{
 assert.equal(catalogMatches(song('ヨルシカ - 逃亡_EG'),release,'逃亡'),true);
 assert.equal(catalogMatches(song('ヨルシカ - 強盗と花束 (强盗与花束)'),release,'強盗と花束'),true);
 assert.equal(catalogMatches(song('Other - 逃亡'),release,'逃亡'),false);
 assert.equal(catalogMatches(song('ヨルシカ - 逃亡 (Live)'),release,'逃亡'),false);
 assert.equal(catalogMatches(song('ヨルシカ - 逃亡 (Re-Recording)'),release,'逃亡'),true);
 assert.deepEqual(unmatchedCatalogAudio([song('ヨルシカ - 逃亡_EG'),song('Other - 逃亡')],[release]).map(x=>x.name),['Other - 逃亡']);
});
test('collaboration songs match the credited performer and reject unrelated artists',()=>{
 const collaboration={id:'work',name:'青に水底',date:'2017-03-08',category:'collab-n',artist:'三月のパンタシア',tracks:['青に水底'],source:''};
 assert.equal(catalogMatches(song('三月のパンタシア - 青に水底'),collaboration,'青に水底'),true);
 assert.equal(catalogMatches(song('Other - 青に水底'),collaboration,'青に水底'),false);
});
test('confirmed releases include multi-track works and both roles on B∀LK',async()=>{
 const {releases}=await import(data);
 assert.ok(releases.some(item=>item.category==='collab-n'&&item.tracks.includes('ASH feat. Vaundy (n-buna from ヨルシカ Remix)')));
 assert.deepEqual(releases.find(item=>item.id==='collab-s-tomoshiboshi').tracks,['灯星','スターライト','この夏の光']);
 assert.deepEqual(releases.filter(item=>item.tracks.includes('B∀LK')).map(item=>item.category).sort(),['collab-n','collab-s']);
});
