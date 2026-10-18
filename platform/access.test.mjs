import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyCloudflareAccessJwt as verify} from './access.mjs';
const env={ADIGUN_ACCESS_TEAM_DOMAIN:'https://test-team.cloudflareaccess.com',ADIGUN_ACCESS_AUD:'control',ADIGUN_ADMIN_EMAIL:'owner@example.test'};
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'test-key'};
const b64=x=>Buffer.from(x).toString('base64url');
async function request(overrides={},signature=true){const head=b64(JSON.stringify({alg:'RS256',kid:'test-key'})),body=b64(JSON.stringify({iss:env.ADIGUN_ACCESS_TEAM_DOMAIN,aud:['control'],email:env.ADIGUN_ADMIN_EMAIL,exp:Date.now()/1000+600,...overrides})),text=head+'.'+body;const signed=signature?b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(text))):'invalid';return new Request('https://admin.hephzibahbehulah.com/',{headers:{'cf-access-jwt-assertion':text+'.'+signed}});}
const options={fetcher:async()=>Response.json({keys:[jwk]})};
test('valid signed administrator identity is accepted',async()=>assert.equal((await verify(await request(),env,options)).ok,true));
for(const [name,claims]of [['expired',{exp:1}],['future',{nbf:Date.now()/1000+600}],['wrong audience',{aud:['other']}],['wrong issuer',{iss:'https://other.cloudflareaccess.com'}],['wrong identity',{email:'member@example.test'}],['missing expiry',{exp:undefined}],['invalid expiry',{exp:'never'}]])test(name+' is rejected',async()=>assert.equal((await verify(await request(claims),env,options)).ok,false));
test('forged signature is rejected',async()=>assert.equal((await verify(await request({},false),env,options)).ok,false));
test('unconfigured access is rejected',async()=>assert.equal((await verify(await request(),{},options)).status,503));
test('issuer cannot point to arbitrary network hosts',async()=>assert.equal((await verify(await request(),{...env,ADIGUN_ACCESS_TEAM_DOMAIN:'https://example.com'},options)).status,503));
test('signing keys use the supported edge redirect mode without following redirects',async()=>{
 const issuer='https://edge-runtime-test.cloudflareaccess.com';let fetched=false;
 const result=await verify(await request({iss:issuer}),{...env,ADIGUN_ACCESS_TEAM_DOMAIN:issuer},{fetcher:async(url,init)=>{fetched=true;assert.equal(url,issuer+'/cdn-cgi/access/certs');assert.equal(init.redirect,'manual');return Response.json({keys:[jwk]});}});
 assert.equal(fetched,true);assert.equal(result.ok,true);
});
test('a redirected signing-key endpoint fails closed',async()=>{
 const issuer='https://redirected-keys-test.cloudflareaccess.com';
 const result=await verify(await request({iss:issuer}),{...env,ADIGUN_ACCESS_TEAM_DOMAIN:issuer},{fetcher:async()=>new Response(null,{status:302,headers:{location:'https://example.com/keys'}})});
 assert.equal(result.ok,false);assert.equal(result.code,'signing_keys_unavailable');
});
