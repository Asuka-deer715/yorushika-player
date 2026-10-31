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
  removeVideo(id:string):Promise<MediaRecord[]>;
  subtitleTracks(id:string):Promise<{index:number;codec:string;language:string;label:string;supported:boolean;default:boolean;render:'text'|'styled'|'bitmap'|'unsupported'}[]>;
  subtitleText(id:string,index:number):Promise<string>;
  subtitleOverlay(id:string,index:number,jobId:string):Promise<string>;
  cancelSubtitleOverlay():Promise<void>;
  onSubtitleProgress(handler:(progress:{jobId:string;seconds:number;duration:number|null})=>void):()=>void;
  setVideoCategory(id:string,category:VideoCategory):Promise<MediaRecord[]>;
  importFiles(kind: MediaKind): Promise<ImportResult>;
  relink(id: string): Promise<MediaRecord[]>;
}
