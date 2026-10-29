import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {boundSandboxOutput,SANDBOX_MAX_OUTPUT_BYTES} from './sandbox-limits.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const worker=fs.readFileSync(path.join(root,'backend/workers/worker-openai.js'),'utf8');
const wrangler=fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8');

test('sandbox execution is offline and bounded',()=>{
 assert.match(worker,/enableInternet:false/);
 assert.match(worker,/instance:"lite"/);
 assert.match(worker,/ulimit -t 5/);
 assert.match(worker,/setTimeout\(\(\)=>resolve\(timedOut\),10000\)/);
 assert.match(worker,/output exceeded the 1 MiB limit/i);
 assert.match(worker,/exceeded its 5-second CPU limit/i);
 assert.match(worker,/exceeded its 10-second wall-clock limit/i);
});

test('sandbox output is truncated at one MiB and reports the limit breach',()=>{
 const result=boundSandboxOutput('🧪'.repeat(SANDBOX_MAX_OUTPUT_BYTES/4+1),'stderr');
 assert.equal(result.outputLimitExceeded,true);
 assert.ok(result.outputBytes<=SANDBOX_MAX_OUTPUT_BYTES);
 assert.equal(new TextEncoder().encode(result.stdout).byteLength,result.outputBytes);
 assert.equal(result.stderr,'');
 const within=boundSandboxOutput('ok','');
 assert.equal(within.outputLimitExceeded,false);
 assert.equal(within.stdout,'ok');
});
