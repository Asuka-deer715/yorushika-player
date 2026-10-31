import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { LibraryStore } = require('../dist/main/library/library-store.js');
const { LibraryService } = require('../dist/main/library/library-service.js');
const { CollectionStore } = require('../dist/main/collection/collection-store.js');

test('移除视频清理关联并保留原始文件', async () => {
  const root = resolve('.runtime/tests');
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(join(root, 'remove-video-'));
  const database = join(directory, 'library.sqlite');
  const video = join(directory, 'video.mp4');
  const audio = join(directory, 'song.mp3');
  await writeFile(video, 'video');
  await writeFile(audio, 'audio');
  const store = new LibraryStore(database);
  const collection = new CollectionStore(database);
  try {
    const service = new LibraryService(store);
    const song = (await service.importFiles([audio], 'audio')).items[0];
    const mv = (await service.importFiles([video], 'mv')).items.find(item => item.kind === 'mv');
    collection.linkVideo(song.id, mv.id);
    collection.addCatalogVideo('release', 'track', mv.id);
    await assert.rejects(service.removeVideo(song.id), /视频/);
    assert.deepEqual((await service.removeVideo(mv.id)).map(item => item.id), [song.id]);
    assert.deepEqual(collection.videos(song.id), []);
    assert.deepEqual(collection.catalogVideos(), []);
    assert.equal(await readFile(video, 'utf8'), 'video');
  } finally {
    collection.close();
    store.close();
    await rm(directory, { recursive: true });
  }
});

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
