const {ipcMain,net}=require('electron');
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');
const hosts=new Set(['p1.music.126.net','p2.music.126.net','p3.music.126.net','p4.music.126.net','s3-aop.plusmember.jp']);
function registerCatalogCoverCache(root,entryUrl){
 const directory=path.join(root,'catalog-covers');
 const auth=e=>{if(e.senderFrame!==e.sender.mainFrame||e.senderFrame.url!==entryUrl)throw Error('不允许的调用来源');};
 const filename=id=>{if(typeof id!=='string'||!id||id.length>200)throw Error('无效的作品编号');return path.join(directory,crypto.createHash('sha256').update(id).digest('hex')+'.json');};
 ipcMain.handle('catalog-cover:get',async(e,id)=>{auth(e);try{return await fs.readFile(filename(id),'utf8');}catch(error){if(error.code==='ENOENT')return '';throw error;}});
 ipcMain.handle('catalog-cover:save',async(e,id,input)=>{auth(e);const file=filename(id);const url=new URL(input);if(url.protocol!=='https:'||!hosts.has(url.hostname)||url.username||url.password||url.port)throw Error('不支持的封面地址');const response=await net.fetch(url.href,{redirect:'error',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('封面获取失败');const reportedMime=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();const mime=reportedMime==='image/jpg'?'image/jpeg':reportedMime;if(!['image/jpeg','image/png','image/webp'].includes(mime))throw Error('不支持的封面格式');const reader=response.body.getReader();const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5*1024*1024){await reader.cancel();throw Error('封面文件过大');}chunks.push(Buffer.from(value));}const data='data:'+mime+';base64,'+Buffer.concat(chunks).toString('base64');await fs.mkdir(directory,{recursive:true});await fs.writeFile(file,data,'utf8');return data;});
}
module.exports={registerCatalogCoverCache};
