import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { buildIndustrialMachineProject } from '../src/machine-control-project.mjs';
import { connectablePins, terminalId } from '../src/terminal-geometry.mjs';

function assertConnected(doc) {
  const partById = new Map(doc.sheets.flatMap(sheet => sheet.parts.map(part => [part.id, part])));
  for (const sheet of doc.sheets) {
    for (const wire of sheet.wires) {
      assert.ok(wire.startTerminalId, `${wire.id} has a start terminal`);
      assert.ok(wire.endTerminalId, `${wire.id} has an end terminal`);
      const [startId, startIndex] = wire.startTerminalId.match(/^pin:(.+):(\d+)$/).slice(1);
      const [endId, endIndex] = wire.endTerminalId.match(/^pin:(.+):(\d+)$/).slice(1);
      const start = connectablePins(partById.get(startId))[Number(startIndex)];
      const end = connectablePins(partById.get(endId))[Number(endIndex)];
      assert.deepEqual({ x: wire.x1, y: wire.y1 }, start, `${wire.id} starts at its referenced pin`);
      assert.deepEqual({ x: wire.x2, y: wire.y2 }, end, `${wire.id} ends at its referenced pin`);
      const bend = { x: wire.x2, y: wire.y1 };
      assert.ok(wire.x1 === bend.x || wire.y1 === bend.y);
      assert.ok(bend.x === wire.x2 || bend.y === wire.y2);
      assert.equal(terminalId(startId, Number(startIndex)), wire.startTerminalId);
    }
  }
}

test('industrial machine-control starter has three sheets and terminal-resolved orthogonal wiring', () => {
  const project = buildIndustrialMachineProject();
  assert.equal(project.schemaVersion, 3);
  assert.equal(project.sheets.length, 3);
  assert.deepEqual(project.sheets.map(sheet => sheet.name), [
    '01 — Three-phase motor power', '02 — 24 V control concept', '03 — PLC feedback interface'
  ]);
  assert.ok(project.sheets[0].parts.some(part => part.type === 'circuit-breaker-3p'));
  assert.ok(project.sheets[0].parts.some(part => part.type === 'contactor-3p'));
  assert.ok(project.sheets[0].parts.some(part => part.type === 'thermal-relay'));
  assertConnected(project);
});

test('document decoder accepts stable terminal references and rejects a reference to a missing terminal', async () => {
  const source = fs.readFileSync(new URL('../src/editor-model.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const dir = path.dirname(new URL('../src/editor-model.ts', import.meta.url).pathname);
  const tempFile = path.join(dir, `.editor-model-test-${process.pid}-${Date.now()}.mjs`);
  fs.writeFileSync(tempFile, js);
  try {
    const { decodeDocument, netGroups, wireCrossings } = await import(pathToFileURL(tempFile).href);
    const project = decodeDocument(buildIndustrialMachineProject());
    assert.equal(project.schemaVersion, 3);
    assert.equal(decodeDocument({ schemaVersion: 2, projectName: 'Legacy', activeSheetId: 'old', sheets: [{ id: 'old', name: 'Old sheet', parts: [], wires: [] }] }).schemaVersion, 3);
    assert.ok(netGroups(project.sheets[0]).length > 0);
    const freePointRoute = decodeDocument({ schemaVersion: 3, projectName: 'Free-point wire route', activeSheetId: 's1', sheets: [{
      id: 's1', name: 'Route', parts: [{ id: 'r1', type: 'resistor', x: 100, y: 100, ref: 'R1', value: '1 kΩ' }], wires: [
        { id: 'w1', x1: 62, y1: 100, x2: 100, y2: 140, startTerminalId: 'pin:r1:0' },
        { id: 'w2', x1: 100, y1: 140, x2: 138, y2: 100, endTerminalId: 'pin:r1:1' }
      ]
    }] });
    assert.ok(netGroups(freePointRoute.sheets[0]).some(group => group.includes('pin:r1:0') && group.includes('pin:r1:1')), 'free route vertices must preserve connectivity between wire segments');
    const linked = decodeDocument({ schemaVersion: 3, projectName: 'Cross reference', activeSheetId: 's1', sheets: [
      { id: 's1', name: 'Power', parts: [{ id: 'x1', type: 'off-page-connector', x: 40, y: 60, ref: 'X1', value: 'Off-page connector', targetSheetId: 's2' }], wires: [] },
      { id: 's2', name: 'Control', parts: [], wires: [] }
    ] });
    assert.equal(linked.sheets[0].parts[0].targetSheetId, 's2');
    const brokenCrossReference = structuredClone(linked);
    brokenCrossReference.sheets[0].parts[0].targetSheetId = 'missing-sheet';
    assert.throws(() => decodeDocument(brokenCrossReference), /Invalid component/);
    assert.deepEqual(wireCrossings([
      { id: 'horizontal', x1: 0, y1: 10, x2: 20, y2: 10 },
      { id: 'vertical', x1: 10, y1: 0, x2: 10, y2: 20 }
    ]), [{ x: 10, y: 10, kind: 'bridge' }]);
    assert.deepEqual(wireCrossings([
      { id: 'branch', x1: 10, y1: 0, x2: 10, y2: 10 },
      { id: 'horizontal', x1: 0, y1: 10, x2: 20, y2: 10 }
    ]), [{ x: 10, y: 10, kind: 'junction' }]);
    const broken = structuredClone(project);
    broken.sheets[0].wires[0].startTerminalId = 'pin:missing:99';
    assert.throws(() => decodeDocument(broken), /Invalid wire or terminal connection/);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
});
