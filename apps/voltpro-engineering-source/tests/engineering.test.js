"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function calculatorHarness(values = {}) {
  const elements = {};
  for (const [id, value] of Object.entries(values)) elements[id] = { value: String(value), textContent: "" };
  const document = { getElementById(id) { return elements[id] || (elements[id] = { value: "", textContent: "" }); } };
  const calculators = new Function("document", read("engineering.js") + "\nreturn { ohm, power, drop, three, cable, protect, motor };")(document);
  return { calculators, elements };
}

test("engineering calculator script parses", () => {
  assert.doesNotThrow(() => new Function(read("engineering.js")));
});

test("Ohm's Law calculates the missing current when voltage and resistance are supplied", () => {
  const { calculators, elements } = calculatorHarness({ u: 12, i: "", r: 100 });
  calculators.ohm();
  assert.match(elements.ohmOut.textContent, /I = 0\.12 A/);
});

test("voltage-drop percentage uses its own supply-voltage field", () => {
  const { calculators, elements } = calculatorHarness({ vi: 10, vl: 20, va: 1.5, vk: 0.0175, vv: 230, cv: 400 });
  calculators.drop();
  assert.match(elements.dropOut.textContent, /2\.03 %/);
});

test("cable exercise reports the first listed size meeting the allowed drop", () => {
  const { calculators, elements } = calculatorHarness({ ci: 16, cl: 25, cv: 230, cp: 3 });
  calculators.cable();
  assert.match(elements.cableOut.textContent, /2\.5 mm²/);
});

test("protection check refuses missing inputs rather than reporting a pass", () => {
  const { calculators, elements } = calculatorHarness({ ib: 12, in: "", iz: 20 });
  calculators.protect();
  assert.match(elements.protectOut.textContent, /Enter non-negative Ib/);
});

test("engineering page supplies an independent voltage-drop reference voltage", () => {
  const html = read("engineering.html");
  assert.match(html, /id="vv" type="number" value="230"/);
  assert.match(html, /Conductor resistivity coefficient/);
});
