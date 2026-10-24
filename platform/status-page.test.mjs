import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolveRoute,createPlatform} from './router.mjs';

const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const host = 'https://engineering.hephzibahbehulah.com';

test('engineering /status serves the public status page and remains outside member login', async () => {
  const route = resolveRoute(new URL(`${host}/status`));
  assert.equal(route.kind, 'app');
  assert.equal(route.path, '/_apps/engineering/status.html');
  let gated = false;
  const platform = createPlatform({memberAuth:{gate:async()=>{gated=true;return {allowed:false};}}});
  const response = await platform.fetch(new Request(`${host}/status`), {ASSETS:{fetch:async()=>new Response('<h1>VoltPro status</h1>',{headers:{'content-type':'text/html'}})}});
  assert.equal(response.status, 200);
  assert.equal(gated, false);
  assert.match(read('platform/router.mjs'), /!route\.privateHost&&!publicStatusPage\?/);
});

test('public status API returns release build and runtime deployment metadata without auth', async () => {
  assert.equal(resolveRoute(new URL(`${host}/api/status`)).kind, 'status');
  let gated = false;
  const platform = createPlatform({memberAuth:{gate:async()=>{gated=true;return {allowed:false};}}});
  const response = await platform.fetch(new Request(`${host}/api/status`), {
    DEPLOYMENT_TIMESTAMP:'2026-10-24T12:34:56Z',
    ASSETS:{fetch:async request=>{assert.equal(new URL(request.url).pathname,'/_apps/engineering/status-build.json');return Response.json({version:'1.0.0',commitHash:'a'.repeat(40),buildTimestamp:'2026-10-24T12:00:00Z'});}}
  });
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{version:'1.0.0',commitHash:'a'.repeat(40),buildTimestamp:'2026-10-24T12:00:00Z',deploymentTimestamp:'2026-10-24T12:34:56Z'});
  assert.equal(gated,false);
});

test('status table is rendered from fetched gaps.json, not embedded rows', () => {
  const html=read('apps/voltpro-engineering-source/status.html');
  const js=read('apps/voltpro-engineering-source/status.js');
  assert.match(html,/id="gapRows"/);
  assert.match(js,/fetch\('\/gaps\.json'/);
  assert.match(js,/gap\.acceptanceTestName/);
  assert.doesNotMatch(html,/PLC-DRC|accept\.plc\./);
});

test('root STATUS.txt generates the exact JSON register and all 30 acceptance TODOs', () => {
  execFileSync(process.execPath,['platform/generate-gaps.mjs','--check'],{cwd:new URL('../',import.meta.url),stdio:'pipe'});
  const data=JSON.parse(read('gaps.json'));
  assert.equal(data.gaps.length,30);
  assert.equal(new Set(data.gaps.map(gap=>gap.gapId)).size,30);
  const acceptance=read('platform/acceptance/gaps/plc-gaps.test.mjs')+read('platform/acceptance/gaps/simulator-gaps.test.mjs')+read('platform/acceptance/gaps/electcad-gaps.test.mjs')+read('platform/acceptance/gaps/breadboard-gaps.test.mjs')+read('platform/acceptance/gaps/building-gaps.test.mjs');
  for(const gap of data.gaps)assert.ok(acceptance.includes(`test.todo(${JSON.stringify(gap.acceptanceTestName)})`),gap.gapId);
});

test('all five tools share the exact notice, About readiness panel, and reload-reset banner', () => {
  const shell=read('apps/voltpro-engineering-source/src/ui/site-shell.js');
  const notice='VoltPro is in active development. DRC rules and symbol libraries are pending verified standards ingestion and licensed catalog integration. Do not use for final production documentation.';
  assert.ok(shell.includes(notice));
  assert.match(shell,/About & readiness/);
  assert.match(shell,/vpReadinessDialog/);
  assert.match(shell,/title\.id='vpReadinessTitle'/);
  assert.match(shell,/Production Readiness: NOT READY/);
  assert.match(shell,/⚠️ Development Build — Not for Production Documentation\. Standards and catalogs pending\./);
  assert.match(shell,/dismiss\.onclick=\(\)=>banner\.remove\(\)/);
  assert.doesNotMatch(shell,/sessionStorage/i);
  assert.doesNotMatch(shell,/localStorage\.(?:getItem|setItem)\([^)]*dismiss/i);
  for(const route of ['simulator','plc','electcad','breadboard','electrical'])assert.equal(resolveRoute(new URL(`${host}/${route}`)).path,'/_apps/engineering/workspace-shell.html',route);
});
