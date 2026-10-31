const fs=require('node:fs');
const modes=['ask','tray','quit'];
class CloseBehavior {
 constructor(app,filename){this.app=app;this.filename=filename;this.quitting=false;this.pending=false;this.mode='ask';if(fs.existsSync(filename)){const data=JSON.parse(fs.readFileSync(filename,'utf8'));if(modes.includes(data.closeBehavior))this.mode=data.closeBehavior;}app.on('before-quit',()=>{this.quitting=true});}
 get(){return this.mode;}
 set(value){if(!modes.includes(value))throw new Error('无效的关闭行为');const temp=this.filename+'.tmp';fs.writeFileSync(temp,JSON.stringify({closeBehavior:value}),{encoding:'utf8'});fs.renameSync(temp,this.filename);this.mode=value;}
 attach(window){window.on('close',event=>{if(this.quitting)return;event.preventDefault();if(this.pending)return;if(this.mode==='tray'){window.hide();return;}if(this.mode==='quit'){this.app.quit();return;}this.ask(window);});}
 ask(window){this.pending=true;window.webContents.send('window:close-request');}
 respond(window,mode,remember){if(!this.pending||!['tray','quit','cancel'].includes(mode)||typeof remember!=='boolean')throw new Error('无效的关闭选择');this.pending=false;if(mode==='cancel')return;if(remember)this.set(mode);if(mode==='tray')window.hide();else this.app.quit();}

}
module.exports={CloseBehavior};
