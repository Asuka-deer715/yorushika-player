import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const data=asModule(await readFile(new URL('../dist/browser/desktop/catalog-data.js',import.meta.url),'utf8'));
const names=asModule(await readFile(new URL('../dist/browser/shared/media-name.js',import.meta.url),'utf8'));
const source=(await readFile(new URL('../dist/browser/desktop/catalog-matching.js',import.meta.url),'utf8')).replace('../shared/media-name.js',names).replace('./catalog-data.js',data);
const {catalogMatches,unmatchedCatalogAudio}=await import(asModule(source));
const release={id:'album',name:'盗作',date:'2020-07-29',category:'band',tracks:['逃亡','強盗と花束'],source:''};
const song=name=>({id:name,name,kind:'audio',url:'',missing:false});
test('matches imported filenames while keeping unrelated artists and versions separate',()=>{
 assert.equal(catalogMatches(song('ヨルシカ - 逃亡_EG'),release,'逃亡'),true);
 assert.equal(catalogMatches(song('ヨルシカ - 強盗と花束 (强盗与花束)'),release,'強盗と花束'),true);
 assert.equal(catalogMatches(song('Other - 逃亡'),release,'逃亡'),false);
 assert.equal(catalogMatches(song('ヨルシカ - 逃亡 (Live)'),release,'逃亡'),false);
 assert.deepEqual(unmatchedCatalogAudio([song('ヨルシカ - 逃亡_EG'),song('Other - 逃亡')],[release]).map(x=>x.name),['Other - 逃亡']);
});
