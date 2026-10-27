import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const counts = { battery: 2, resistor: 2, lamp: 2, switch: 2, fuse: 2, breaker: 2, led: 2, capacitor: 2, inductor: 2, acsource: 2, diode: 2, heater: 2, buzzer: 2, terminal: 2, relay: 8, multimeter: 2, oscilloscope: 2, threephase: 4, "circuit-breaker-3p": 6, contactor: 12, "overload-relay": 10, motor: 7, ground: 1, "plc-controller": 13 };
const S = { components: [], wires: [], history: [], future: [], mode: "schematic" };
const document = { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; } };
const context = vm.createContext({ console, document, defs: Object.fromEntries(Object.entries(counts).map(([type,pins]) => [type,{pins,props:{}}])), S });
context.window = context;
context.VoltProUI = { render() {} };
vm.runInContext(fs.readFileSync(path.join(app, "platform/motor-system.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(app, "platform/demo-library.js"), "utf8"), context);

test("all 100 guided demo variants load with terminal-valid circuit wiring", () => {
  const demos = context.VoltProDemoLibrary.demos();
  assert.equal(demos.length, 100);
  const summary = {};
  for (const demo of demos) {
    S.components = []; S.wires = [];
    context.VoltProDemoLibrary.load(demo);
    assert.ok(S.components.length >= 2, demo.title + " must include working components");
    assert.ok(S.wires.length >= S.components.length - 1, demo.title + " must include a connected circuit");
    const pins = new Map(S.components.map(c => [c.id, counts[c.type] || 2]));
    for (const wire of S.wires) for (const endpoint of [wire.a, wire.b]) {
      const [id, pin] = String(endpoint).split(":");
      assert.ok(pins.has(id), demo.title + " references missing component " + id);
      assert.ok(Number(pin) >= 0 && Number(pin) < pins.get(id), demo.title + " references missing terminal " + endpoint);
    }
    summary[demo.wiring] = (summary[demo.wiring] || 0) + 1;
  }
  assert.equal(summary["motor-system"], 15);
  assert.equal(summary["relay-control"], 10);
  assert.equal(summary["parallel-meter"], 5);
  assert.equal(summary["parallel-scope"], 5);
  assert.equal(summary["parallel-loads"], 5);
});
