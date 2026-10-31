const fs=require('node:fs');const path=require('node:path');const {createRequire}=require('node:module');
async function applyIcon(target,electronBinary){
 const root=path.resolve(__dirname,'..');
 const modules=fs.existsSync(path.join(root,'node_modules/resedit'))?path.join(root,'node_modules'):path.resolve(path.dirname(electronBinary),'../..');
 const localRequire=createRequire(path.join(modules,'package.json'));
 const RE=await localRequire('resedit/cjs').load();
 const exe=RE.NtExecutable.from(fs.readFileSync(target));const resources=RE.NtExecutableResource.from(exe);
 const groups=RE.Resource.IconGroupEntry.fromEntries(resources.entries);
 if(groups.length!==1)throw new Error('无法定位 Windows 图标资源');
 const icons=RE.Data.IconFile.from(fs.readFileSync(path.join(root,'src/desktop/assets/elma.ico')));
 RE.Resource.IconGroupEntry.replaceIconsForResource(resources.entries,groups[0].id,groups[0].lang,icons.icons.map(icon=>icon.data));resources.outputResource(exe);fs.writeFileSync(target,Buffer.from(exe.generate()));
}
if(require.main===module)applyIcon(process.argv[2],process.argv[3]).catch(error=>{console.error(error);process.exitCode=1});
module.exports={applyIcon};
