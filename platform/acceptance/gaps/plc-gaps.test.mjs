import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHardwareBom, resolveIoMap } from '../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/io-addresses.mjs';
import { analyzePLCWiring } from '../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/wiring-checks.mjs';
import { createPLCDRCReport } from '../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/drc-report.mjs';
import { AUDIT_LIMIT, appendAudit, loadAudit, makeAuditEntry, saveAudit } from '../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/audit-history.mjs';
import { createProgramBlock, createProgramCall, normalizeProgramStructure, validateProgramStructure } from '../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/program-blocks.mjs';

const device = (id, kind, tag, sheet = 'main', pin = 7) => ({
  id,
  type: 'device',
  position: { x: 0, y: 0 },
  data: { kind, tag, label: tag, sheet, preset: 0, pin },
});

test('accept.plc.io-addresses.cross-reference', async t => {
  await t.test('auto-assigns independent IEC-style input and output channels across byte boundaries', () => {
    const nodes = [
      device('s1', 'no', 'S1'),
      device('q1', 'coil', 'KM1'),
      ...Array.from({ length: 8 }, (_, index) => device('s' + (index + 2), 'nc', 'S' + (index + 2))),
      device('q2', 'lamp', 'H1'),
      device('logic', 'TON', 'T1'),
      device('aux', 'auxNO', 'KM1'),
      device('power-breaker', 'breaker3', 'QF1'),
      device('power-overload', 'overload3', 'FR1'),
      device('motor', 'motor', 'M1'),
    ];
    const rows = resolveIoMap({ nodes, sheets: [{ id: 'main', name: 'Main' }] });
    assert.equal(rows.find(row => row.node.id === 's1').address, '%I0.0');
    assert.equal(rows.find(row => row.node.id === 's9').address, '%I1.0');
    assert.equal(rows.find(row => row.node.id === 'q1').address, '%Q0.0');
    assert.equal(rows.find(row => row.node.id === 'q2').address, '%Q0.1');
    assert.equal(rows.find(row => row.node.id === 'logic').address, null);
    assert.equal(rows.find(row => row.node.id === 'aux').address, null);
    assert.equal(rows.find(row => row.node.id === 'power-breaker').address, null);
    assert.equal(rows.find(row => row.node.id === 'power-overload').address, null);
    assert.equal(rows.find(row => row.node.id === 'motor').address, null);
    assert.equal(rows.find(row => row.node.id === 's1').node.data.pin, 7, 'Arduino pin remains a separate setting');
  });

  await t.test('links repeated device tags to their actual sheet names in both directions', () => {
    const nodes = [device('coil', 'coil', 'KM1'), device('aux', 'auxNO', 'KM1', 'control')];
    const rows = resolveIoMap({ nodes, sheets: [{ id: 'main', name: 'Main' }, { id: 'control', name: 'Control' }] });
    const coil = rows.find(row => row.node.id === 'coil');
    const aux = rows.find(row => row.node.id === 'aux');
    assert.equal(coil.sheetName, 'Main');
    assert.equal(aux.sheetName, 'Control');
    assert.deepEqual(coil.references.map(node => node.id), ['aux']);
    assert.deepEqual(aux.references.map(node => node.id), ['coil']);
  });

  await t.test('accept.plc.hardware-bom.complete', () => {
    const nodes = [
      ...Array.from({ length: 9 }, (_, index) => device('i' + index, 'no', 'S' + index)),
      ...Array.from({ length: 9 }, (_, index) => device('q' + index, 'coil', 'K' + index)),
    ];
    const bom = buildHardwareBom({ nodes });
    assert.equal(bom.length, 5);
    assert.equal(bom[0].id, 'CPU-01');
    assert.match(bom[0].description, /generic teaching model; no vendor selected/);
    assert.deepEqual(bom.slice(1).map(line => [line.id, line.channelsUsed, line.capacity, line.addressRange]), [
      ['DI-01', 8, 8, '%I0.0 – %I0.7'],
      ['DI-02', 1, 8, '%I1.0'],
      ['DO-01', 8, 8, '%Q0.0 – %Q0.7'],
      ['DO-02', 1, 8, '%Q1.0'],
    ]);
    assert.deepEqual(buildHardwareBom({ nodes: [] }).map(line => line.id), ['CPU-01']);
  });
});

test('accept.plc.drc.educational-review-report', () => {
  const report = createPLCDRCReport(
    ['A project-model error.'],
    [{ code: 'rung-return-missing', severity: 'warning', deviceIds: ['coil-1'], message: 'Return is not connected.' }],
  );
  assert.equal(report.passed, false);
  assert.equal(report.profile, 'VoltPro educational project review');
  assert.equal(report.standardsAssessment, 'not-assessed');
  assert.deepEqual(report.findings.map(({ code, severity, deviceIds }) => [code, severity, deviceIds]), [
    ['project-model', 'error', []],
    ['rung-return-missing', 'warning', ['coil-1']],
  ]);
  const commissioning = fs.readFileSync(new URL('../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/Commissioning.tsx', import.meta.url), 'utf8');
  assert.match(commissioning, /Run Project DRC/);
  assert.match(commissioning, /createPLCDRCReport\(validate\(s\.project\),analyzePLCWiring\(s\.project\)\)/);
  assert.match(commissioning, /Normative standards assessment: Not performed/);
});

test.todo('accept.plc.drc.iec61131-profile');
test('accept.plc.program-blocks.cross-reference',()=>{
 const initial=normalizeProgramStructure({version:1,name:'Plant',mode:'ladder',nodes:[],edges:[],sheets:[{id:'main',name:'Main'},{id:'legacy',name:'Legacy sequence'}]});
 assert.deepEqual(initial.programBlocks.map(block=>[block.kind,block.sheetId]),[['main','main'],['subroutine','legacy']]);
 const withSubroutine=createProgramBlock(initial,{id:'cleanup',sheetId:'cleanup-sheet',name:'Cleanup'});
 const withInterrupt=createProgramBlock(withSubroutine,{id:'trip',sheetId:'trip-sheet',name:'Trip monitor',kind:'interrupt',trigger:'Overload input rising edge'});
 const linked=createProgramCall(withInterrupt,{id:'main-to-cleanup',fromBlockId:'main',toBlockId:'cleanup'});
 assert.deepEqual(validateProgramStructure(linked),[]);
 assert.match(validateProgramStructure({...linked,programCalls:[...linked.programCalls,{id:'bad-target',fromBlockId:'main',toBlockId:'trip'}]}).join(' '),/must originate from Main or a subroutine and target a subroutine/);
 assert.match(validateProgramStructure({...linked,programCalls:[...linked.programCalls,{id:'cleanup-to-legacy',fromBlockId:'cleanup',toBlockId:'sub_1'},{id:'legacy-to-cleanup',fromBlockId:'sub_1',toBlockId:'cleanup'}]}).join(' '),/Recursive PLC program-block calls/);
 assert.throws(()=>createProgramCall(linked,{id:'duplicate',fromBlockId:'main',toBlockId:'cleanup'}),/Duplicate program call/);
});

test('accept.plc.history.audit-trail', async t => {
  await t.test('records logic, device and wire edits but ignores canvas-only movement', () => {
    const before = wiringProject([device('coil', 'coil', 'KM1')], []);
    const moved = { ...before, nodes: [{ ...before.nodes[0], position: { x: 300, y: 200 } }] };
    assert.equal(makeAuditEntry(before, moved), null);
    const after = wiringProject([device('coil', 'coil', 'KM2'), device('neutral', 'neutral', 'N')], [wire('w1', 'coil', 'A2', 'neutral', 'N')]);
    const entry = makeAuditEntry(before, after, { id: 'audit-1', at: '2026-10-30T10:00:00.000Z' });
    assert.match(entry.summary, /Updated device KM2/);
    assert.match(entry.summary, /Added device N/);
    assert.match(entry.summary, /Connected KM2.A2 ↔ N.N/);
    assert.ok(entry.groupKey.includes('node:coil'));
  });

  await t.test('coalesces rapid edits, caps retention, and persists across reloads', () => {
    const project = wiringProject([], []);
    const first = makeAuditEntry(project, { ...project, name: 'Project A' }, { id: 'first', at: '2026-10-30T10:00:00.000Z' });
    const next = makeAuditEntry({ ...project, name: 'Project A' }, { ...project, name: 'Project B' }, { id: 'second', at: '2026-10-30T10:00:01.000Z' });
    let history = appendAudit([], first, Date.parse(first.at));
    history = appendAudit(history, next, Date.parse(next.at));
    assert.equal(history.length, 1);
    assert.equal(history[0].id, 'first');
    assert.equal(history[0].at, next.at);
    assert.match(history[0].summary, /Project B/);
    for (let index = 0; index < AUDIT_LIMIT + 3; index++) history = appendAudit(history, { ...first, id: 'entry-' + index, groupKey: 'unique-' + index, at: new Date(Date.parse(next.at) + (index + 1) * 3000).toISOString() });
    assert.equal(history.length, AUDIT_LIMIT);
    const data = new Map();
    const storage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
    assert.equal(saveAudit(storage, history), true);
    assert.deepEqual(loadAudit(storage), history);
    assert.deepEqual(loadAudit({ getItem: () => { throw Error('storage unavailable'); } }), []);
  });

  await t.test('loads and stores the journal in the PLC client and exposes a local JSON export', () => {
    const root = new URL('../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/', import.meta.url);
    const store = fs.readFileSync(new URL('store.ts', root), 'utf8');
    const commissioning = fs.readFileSync(new URL('Commissioning.tsx', root), 'utf8');
    assert.match(store, /loadAudit\(localStorage\)/);
    assert.match(store, /saveAudit\(localStorage,audit\)/);
    assert.match(commissioning, /Export history JSON/);
    assert.match(commissioning, /voltpro-plc-audit-history\.json/);
  });
});

const wire = (id, source, sourceHandle, target, targetHandle) => ({ id, source, sourceHandle, target, targetHandle });
const wiringProject = (nodes, edges) => ({ version: 1, mode: 'ladder', nodes, edges });

test('accept.plc.wiring.coil-and-rung-rules', async t => {
  await t.test('accepts a wired control contact, output coil, supply and neutral return', () => {
    const nodes = [device('supply', 'supply', 'L1'), device('start', 'no', 'S1'), device('coil', 'coil', 'KM1'), device('neutral', 'neutral', 'N')];
    const edges = [wire('w1', 'supply', 'L', 'start', '3'), wire('w2', 'start', '4', 'coil', 'A1'), wire('w3', 'coil', 'A2', 'neutral', 'N')];
    assert.deepEqual(analyzePLCWiring(wiringProject(nodes, edges)), []);
  });

  await t.test('flags an output coil chained directly in series with another coil', () => {
    const nodes = [device('supply', 'supply', 'L1'), device('a', 'coil', 'K1'), device('b', 'coil', 'K2'), device('neutral', 'neutral', 'N')];
    const edges = [wire('w1', 'supply', 'L', 'a', 'A1'), wire('w2', 'a', 'A2', 'b', 'A1'), wire('w3', 'b', 'A2', 'neutral', 'N')];
    const findings = analyzePLCWiring(wiringProject(nodes, edges));
    assert.equal(findings.filter(finding => finding.code === 'series-coils').length, 1);
    assert.deepEqual(findings.find(finding => finding.code === 'series-coils').deviceIds, ['a', 'b']);
  });

  await t.test('reports open coil terminals and missing rung rail termination', () => {
    const open = wiringProject([device('coil', 'coil', 'KM1')], []);
    assert.ok(analyzePLCWiring(open).some(finding => finding.code === 'coil-open-terminal'));
    const nodes = [device('supply', 'supply', 'L1'), device('coil', 'coil', 'KM1'), device('other', 'no', 'S1')];
    const edges = [wire('w1', 'supply', 'L', 'coil', 'A1'), wire('w2', 'coil', 'A2', 'other', '3')];
    const findings = analyzePLCWiring(wiringProject(nodes, edges));
    assert.ok(findings.some(finding => finding.code === 'rung-return-missing'));
  });

  await t.test('does not run ladder topology rules against a Function Block project', () => {
    assert.deepEqual(analyzePLCWiring({ version: 1, mode: 'fbd', nodes: [device('coil', 'coil', 'KM1')], edges: [] }), []);
  });

  await t.test('exposes the checks in the commissioning panel and clears stale findings after edits', () => {
    const commissioning = fs.readFileSync(new URL('../../../apps/voltpro-engineering-source/apps/voltpro-plc/src/Commissioning.tsx', import.meta.url), 'utf8');
    assert.match(commissioning, /analyzePLCWiring\(s\.project\)/);
    assert.match(commissioning, /Run Smart Wire checks/);
    assert.match(commissioning, /setWiring\(null\)/);
  });
});

