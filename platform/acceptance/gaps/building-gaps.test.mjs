import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBuildingDocument, recoverBuildingDocument, validateBuildingDocument } from '../../../apps/voltpro-engineering-source/building-document.mjs';
import { materialSchedule, reviewInstallation } from '../../../apps/voltpro-engineering-source/building-tools.mjs';
import { buildingCircuitCrossReferences, assignMissingBuildingReferences } from '../../../apps/voltpro-engineering-source/building-references.mjs';
import { appendBuildingAudit, loadBuildingAudit, makeBuildingAuditEntry, saveBuildingAudit, snapshotBuildingAudit } from '../../../apps/voltpro-engineering-source/building-audit.mjs';
import { rebuildRoomWalls, routeWireOnArchitecture, routeGeometryErrors, projectToWall } from '../../../apps/voltpro-engineering-source/building-architecture.mjs';

test.todo("accept.building.drc.profile-protection-and-pe");
test("accept.building.circuits.cable-tags-and-board-links", () => {
  const project = createBuildingDocument({ floors: 2 });
  project.nodes = [
    { id: 'DB1', type: 'distribution-board-12-way', tag: '', name: 'Main board', floor: 1, x: 1, y: 0, quantity: 1, spec: {} },
    { id: 'QF1', type: 'mcb-b-16a-1p', tag: '', name: 'Socket circuit breaker', floor: 1, x: 2, y: 0, quantity: 1, spec: {} },
    { id: 'X1', type: 'schuko-socket', tag: 'X-KEEP', name: 'Socket', floor: 1, x: 3, y: 0, quantity: 1, spec: {} },
  ];
  project.circuits = [{ id: 'C1', label: 'Workshop sockets', floor: 1, boardId: 'DB1', overcurrentDeviceId: 'QF1', rcdId: null }];
  project.wires = [
    { id: 'route-a', from: 'DB1', to: 'QF1', circuit: 'C1', floor: 1, cableId: 'cable-NYM-J-3-1.5', routePoints: [{ x: 1, y: 0 }, { x: 2, y: 0 }] },
    { id: 'route-b', from: 'QF1', to: 'X1', circuit: 'C1', floor: 1, cableId: 'cable-NYM-J-3-1.5', routePoints: [{ x: 2, y: 0 }, { x: 3, y: 0 }] },
  ];
  assert.deepEqual(assignMissingBuildingReferences(project, type => type === 'distribution-board-12-way' ? 'DB' : 'QF'), { assignedEquipment: 2, assignedRoutes: 2 });
  assert.deepEqual(project.nodes.map(node => node.tag), ['DB-001', 'QF-001', 'X-KEEP']);
  assert.deepEqual(project.wires.map(wire => wire.tag), ['CBL-001', 'CBL-002']);
  assert.deepEqual(assignMissingBuildingReferences(project, () => 'EQ'), { assignedEquipment: 0, assignedRoutes: 0 }, 'reference assignment is idempotent');
  assert.deepEqual(buildingCircuitCrossReferences(project), [{ circuit: 'C1', label: 'Workshop sockets', floor: 1, board: 'DB-001', overcurrentDevice: 'QF-001', rcd: 'Unassigned', cableTags: ['CBL-001', 'CBL-002'] }]);
  const ui = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../apps/voltpro-engineering-source/electrical-canvas.js'), 'utf8');
  assert.match(ui, /assignMissingBuildingReferences\(state/);
  assert.match(ui, /'cableTags'/);
});
test("accept.building.bom.materials-and-route-lengths", () => {
  const project = createBuildingDocument({ floors: 2, gridMillimetres: 200 });
  project.nodes = [
    { id: 'DB1', type: 'distribution-board-12-way', name: 'Ground floor board', tag: 'DB-GF', x: 1, y: 0, floor: 1, quantity: 1, spec: {} },
    { id: 'X1', type: 'schuko-socket', name: 'Workshop outlet', tag: 'X1', x: 1, y: 0, floor: 1, quantity: 2, spec: { loadW: 150 } },
    { id: 'X2', type: 'schuko-socket', name: 'Office outlet', tag: 'X2', x: 1, y: 0, floor: 2, quantity: 1, spec: { loadW: 150 } },
  ];
  project.wires = [
    { id: 'W-GF', from: 'DB1', to: 'X1', floor: 1, cableId: 'cable-NYM-J-3-1.5', routePoints: [{ x: 1, y: 0 }, { x: 4, y: 0 }], runs: 2, sparePercent: 10 },
    { id: 'W-RISER', from: 'DB1', to: 'X2', floor: 1, cableId: 'cable-NYM-J-3-1.5', verticalRiseM: null, runs: 1 },
  ];
  const rows = materialSchedule(project);
  const sockets = rows.find(row => row.name.includes('socket outlet') && row.floor === 1);
  const measuredCable = rows.find(row => row.name.includes('NYM-J') && row.floor === 1 && !row.unmeasured);
  const unresolvedCable = rows.find(row => row.name.includes('NYM-J') && row.unmeasured);
  assert.equal(sockets.quantity, 2);
  assert.equal(sockets.unit, 'ea');
  assert.equal(measuredCable.quantity, 1.32, '3 × 0.2 m × two runs × 1.10 spare');
  assert.equal(unresolvedCable.quantity, 0);
  assert.equal(unresolvedCable.basis, 'Vertical length unresolved');
  assert.ok(rows.some(row => row.floor === 2 && row.name.includes('socket outlet')));
  assert.ok(rows.every(row => typeof row.spec === 'string' && typeof row.basis === 'string'));
});
test("accept.building.floors.rooms.sheet-navigation", () => {
  const project = createBuildingDocument({ floors: 2, activeFloor: 2 });
  project.rooms = [
    { id: 'room-ground', name: 'Workshop', x: 1, y: 0, width: 20, height: 15, floor: 1 },
    { id: 'room-upper', name: 'Office', x: 1, y: 0, width: 10, height: 8, floor: 2 },
  ];
  project.nodes = [
    { id: 'device-ground', type: 'schuko-socket', tag: 'X1', name: 'Workshop socket', room: 'Workshop', voltage: '230 V AC', mountingHeight: 300, x: 3, y: 4, floor: 1 },
    { id: 'device-upper', type: 'schuko-socket', tag: 'X2', name: 'Office socket', room: 'Office', voltage: '230 V AC', mountingHeight: 300, x: 3, y: 4, floor: 2 },
  ];
  assert.equal(validateBuildingDocument(project).ok, true);
  const restored = recoverBuildingDocument(JSON.parse(JSON.stringify(project)));
  assert.equal(restored.metadata.floors, 2);
  assert.equal(restored.metadata.activeFloor, 2);
  assert.deepEqual(restored.rooms.map(room => room.floor), [1, 2]);
  assert.deepEqual(restored.nodes.map(device => device.floor), [1, 2]);
  assert.equal(validateBuildingDocument({ ...restored, nodes: [{ ...restored.nodes[1], floor: 3 }] }).errors.some(error => /floor must reference a declared storey/.test(error)), true);
  assert.equal(validateBuildingDocument({ ...restored, rooms: [{ ...restored.rooms[0], floor: 0 }] }).errors.some(error => /floor must reference a declared storey/.test(error)), true);
  assert.equal(validateBuildingDocument({ ...restored, metadata: { ...restored.metadata, activeFloor: 3 } }).errors.some(error => /Active floor must reference a declared storey/.test(error)), true);

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../apps/voltpro-engineering-source');
  const canvas = fs.readFileSync(path.join(root, 'electrical-canvas.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'electrical-canvas.html'), 'utf8');
  assert.match(html, /<select id="activeFloor" aria-label="Active floor"><\/select>/);
  assert.match(canvas, /function floorOptions\(current\)/);
  assert.match(canvas, /\$\('activeFloor'\)\.addEventListener\('change'/);
  assert.match(canvas, /state\.rooms\.filter\(room=>\(room\.floor\|\|1\)===state\.metadata\.activeFloor\)/);
  assert.match(canvas, /state\.nodes\.filter\(node=>\(node\.floor\|\|1\)===state\.metadata\.activeFloor/);
});
test("accept.building.history.drawing-audit", () => {
  const before = createBuildingDocument({ name: 'Workshop plan' });
  const after = structuredClone(before);
  after.nodes.push({ id: 'device-secret-value', name: 'Private device description', type: 'schuko-socket', x: 2, y: 3, floor: 1 });
  const at = '2026-10-31T10:00:00.000Z';
  const first = makeBuildingAuditEntry(snapshotBuildingAudit(before), snapshotBuildingAudit(after), { id: 'audit-entry-0001', at });
  assert.equal(first.project, 'Workshop plan');
  assert.equal(first.summary, '1 object added');
  assert.doesNotMatch(JSON.stringify(first), /device-secret-value|Private device description/);
  assert.equal(makeBuildingAuditEntry(snapshotBuildingAudit(after), snapshotBuildingAudit(after)), null);
  const edited = structuredClone(after); edited.nodes[0].x = 4;
  const second = makeBuildingAuditEntry(snapshotBuildingAudit(after), snapshotBuildingAudit(edited), { id: 'audit-entry-0002', at: '2026-10-31T10:00:01.000Z' });
  const coalesced = appendBuildingAudit([first], second, Date.parse(second.at));
  assert.equal(coalesced.length, 1);
  assert.equal(coalesced[0].changes.added, 1);
  assert.equal(coalesced[0].changes.modified, 1);
  const values = new Map(), storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(saveBuildingAudit(storage, coalesced), true);
  assert.equal(loadBuildingAudit(storage)[0].summary, '1 object added, 1 changed');
  const many = Array.from({ length: 305 }, (_, index) => ({ ...first, id: `audit-entry-${String(index).padStart(5, '0')}`, at: new Date(Date.parse(at) + index * 3000).toISOString() }));
  assert.equal(appendBuildingAudit(many, null).length, 300);
  const html = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../apps/voltpro-engineering-source/electrical-canvas.html'), 'utf8');
  const ui = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../apps/voltpro-engineering-source/electrical-canvas.js'), 'utf8');
  assert.match(html, /data-command="history">Drawing audit history/);
  assert.match(ui, /case "history": showDrawingAudit\(\)/);
  assert.match(ui, /saveBuildingAudit\(localStorage, drawingAudit\)/);
});
test("accept.building.wiring.wall-routes.room-requirements", () => {
  const project = createBuildingDocument();
  project.rooms = [{ id: 'room-main', name: 'Main room', x: 1, y: 1, width: 10, height: 5, floor: 1 }];
  rebuildRoomWalls(project);
  const topWall = project.walls.find(wall => wall.floor === 1 && wall.a.y === 1 && wall.b.y === 1);
  assert.ok(topWall, 'room geometry generates routed wall segments');
  project.openings = [{ id: 'door-main', wallId: topWall.id, type: 'door', offsetMM: 600, widthMM: 800, heightMM: 2100, sillMM: 0 }];
  project.nodes = [
    { id: 'source', type: 'distribution-board-12-way', name: 'Source', x: 2, y: 1, floor: 1, room: 'Main room', mountingHeight: 2000 },
    { id: 'load', type: 'schuko-socket', name: 'Load', x: 10, y: 1, floor: 1, room: 'Main room', mountingHeight: 300 },
  ];
  const wire = { id: 'route', from: 'source', to: 'load', routeMode: 'wall', routingHeightMM: 2000 };
  routeWireOnArchitecture(project, wire);
  assert.deepEqual(routeGeometryErrors(project, wire), []);
  assert.ok(wire.routePoints.some(point => point.y > 1), 'the path avoids the door by using the connected wall network');
  for (const point of wire.routePoints) assert.ok(project.walls.some(wall => projectToWall(point, wall, project.gridMillimetres).distanceMM < 1e-5), 'each generated path point lies on a wall');
  const incomplete = { ...wire, routingHeightMM: undefined };
  assert.match(reviewInstallation({ ...project, wires: [incomplete] }).issues.find(issue => issue.code === 'routing-height')?.message || '', /routing height/);
  project.nodes[1].room = '';
  assert.ok(validateBuildingDocument(project).warnings.some(message => /assign a room/.test(message)), 'unassigned equipment is flagged before issue');
});
