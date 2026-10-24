import test from "node:test";
import assert from "node:assert/strict";
import { columnLabel, routeOrthogonal, snapGrid } from "./electrical-engine.mjs";

test("grid positions snap to the nearest 200 mm model square", () => {
  assert.equal(snapGrid(0), 0);
  assert.equal(snapGrid(35), 1);
  assert.equal(snapGrid(60), 3);
  assert.throws(() => snapGrid(20, 0), /positive/);
});

test("coordinate ruler labels extend beyond Z", () => {
  assert.deepEqual([1, 26, 27, 52, 53].map(columnLabel), ["A", "Z", "AA", "AZ", "BA"]);
  assert.throws(() => columnLabel(0), /starts at 1/);
});

test("wire routes contain only horizontal and vertical grid-aligned segments", () => {
  const route = routeOrthogonal({ x: 2, y: 1 }, { x: 9, y: 8 });
  assert.deepEqual(route, [{ x: 2, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 8 }, { x: 9, y: 8 }]);
  for (let index = 1; index < route.length; index++) {
    const dx = route[index].x - route[index - 1].x;
    const dy = route[index].y - route[index - 1].y;
    assert.ok(dx === 0 || dy === 0, "each cable segment must be orthogonal");
  }
});
