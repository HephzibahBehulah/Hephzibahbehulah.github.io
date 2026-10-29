import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function verifyMainAssets(root){
 const files=['apps/public/index.html','apps/public/about.html','apps/public/contact.html','apps/public/ai-agent.html','apps/public/ai.html','apps/public/portfolio.html','apps/public/resources.html','apps/admin/admin.html','apps/admin/admin-tools.html','packages/shared-ui/assets/hb-logo.svg','apps/cyber-os/index.html','packages/shared-data/data/source-library.json','packages/shared-data/data/translations/en.json','cyber-os/data/ports/iana-service-names.json',...['cybersecurity-tools','linux-manpages','mitre-enterprise','powershell','rfc-index','windows-commands'].map(name=>'cyber-os/data/generated/'+name+'.json')];
 const missing=files.filter(file=>!fs.existsSync(path.join(root,file)));
 if(missing.length)throw Error('The original platform snapshot is incomplete; release blocked. Missing: '+missing.join(', '));
 for(const file of files.filter(x=>x.endsWith('.json'))){const value=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));if(!value||typeof value!=='object')throw Error('Invalid original catalogue: '+file);}
 return files.length;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Verified '+verifyMainAssets(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'))+' original platform entry points and catalogues.');
