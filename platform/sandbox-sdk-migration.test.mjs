import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const wrangler=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
const worker=fs.readFileSync(path.join(root,'worker-openai.js'),'utf8');
const dockerfile=fs.readFileSync(path.join(root,'Dockerfile'),'utf8');

test('Cloudflare Sandbox SDK and helper image are both pinned to 1.0.3',()=>{
 assert.equal(pkg.dependencies['@cloudflare/sandbox'],'1.0.3');
 assert.match(dockerfile,/cloudflare\/sandbox:1\.0\.3/);
 assert.match(dockerfile,/sandbox-shim/);
});

test('Sandbox uses the Durable Object container API with an offline lite instance',()=>{
 const container=wrangler.containers?.find(item=>item.class_name==='Sandbox');
 assert.equal(container?.scheduling_policy,'durable_object');
 assert.equal(container?.images?.sandbox?.dockerfile,'./Dockerfile');
 assert.equal(container?.instance_type,undefined);
 assert.match(worker,/import \{ DurableObject \} from "cloudflare:workers"/);
 assert.match(worker,/this\.container\.start\(\{[\s\S]*enableInternet:false/);
 assert.match(worker,/this\.container\.exec\(\["sh","-c"/);
 assert.doesNotMatch(worker,/getSandbox\(|CloudflareSandbox|ContainerProxy/);
});
