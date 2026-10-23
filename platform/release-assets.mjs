import fs from 'node:fs';
import path from 'node:path';

export function copySharedAssets(root,destination){
 for(const directory of ['js','css']){
  const source=path.join(root,directory);
  if(!fs.existsSync(source))throw Error('Required shared asset directory is missing: '+directory);
  fs.cpSync(source,path.join(destination,directory),{recursive:true});
 }
 const favicon=path.join(root,'favicon.ico');
 if(!fs.existsSync(favicon))throw Error('Required shared asset is missing: favicon.ico');
 fs.copyFileSync(favicon,path.join(destination,'favicon.ico'));
}
