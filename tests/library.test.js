import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { LibraryStore } = require('../dist/main/library-store.js');
const { LibraryService } = require('../dist/main/library-service.js');

test('保存、重复导入、部分失败、重启与失效文件重关联', async () => {
  const root = resolve('.runtime/tests');
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(join(root, 'library-'));
  const file = join(directory, '歌曲.mp3');
  const database = join(directory, 'library.sqlite');
  await writeFile(file, 'test fixture');
  let store = new LibraryStore(database);
  try {
    let service = new LibraryService(store);
    const result = await service.importFiles([file, file, join(directory, 'missing.mp3')], 'audio');
    assert.equal(result.items.length, 1);
    assert.equal(result.failures.length, 1);
    const id = result.items[0].id;
    store.close();
    store = new LibraryStore(database);
    service = new LibraryService(store);
    assert.equal((await service.list())[0].id, id);
    await rm(file);
    assert.equal((await service.list())[0].missing, true);
    const replacement = join(directory, 'replacement.mp3');
    await writeFile(replacement, 'replacement');
    const relinked = await service.relink(id, replacement);
    assert.equal(relinked[0].id, id);
    assert.equal(relinked[0].missing, false);
    assert.throws(() => store.get('unknown'), /不存在/);
    await assert.rejects(service.relink(id, join(directory, 'wrong.mp4')), /类型/);
  } finally {
    store.close();
    await rm(directory, { recursive: true });
  }
});
