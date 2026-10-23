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

test('engineering chat streams chunks through Workers AI',async()=>{
 let options;
 const origin='https://engineering.hephzibahbehulah.com';
 const upstream=new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('data: {"response":"first "}\n\ndata: {"response":"second"}\\n\\n'));c.close();}});
 const result=await gateway.fetch(new Request(origin+'/chat',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({tool:'simulator',stream:true,messages:[{role:'user',content:'Explain this circuit'}]})}),{AI:{run:async(_model,opts)=>{options=opts;return upstream;}}});
 assert.equal(result.status,200);
 assert.match(result.headers.get('content-type'),/text\/event-stream/);
 assert.equal(options.stream,true);
 const body=await result.text();assert.match(body,/"text":"first "/);assert.match(body,/"text":"second"/);assert.match(body,/"type":"done"/);
});

test('engineering chat falls back to non-streaming when stream setup fails',async()=>{
 let calls=0;
 const origin='https://engineering.hephzibahbehulah.com';
 const result=await gateway.fetch(new Request(origin+'/chat',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({tool:'breadboard',stream:true,messages:[{role:'user',content:'Map a breadboard prototype'}]})}),{AI:{run:async(_model,opts)=>{calls++;if(opts.stream)throw Error('stream unavailable');return {response:'Fallback answer'};}}});
 const body=await result.text();assert.equal(calls,2);assert.match(body,/"type":"reset"/);assert.match(body,/"text":"Fallback answer"/);assert.match(body,/"type":"done"/);
});
