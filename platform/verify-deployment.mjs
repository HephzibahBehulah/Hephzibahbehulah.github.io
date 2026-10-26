import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
export async function verifyDeployment({origin='https://engineering.hephzibahbehulah.com',commit=process.env.GITHUB_SHA,fetcher=fetch}={}){
 assert.match(commit||'',/^[a-f0-9]{40}$/i,'Expected deployed commit is required');
 const request=async path=>{const response=await fetcher(origin+path,{cache:'no-store',signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,path+' must return 200');return response;};
 const status=await request('/_hb/release.json');assert.equal((await status.json()).commitHash,commit,'Production release must match the deployed commit');
 const resources=new Set(['/_hb/release-update.js','/workspace-engineering-theme.css','/workspace-shell.js','/_hb/platform.js']);
 for(const route of ['/plc','/electcad','/tools','/breadboard','/electrical','/oscilloscope','/simulator']){
  const response=await request(route);assert.match(response.headers.get('content-type')||'',/text\/html/);assert.match(response.headers.get('cache-control')||'',/no-store/);
  const html=await response.text();assert.ok(html.includes('name="hb-release" content="'+commit+'"'),route+' must identify its running build');assert.ok(html.includes('/_hb/release-update.js'),route+' must include update detection');
  for(const match of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)){const url=new URL(match[1],origin+'/');if(url.origin===origin)resources.add(url.pathname+url.search);}
 }
 for(const path of resources){const response=await request(path);assert.doesNotMatch(response.headers.get('content-type')||'',/text\/html/,path+' must not be an HTML fallback');assert.match(response.headers.get('cache-control')||'',/no-cache|no-store/,path+' must revalidate');}
 for(const path of ['/sw.js','/service-worker.js']){const response=await request(path);assert.match(await response.text(),/HB_ACTIVATE_UPDATE/);assert.match(response.headers.get('cache-control')||'',/no-store/);}
 const missing=await fetcher(origin+'/__hb_missing_release_asset__.js',{cache:'no-store',signal:AbortSignal.timeout(20000)});assert.equal(missing.status,404,'Missing scripts must remain 404');
 console.log('Verified deployed commit '+commit+', seven tool routes, '+resources.size+' shared assets, update workers, and missing-asset behavior.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await verifyDeployment();
