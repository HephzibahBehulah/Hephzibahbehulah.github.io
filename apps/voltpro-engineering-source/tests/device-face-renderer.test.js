const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const T = require("../src/core/terminal-graph.js");

test("three-pole breaker face shows all six terminals and does not invent dimensions", () => {
  const window={VoltProTerminalGraph:T};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../src/rendering/device-face.js"),"utf8"),{window});
  const svg=window.VoltProDeviceFace.face({id:"QF1",type:"circuit-breaker-3p"});
  for(const label of ["L1","L2","L3","T1","T2","T3"])assert.ok(svg.includes(label),"missing "+label);
  assert.ok(svg.includes("DIMENSIONS NOT VERIFIED"));
});

test("verified manufacturer dimensions are shown only when explicitly marked verified", () => {
  const window={VoltProTerminalGraph:T};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../src/rendering/device-face.js"),"utf8"),{window});
  const unknown=window.VoltProDeviceFace.face({id:"KM1",type:"contactor",dimensions:{width:45,height:90}});
  const verified=window.VoltProDeviceFace.face({id:"KM1",type:"contactor",dimensions:{width:45,height:90,verified:true}});
  assert.ok(unknown.includes("DIMENSIONS NOT VERIFIED"));
  assert.ok(verified.includes("W 45 × H 90 mm"));
});

test("device-face text is escaped before insertion into SVG", () => {
  const window={VoltProTerminalGraph:T};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../src/rendering/device-face.js"),"utf8"),{window});
  const svg=window.VoltProDeviceFace.face({id:'<script>alert("x")</script>',type:"unknown"});
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;"));
});
