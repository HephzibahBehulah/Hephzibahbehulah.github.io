import fs from 'node:fs';
import path from 'node:path';

export function copySharedAssets(root,destination){
 const copyDirectory=(source,target,label)=>{if(!fs.existsSync(source))throw Error('Required shared asset directory is missing: '+label);fs.cpSync(source,target,{recursive:true});};
 copyDirectory(path.join(root,'js'),path.join(destination,'js'),'js');
 copyDirectory(path.join(root,'packages/shared-ui/css'),path.join(destination,'css'),'packages/shared-ui/css');
 copyDirectory(path.join(root,'packages/shared-ui/assets'),path.join(destination,'assets'),'packages/shared-ui/assets');
 for(const directory of ['apps/terminal','apps/admin'])for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true}))if(entry.isFile()&&/^adigun-.*\.js$/.test(entry.name))fs.copyFileSync(path.join(root,directory,entry.name),path.join(destination,'js',entry.name));
 fs.copyFileSync(path.join(root,'packages/shared-ui/js/ai-lab.js'),path.join(destination,'js/ai-lab.js'));
 fs.copyFileSync(path.join(root,'packages/shared-i18n/language-system.js'),path.join(destination,'js/language-system.js'));
 const favicon=path.join(root,'favicon.ico');
 if(!fs.existsSync(favicon))throw Error('Required shared asset is missing: favicon.ico');
 fs.copyFileSync(favicon,path.join(destination,'favicon.ico'));
}
