const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const planner = require("../src/ui/ai-circuit-planner.js");
const T = require("../src/core/terminal-graph.js");

function validateDraft(draft) {
  const defs = Object.fromEntries(draft.components.map(c => [c.type, {pins:c.type==="motor"?7:c.type==="contactor"?12:c.type==="circuit-breaker-3p"?6:c.type==="threephase"?3:2}]));
  const window = {VoltProTerminalGraph:T,defs};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../platform/v5-runtime.js"),"utf8"), {
    window, structuredClone, Map, String, Number, Array, Boolean, Object
  });
  return T.build(window.VoltProV5Runtime.adapt({components:draft.components,wires:draft.wires})).validateTopology();
}

test("planner creates a reviewable low-voltage LED circuit", () => {
  const draft=planner.plan("Build a 5 V battery LED circuit with a 330 ohm resistor");
  assert.equal(draft.recognized,true);
  assert.equal(draft.template,"battery-led-resistor");
  assert.equal(draft.components.length,3);
  assert.equal(draft.wires.length,3);
  assert.equal(validateDraft(draft).valid,true);
});

test("planner creates phase-matched three-phase motor starter topology", () => {
  const draft=planner.plan("Create a three-phase motor starter with a 3-pole breaker, contactor and start pushbutton");
  assert.equal(draft.template,"three-phase-motor-starter");
  assert.equal(draft.components.length,6);
  assert.equal(draft.wires.length,12);
  const result=validateDraft(draft);
  assert.equal(result.valid,true,JSON.stringify(result.errors));
});

test("unsupported requests do not produce an insertable design", () => {
  const draft=planner.plan("Design a certified 1600 A switchboard for a hospital");
  assert.equal(draft.recognized,false);
  assert.equal(draft.components.length,0);
  assert.ok(draft.error);
});

test("a simple follow-up request can add a switch to the current simple draft", () => {
  const first=planner.plan("Build a battery resistor lamp circuit");
  const updated=planner.plan("Add a switch",first);
  assert.equal(updated.template,"battery-switch-lamp");
  assert.equal(updated.components.some(c=>c.type==="switch"),true);
  assert.equal(validateDraft(updated).valid,true);
});

test("follow-up edits change an existing low-voltage source without rebuilding the design", () => {
  const first=planner.plan("Build a 5 V battery LED circuit with a 330 ohm resistor");
  const updated=planner.plan("Change it to 12 V",first);
  assert.equal(updated.template,first.template);
  assert.equal(updated.components.find(c=>c.type==="battery").props.voltage,12);
  assert.equal(updated.wires.length,first.wires.length);
  assert.equal(validateDraft(updated).valid,true);
});

test("follow-up edits change resistor values in the existing draft", () => {
  const first=planner.plan("Build a battery LED circuit with a 330 ohm resistor");
  const updated=planner.plan("Change the resistor to 220 ohms",first);
  assert.equal(updated.components.find(c=>c.type==="resistor").props.resistance,220);
  assert.equal(updated.components.length,first.components.length);
  assert.equal(validateDraft(updated).valid,true);
});
