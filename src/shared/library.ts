export type VideoCategory = 'official'|'live'|'unclassified';
export type MediaKind = 'audio' | 'mv';
export interface MediaRecord {
  id: string;
  name: string;
  kind: MediaKind;
  url: string;
  missing: boolean;
  videoCategory?: VideoCategory;
}
export interface ImportResult {
  items: MediaRecord[];
  importedIds?: string[];
  failures: { name: string; message: string }[];
  cache?: {found:number;converted:number};
}
export interface LibraryApi {
  list(): Promise<MediaRecord[]>;
  rename(id:string,name:string):Promise<MediaRecord[]>;
  setVideoCategory(id:string,category:VideoCategory):Promise<MediaRecord[]>;
  importFiles(kind: MediaKind): Promise<ImportResult>;
  relink(id: string): Promise<MediaRecord[]>;
}
