import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const worker=fs.readFileSync(path.join(root,'worker-openai.js'),'utf8');
const wrangler=fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8');

test('sandbox execution is offline and bounded',()=>{
 assert.match(worker,/allowedHosts\s*=\s*\[\]/);
 assert.match(worker,/ulimit -t 5/);
 assert.match(worker,/timeout:10000/);
 assert.match(worker,/SANDBOX_STDOUT_BYTES\s*=\s*192\s*\*\s*1024/);
 assert.match(worker,/SANDBOX_STDERR_BYTES\s*=\s*48\s*\*\s*1024/);
 assert.match(worker,/truncateUtf8\(result\.stdout,SANDBOX_STDOUT_BYTES\)/);
 assert.match(worker,/truncateUtf8\(result\.stderr,SANDBOX_STDERR_BYTES\)/);
 assert.match(wrangler,/"instance_type"\s*:\s*"lite"/);
});
