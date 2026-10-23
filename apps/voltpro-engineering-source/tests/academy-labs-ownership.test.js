"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Virtual Labs has one deduplicated list with a matching activity for each ID", () => {
  const script = read("script.js");
  assert.doesNotMatch(script, /expansionLabs|labs\.push\(\.\.\.expansionLabs\)/);
  const block = script.slice(script.indexOf("var labs=["), script.indexOf("const legacyLabIds"));
  const ids = [...block.matchAll(/id:"([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 7);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["ohm", "safety", "fault-open", "inspection", "meter", "diagram", "fault2"]) {
    assert.ok(ids.includes(id), "missing lab: " + id);
    assert.ok(script.includes('id==="' + id + '"'), "missing lab handler: " + id);
  }
  assert.match(script, /function checkOhmLab\(/);
  assert.match(script, /function checkSafetyLab\(/);
  assert.match(script, /function checkOpenFaultLab\(/);
});

test("Reference Library owns definitions, formulas and guidance—not a duplicate calculator", () => {
  const script = read("script.js");
  const reference = script.slice(script.indexOf("function expandedReference(){"), script.indexOf("function expandedTools(){"));
  assert.match(reference, /Formula Library/);
  assert.match(reference, /Standards & Guidance/);
  assert.match(reference, /href="engineering\.html"/);
  assert.match(reference, /href="academy-workbench\.html"/);
  assert.doesNotMatch(reference, /calculatorHTML\(\)|Ohm Calculator/);
});

test("legacy lab completion state migrates without discarding completed exercises", () => {
  const script = read("script.js");
  assert.match(script, /const legacyLabIds=\{lab1:"ohm",lab2:"safety",lab3:"fault-open",lab4:"inspection"\}/);
  assert.match(script, /new Set\(\(state\.labDone\|\|\[\]\)\.map/);
  assert.equal((script.match(/function finishExpandedLab\(/g) || []).length, 1);
});
