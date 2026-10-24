import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const nav = read("apps/voltpro-engineering-source/src/ui/site-shell.js");
const shell = read("apps/voltpro-engineering-source/workspace-shell.js");
const canvas = read("apps/voltpro-engineering-source/electrical-canvas.html");
const ai = read("apps/voltpro-engineering-source/voltpro-assistant.js");
const academy = read("apps/voltpro-engineering-source/index.html");

test("global bottom navigation keeps the required workspace order", () => {
  const block = nav.match(/for\(const \[icon,label,path\]of \[(.*?)\]\)\{const a=link/s)?.[1] || "";
  const labels = [...block.matchAll(/\['[^']*','([^']+)','[^']+'\]/g)].map(match => match[1]);
  assert.deepEqual(labels, ["VoltPro Simulator", "VoltPro PLC", "VoltPro ElectCAD", "Engineering Tools", "VoltPro Breadboard", "VoltPro Electrical Building"]);
});

test("main portfolio return link is same-tab and part of the persistent shared header", () => {
  assert.match(nav, /link\('← Main Site','https:\/\/hephzibahbehulah\.com\/'\)/);
  assert.match(nav, /brandGroup\.append\(brand,mainSite\)/);
  assert.doesNotMatch(nav.match(/const mainSite=.*?const nav=/)?.[0] || "", /target|data-vp-route/);
});

test("workspace switches reuse hidden tool iframes and update history client-side", () => {
  assert.match(shell, /const panels = new Map\(\)/);
  assert.match(shell, /frame\.src = rootPrefix \+ tool\.src/);
  assert.match(shell, /history\.pushState/);
  assert.match(shell, /element\.dataset\.active = String\(active\)/);
  for (const path of ["/simulator", "/plc", "/electcad", "/tools", "/breadboard", "/electrical"]) assert.ok(shell.includes('path: "' + path + '"'));
});


test("the academy sidebar includes the Electrical Building destination", () => {
  assert.ok(academy.includes('href="/electrical"'));
  assert.ok(academy.includes("VoltPro Electrical Building"));
});

test("the public /engineering alias keeps tool iframe URLs at the domain root", () => {
  assert.match(shell, /rootPrefix = location\\.hostname\\.startsWith/);
});

test("BuildingCAD includes measured grid, rulers, title block and editable properties", () => {
  for (const id of ["topRulerTicks", "leftRulerTicks", "planSurface", "componentLibrary", "title-block", "propertiesForm", "projectName", "projectDate", "titleScale", "drafter", "componentRoom", "componentVoltage"]) assert.ok(canvas.includes(id));
  assert.match(canvas, /200 mm \/ square/);
});

test("Adigun switches into architectural wiring context on the electrical route", () => {
  assert.match(ai, /building-electrical/);
  assert.match(ai, /Architectural\/Building Wiring/);
});
