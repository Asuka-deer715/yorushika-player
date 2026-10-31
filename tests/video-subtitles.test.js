import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {parseSubtitleStreams,parseMediaDuration,probeSubtitles,extractSubtitle}=require('../dist/main/subtitles/video-subtitles.js');

test('识别文字和图片字幕轨道',()=>{
 const tracks=parseSubtitleStreams('  Stream #0:1(jpn): Subtitle: ass (default)\n  Stream #0:2(eng): Subtitle: hdmv_pgs_subtitle');
 assert.deepEqual(tracks.map(({index,supported,default:preferred,render})=>({index,supported,preferred,render})),[{index:1,supported:true,preferred:true,render:'styled'},{index:2,supported:true,preferred:false,render:'bitmap'}]);
});
test('从媒体信息读取字幕准备进度所需的时长',()=>{
 assert.equal(parseMediaDuration('Duration: 01:02:03.50, start: 0.000000'),3723.5);
 assert.equal(parseMediaDuration('Duration: N/A, start: 0.000000'),null);
});

test('提取 MKV 内嵌文字字幕为 WebVTT',async t=>{
 const binary=process.env.YORUSHIKA_FFMPEG||'ffmpeg';
 if(spawnSync(binary,['-version'],{windowsHide:true}).status!==0){t.skip('FFmpeg 不在当前环境中');return;}
 const root=resolve('.runtime/tests');await mkdir(root,{recursive:true});const dir=await mkdtemp(join(root,'subtitles-'));
 try{
  const subtitle=join(dir,'sub.srt'),video=join(dir,'test.mkv');await writeFile(subtitle,'1\n00:00:00,100 --> 00:00:00,900\nTest subtitle\n');
  const result=spawnSync(binary,['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=s=32x32:d=1:r=1','-f','srt','-i',subtitle,'-map','0:v','-map','1:s','-c:v','mpeg4','-c:s','srt',video],{windowsHide:true});assert.equal(result.status,0,String(result.stderr));
  const streams=await probeSubtitles(binary,video);assert.equal(streams.length,1);assert.equal(streams[0].supported,true);
  assert.match(await extractSubtitle(binary,video,streams[0].index),/WEBVTT[\s\S]*Test subtitle/);
  await assert.rejects(extractSubtitle(binary,video,999),/不支持/);
 }finally{await rm(dir,{recursive:true});}
});
