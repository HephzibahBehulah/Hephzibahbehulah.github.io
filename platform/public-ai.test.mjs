import test from 'node:test';
import assert from 'node:assert/strict';
import si from './public-ai.mjs';

const request=(body,extra={})=>new Request('https://hephzibahbehulah.com/api/chat',{method:'POST',headers:{'content-type':'application/json',origin:'https://hephzibahbehulah.com',...extra.headers},body:JSON.stringify(body)});
const env=(run,limit=async()=>({success:true}))=>({AI:{run},API_LIMITER:{limit}});

test('public SI streams through Workers AI with a public-only system prompt',async()=>{
 let calls=0;
 const response=await si.fetch(request({messages:[{role:'user',content:'Explain Ohm law'}],language:'de'}),env(async(model,options)=>{calls++;assert.equal(model,'@cf/meta/llama-3.3-70b-instruct');assert.equal(options.stream,true);assert.match(options.messages[0].content,/public assistant/);assert.match(options.messages[0].content,/German/);return new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('data: {"response":"Antwort"}\n\n'));c.close();}});}));
 assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/event-stream/);assert.match(await response.text(),/Antwort/);assert.equal(calls,1);
});

test('public SI falls back to non-streaming Workers AI when streaming setup fails',async()=>{
 let calls=0;
 const response=await si.fetch(request({messages:[{role:'user',content:'2+2?'}]}),env(async(model,options)=>{calls++;if(options.stream)throw Error('stream unavailable');return {response:'4'};}));
 assert.deepEqual(await response.json(),{ok:true,answer:'4',fallback:true});assert.equal(calls,2);
});

test('public SI rejects foreign origins and enforces the API limiter',async()=>{
 const foreign=await si.fetch(request({messages:[{role:'user',content:'hi'}],headers:{origin:'https://evil.example'}}),env(async()=>{throw Error('must not run');}));
 assert.equal(foreign.status,403);
 const limited=await si.fetch(request({messages:[{role:'user',content:'hi'}]}),env(async()=>{throw Error('must not run');},async()=>({success:false})));
 assert.equal(limited.status,429);
});
