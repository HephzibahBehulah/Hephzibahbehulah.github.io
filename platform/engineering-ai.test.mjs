import test from 'node:test';
import assert from 'node:assert/strict';
import gateway from './engineering-ai.mjs';

test('engineering health returns JSON and reflects the deployed AI binding',async()=>{
 for(const enabled of [false,true]){
  const origin='https://engineering.hephzibahbehulah.com';
  const result=await gateway.fetch(new Request(origin+'/health',{headers:{origin}}),enabled?{AI:{}}:{});
  assert.equal(result.status,200);
  assert.equal(result.headers.get('access-control-allow-origin'),origin);
  const body=await result.json();
  assert.equal(body.ok,enabled);
  assert.equal(body.service,'voltpro-engineering-ai');
 }
});

test('engineering chat applies domain-specific system contracts for all four tools',async()=>{
 const cases=[
  ['simulator','VoltPRo Simulator AI'],
  ['plc','VoltPRo PLC AI'],
  ['electcad','VoltPRo ElectCAD AI'],
  ['breadboard','VoltPRo Breadboard AI']
 ];
 for(const [tool,expected] of cases){
  let captured;
  const origin='https://engineering.hephzibahbehulah.com';
  const request=new Request(origin+'/chat',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({tool,messages:[{role:'user',content:'Create a safe teaching design'}],siteContext:'Supported project contract'})});
  const result=await gateway.fetch(request,{AI:{run:async(_model,payload)=>{captured=payload;return {response:'Reviewed proposal'};}}});
  assert.equal(result.status,200);
  assert.equal((await result.json()).answer,'Reviewed proposal');
  assert.match(captured.messages[0].content,new RegExp(expected));
  assert.match(captured.messages[1].content,/Supported project contract/);
 }
});
