import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractArchive,digest} from './app-archives.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'platform/public-apps-lock.json'),'utf8'));
for(const [app,release]of Object.entries(lock.applications)){
 const url=new URL(release.url);if(url.protocol!=='https:'||url.hostname!==app+'.hephzibahbehulah.com'||!url.pathname.endsWith('/'+release.commit+'.tar'))throw Error('Unexpected application release URL');
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error('Release download failed: '+response.status);
 const data=Buffer.from(await response.arrayBuffer());if(data.length!==release.bytes||digest(data)!==release.sha256)throw Error('Release checksum mismatch for '+app);
 const count=extractArchive(data,path.join(root,'platform-source',app));console.log(`Verified and extracted ${app}: ${count} browser assets at ${release.commit}`);
}
