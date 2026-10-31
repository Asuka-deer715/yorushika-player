import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('individual album matches can be removed and restored without affecting other versions', async () => {
 const data = new Map();
 globalThis.localStorage = {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
 const source = await readFile(new URL('../dist/browser/desktop/catalog/catalog-exclusions.js',import.meta.url),'utf8');
 const api = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 api.excludeCatalogMatch('version-1','album','逃亡');
 assert.equal(api.catalogExcluded('version-1','album','逃亡'),true);
 assert.equal(api.catalogExcluded('version-2','album','逃亡'),false);
 assert.equal(api.catalogExcluded('version-1','other-album','逃亡'),false);
 api.restoreCatalogMatches('version-1');
 assert.equal(api.catalogExcluded('version-1','album','逃亡'),false);
});
