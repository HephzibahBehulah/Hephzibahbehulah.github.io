import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export const REMOVED_PATHS=['/plc','/plc/','/plc/nested','/electcad','/electcad/','/electcad/index.html','/breadboard','/breadboard/','/breadboard.html','/electrical','/electrical/','/electrical-canvas','/electrical-canvas.html','/Oscilloscope','/oscilloscope','/oscilloscope/','/simulator','/simulator/','/simulator/nested','/voltpro-plc/','/voltpro-plc/index.html','/voltPro-ElectCAD/','/voltpro-electcad/index.html','/tools','/engineering','/engineering.html'];
export async function verifyDeployment({origin='https://engineering.hephzibahbehulah.com',mainOrigin='https://hephzibahbehulah.com',commit=process.env.GITHUB_SHA,fetcher=fetch}={}){
 assert.match(commit||'',/^[a-f0-9]{40}$/i,'Expected deployed commit is required');
 const request=async url=>{const response=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,url+' must return 200');return response;};
 const missingRoute=async url=>{for(const method of ['GET','HEAD']){const response=await fetcher(url,{method,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(20000)});assert.equal(response.status,404,method+' '+url);assert.equal(response.headers.get('location'),null,method+' '+url);}};
 const status=await request(mainOrigin+'/_hb/release.json');assert.equal((await status.json()).commitHash,commit,'Production release must match the deployed commit');
 for(const route of REMOVED_PATHS){await missingRoute(origin+route);await missingRoute(mainOrigin+route);}
 const resources=new Set(['/_hb/release-update.js','/_hb/platform.js','/_hb/experience.js','/_hb/language-system.js']);
 for(const asset of resources){const response=await request(mainOrigin+asset);assert.doesNotMatch(response.headers.get('content-type')||'',/text\/html/,asset+' must not be an HTML fallback');assert.match(response.headers.get('cache-control')||'',/no-cache|no-store/,asset+' must revalidate');await response.arrayBuffer();}
 for(const path of ['/sw.js','/service-worker.js']){const response=await request(mainOrigin+path);assert.match(await response.text(),/HB_ACTIVATE_UPDATE/);assert.match(response.headers.get('cache-control')||'',/no-store/);}
 const main=await request(mainOrigin+'/');assert.match(main.headers.get('content-type')||'',/text\/html/);
 const missing=await fetcher(origin+'/__hb_missing_release_asset__.js',{cache:'no-store',signal:AbortSignal.timeout(20000)});assert.equal(missing.status,404,'Missing scripts must remain 404');
 console.log('Verified deployed commit '+commit+', retired engineering/tool paths, shared assets, main website, update workers, and missing-asset behavior.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await verifyDeployment();
