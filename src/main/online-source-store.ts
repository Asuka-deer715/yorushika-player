import { DatabaseSync } from 'node:sqlite';
import { parseSource, type OnlineSource } from '../shared/online-sources';
export class OnlineSourceStore {
 private db:DatabaseSync;
 constructor(filename:string){this.db=new DatabaseSync(filename);this.db.exec('CREATE TABLE IF NOT EXISTS online_sources(key TEXT PRIMARY KEY, data TEXT NOT NULL)');}
 list():OnlineSource[]{return this.db.prepare('SELECT data FROM online_sources ORDER BY rowid DESC').all().map(row=>JSON.parse(row.data as string));}
 add(input:string,title:string){const source=parseSource(input);source.title=title.trim()||source.title;this.db.prepare('INSERT INTO online_sources VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data').run(source.key,JSON.stringify(source));return this.list();}
 get(key:string){const source=this.list().find(item=>item.key===key);if(!source)throw new Error('此链接已移除，请刷新列表');return source;}
 remove(key:string){this.db.prepare('DELETE FROM online_sources WHERE key=?').run(key);return this.list();}
 close(){this.db.close();}
}
