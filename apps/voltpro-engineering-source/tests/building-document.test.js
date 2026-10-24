const test = require('node:test');
const assert = require('node:assert/strict');

test('BuildingCAD creates an explicit metric document and records unassessed safety checks', async () => {
  const { createBuildingDocument, validateBuildingDocument } = await import('../building-document.mjs');
  const doc = createBuildingDocument({ name: 'Test plan' });
  assert.equal(doc.format, 'voltpro.buildingcad');
  assert.equal(doc.units, 'mm');
  assert.equal(doc.gridMillimetres, 200);
  const report = validateBuildingDocument(doc);
  assert.equal(report.ok, true);
  assert.ok(report.notAssessed.includes('DIN EN 61082-1 clause-level document conformity'));
  assert.ok(report.notAssessed.includes('DIN VDE 0100 installation design'));
});

test('BuildingCAD migrates v1 projects without losing nodes or wires', async () => {
  const { recoverBuildingDocument } = await import('../building-document.mjs');
  const old = { format: 'voltpro-buildingcad', version: 1, gridMillimetres: 200, metadata: { name: 'Legacy' }, nodes: [{ id: 'B1', type: 'wall-switch', x: 2, y: 3, name: 'Switch' }], wires: [] };
  const migrated = recoverBuildingDocument(old);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.metadata.name, 'Legacy');
  assert.equal(migrated.nodes[0].id, 'B1');
  assert.equal(migrated.nodes[0].voltage, '230 V AC');
});

test('BuildingCAD rejects wrong formats and forward-incompatible project versions', async () => {
  const { recoverBuildingDocument } = await import('../building-document.mjs');
  assert.throws(() => recoverBuildingDocument({ format: 'other', version: 1, nodes: [], wires: [] }), /not a VoltPro/);
  assert.throws(() => recoverBuildingDocument({ format: 'voltpro.buildingcad', version: 99, nodes: [], wires: [] }), /Unsupported/);
});

test('BuildingCAD validation catches duplicate references, dangling links, and power/data joins', async () => {
  const { createBuildingDocument, validateBuildingDocument } = await import('../building-document.mjs');
  const doc = createBuildingDocument();
  doc.nodes = [
    { id: 'B1', type: 'schuko-socket', tag: 'VP-001', name: 'Socket 1', room: 'Kitchen', voltage: '230 V AC', mountingHeight: 0, x: 2, y: 3 },
    { id: 'B2', type: 'data-point', tag: 'VP-001', name: 'Data 1', room: 'Kitchen', voltage: 'SELV / data', mountingHeight: 0, x: 4, y: 3 }
  ];
  doc.wires = [{ id: 'W1', from: 'B1', to: 'B2' }, { id: 'W2', from: 'B1', to: 'MISSING' }];
  const report = validateBuildingDocument(doc);
  assert.equal(report.ok, false);
  assert.match(report.errors.join(' '), /duplicate reference/);
  assert.match(report.errors.join(' '), /cannot share a connection/);
  assert.match(report.errors.join(' '), /endpoint does not exist/);
});

test('BuildingCAD connection router emits only grid-aligned orthogonal segments', async () => {
  const { routeBuildingConnection } = await import('../building-document.mjs');
  for (const [start, end] of [[{ x: 1, y: 1 }, { x: 7, y: 8 }], [{ x: 8, y: 2 }, { x: 3, y: 6 }]]) {
    const path = routeBuildingConnection(start, end);
    assert.deepEqual(path[0], start);
    assert.deepEqual(path.at(-1), end);
    for (let i = 1; i < path.length; i++) assert.ok(path[i].x === path[i - 1].x || path[i].y === path[i - 1].y);
  }
});
