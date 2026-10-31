export type MediaKind = 'audio' | 'mv';
export interface MediaRecord {
  id: string;
  name: string;
  kind: MediaKind;
  url: string;
  missing: boolean;
}
export interface ImportResult {
  items: MediaRecord[];
  failures: { name: string; message: string }[];
  cache?: {found:number;converted:number};
}
export interface LibraryApi {
  list(): Promise<MediaRecord[]>;
  importFiles(kind: MediaKind): Promise<ImportResult>;
  relink(id: string): Promise<MediaRecord[]>;
}
