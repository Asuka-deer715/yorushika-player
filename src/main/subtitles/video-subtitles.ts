import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const textCodecs=new Set(['subrip','srt','ass','ssa','webvtt','mov_text','text']);
const bitmapCodecs=new Set(['hdmv_pgs_subtitle','dvd_subtitle','dvb_subtitle','xsub']);
export interface SubtitleStream {index:number;codec:string;language:string;label:string;supported:boolean;default:boolean;render:'text'|'styled'|'bitmap'|'unsupported'}

export function parseSubtitleStreams(output:string):SubtitleStream[]{
 return output.split(/\r?\n/).flatMap(line=>{
  const match=/Stream #0:(\d+)(?:\[0x[0-9a-f]+\])?(?:\(([^)]+)\))?: Subtitle: ([\w_]+)(.*)/i.exec(line);
  if(!match)return [];
  const [,index,language,codec,detail]=match;
  const type=codec.toLowerCase();const render=type==='ass'||type==='ssa'?'styled':bitmapCodecs.has(type)?'bitmap':textCodecs.has(type)?'text':'unsupported';
  return [{index:Number(index),codec,language:language??'',label:[language,codec].filter(Boolean).join(' · '),supported:render!=='unsupported',default:detail.includes('(default)'),render}];
 });
}
export function parseMediaDuration(output:string){const match=/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(output);return match?Number(match[1])*3600+Number(match[2])*60+Number(match[3]):null;}
export async function probeSubtitleInfo(binary:string,path:string){
 try{await exec(binary,['-hide_banner','-i',path],{windowsHide:true,timeout:30000,maxBuffer:4*1024*1024});return {tracks:[],duration:null};}
 catch(error){const failure=error as Error & {stderr?:string;code?:string|number};if(typeof failure.stderr==='string'&&failure.stderr.includes('Input #0'))return {tracks:parseSubtitleStreams(failure.stderr),duration:parseMediaDuration(failure.stderr)};throw new Error('无法读取视频字幕轨道，请检查视频或 FFmpeg。');}
}
export async function probeSubtitles(binary:string,path:string){return (await probeSubtitleInfo(binary,path)).tracks;}
export async function extractSubtitle(binary:string,path:string,index:number){
 const tracks=await probeSubtitles(binary,path);if(!tracks.some(track=>track.index===index&&track.supported))throw new Error('该字幕轨道不支持文字提取。');
 const {stdout}=await exec(binary,['-hide_banner','-loglevel','error','-i',path,'-map',`0:${index}`,'-f','webvtt','pipe:1'],{windowsHide:true,timeout:60000,maxBuffer:8*1024*1024});return stdout;
}
