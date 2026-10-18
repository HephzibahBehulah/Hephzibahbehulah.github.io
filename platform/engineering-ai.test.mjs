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
