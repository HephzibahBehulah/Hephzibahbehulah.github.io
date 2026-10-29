import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const wrangler=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
const worker=fs.readFileSync(path.join(root,'backend/workers/worker-openai.js'),'utf8');

test('admin AI has a larger dedicated rate limit than public AI',()=>{
 const limiters=Object.fromEntries(wrangler.ratelimits.map(item=>[item.name,item.simple.limit]));
 assert.ok(limiters.ADMIN_AI_LIMITER>limiters.API_LIMITER);
 assert.equal(limiters.ADMIN_AI_LIMITER,120);
});

test('private AI authenticates administrators before consuming its dedicated limit',()=>{
 const start=worker.indexOf('async function privateAgent(');
 const end=worker.indexOf('\n}',start);
 const source=worker.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.ok(source.indexOf('authenticateAdmin')<source.indexOf('ADMIN_AI_LIMITER'));
 assert.match(source,/ADMIN_AI_LIMITER\.limit\(\{key:"private-adigun:"\+identity\.email\}\)/);
 assert.match(source,/limit\.success[\s\S]*?\},429/);
});
