const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../platform/canonical-project.js");

function sample() {
  return {
    format: P.FORMAT, formatVersion: P.VERSION,
    metadata: { id: "demo", name: "Test circuit" },
    workspace: { mode: "schematic", grid: 20 },
    devices: [
      P.createDevice({ id: "V1", type: "battery", terminals: [{ id: "PLUS", label: "+", type: "electrical", domain: "dc" }, { id: "MINUS", label: "-", type: "electrical", domain: "dc" }] }),
      P.createDevice({ id: "R1", type: "resistor", terminals: [{ id: "1", label: "1", type: "electrical", domain: "dc" }, { id: "2", label: "2", type: "electrical", domain: "dc" }] })
    ],
    wires: [
      { id: "W1", from: "V1:PLUS", to: "R1:1", label: "L+", colour: "#ff0000", routing: [{ x: 20, y: 20 }], domain: "dc", electrical: {} },
      { id: "W2", from: "R1:2", to: "V1:MINUS", label: "L-", colour: "#000000", routing: [], domain: "dc", electrical: {} }
    ],
    nets: { policy: "derived", snapshot: null },
    panel: { rails: [], items: [] }, plc: { programs: [], ioMappings: [] },
    simulation: { configuration: { mode: "dc" }, resultsMetadata: null }, extensions: {}
  };
}

test("create, serialize and load canonical project", () => {
  const p = sample();
  assert.equal(P.validate(p).valid, true);
  const text = P.serialize(p);
  const loaded = P.deserialize(text);
  assert.equal(loaded.devices.length, 2);
  assert.equal(loaded.wires[0].from, "V1:PLUS");
  assert.deepEqual(P.resolveNets(loaded), P.resolveNets(p));
});

test("stable terminal keys use device and local terminal identity", () => {
  assert.equal(P.terminalKey("KM1", "A1"), "KM1:A1");
  assert.equal(P.terminalKey("KM1", "13"), "KM1:13");
  assert.throws(() => P.terminalKey("bad id", "A1"), /stable id/);
});

test("legacy components and numeric a/b endpoints migrate explicitly", () => {
  const legacy = {
    version: 1, name: "Old project", vendorExtra: { retained: true },
    components: [
      { id: "V1", type: "battery", props: { voltage: 12 }, pins: ["V1:0", "V1:1"] },
      { id: "R1", type: "resistor", props: { resistance: 100 }, pins: ["R1:0", "R1:1"] }
    ],
    wires: [{ a: "V1:0", b: "R1:0" }, { a: "R1:1", b: "V1:1" }]
  };
  const p = P.migrate(legacy);
  assert.equal(p.metadata.name, "Old project");
  assert.equal(p.devices[0].parameters.voltage, 12);
  assert.equal(p.wires[0].from, "V1:0");
  assert.equal(p.wires[0].to, "R1:0");
  assert.deepEqual(p.extensions.preservedUnknownFields.vendorExtra, { retained: true });
  assert.equal(P.validate(p).valid, true, JSON.stringify(P.validate(p).errors));
});

test("duplicate device and wire IDs are rejected", () => {
  const p = sample();
  p.devices[1].id = "V1";
  p.wires[1].id = "W1";
  const codes = P.validate(p).errors.map(e => e.code);
  assert.ok(codes.includes("DUPLICATE_DEVICE_ID"));
  assert.ok(codes.includes("DUPLICATE_WIRE_ID"));
});

test("dangling terminals, unsupported domains and malformed routing are rejected", () => {
  const p = sample();
  p.wires[0].to = "R9:99";
  p.wires[0].domain = "quantum";
  p.wires[0].routing = [{ x: NaN, y: 2 }];
  const codes = P.validate(p).errors.map(e => e.code);
  assert.ok(codes.includes("MISSING_TERMINAL"));
  assert.ok(codes.includes("UNSUPPORTED_DOMAIN"));
  assert.ok(codes.includes("WIRE_ROUTING_POINT"));
});

test("net resolution is deterministic and derived, not stored as authority", () => {
  const p = sample();
  p.simulation.nodeVoltages = { V1: 12 };
  const a = P.resolveNets(p), b = P.resolveNets(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(a, b);
  assert.equal(p.nets.policy, "derived");
  assert.equal(P.serialize(p).includes("nodeVoltages"), false);
});

test("unknown future canonical version fails rather than being downgraded", () => {
  assert.throws(() => P.migrate({ format: "voltpro", formatVersion: 2, devices: [], wires: [] }), /Unsupported future/);
});
