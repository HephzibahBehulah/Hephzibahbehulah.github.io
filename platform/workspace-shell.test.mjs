import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const nav = read("apps/voltpro-engineering-source/src/ui/site-shell.js");
const shell = read("apps/voltpro-engineering-source/workspace-shell.js");
const shellHtml = read("apps/voltpro-engineering-source/workspace-shell.html");
const assistantTheme = read("apps/voltpro-engineering-source/voltpro-hb-theme.css");
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

test("Electrical Building uses its dedicated architectural plan editor", () => {
  assert.ok(shell.includes('path: "/electrical", title: "VoltPro Electrical Building", src: "/electrical-canvas.html?vp_embed=1"'));
  assert.match(canvas, /BuildingCAD/);
  assert.match(read("apps/voltpro-engineering-source/electrical-canvas.js"), /validateBuildingDocument/);
  assert.match(read("apps/voltpro-engineering-source/src/ui/account.js"), /schemaVersion===2\|\|item\.data\?\.schemaVersion===3/);
});

test("the public /engineering alias keeps tool iframe URLs at the domain root", () => {
  assert.ok(shell.includes("rootPrefix = location.hostname.startsWith"));
});


test("persistent workspace shell loads the engineering assistant styles", () => {
  assert.ok(shellHtml.includes("voltpro-hb-theme.css?v="));
  assert.ok(assistantTheme.includes("display:none;flex-direction:column"));
});

test("assistant launcher and chat panel clear the fixed bottom workspace navigation", () => {
  assert.ok(assistantTheme.includes("bottom:calc(82px + env(safe-area-inset-bottom))"));
  assert.ok(assistantTheme.includes("bottom:calc(154px + env(safe-area-inset-bottom))"));
});

test("BuildingCAD includes measured grid, rulers, title block and editable properties", () => {
  for (const id of ["topRulerTicks", "leftRulerTicks", "planSurface", "componentLibrary", "title-block", "propertiesForm", "projectName", "documentNumber", "revision", "projectDate", "titleScale", "drafter", "componentTag", "componentRoom", "componentVoltage"]) assert.ok(canvas.includes(id));
  assert.match(canvas, /200 mm \/ square/);
});

test("BuildingCAD menus have live document, edit, draw, validation and layer commands", () => {
  for (const action of ["new", "open", "save", "export", "print", "undo", "redo", "delete", "select", "room", "wire", "validate", "references", "schedule", "fit"]) assert.ok(canvas.includes(`data-command="${action}"`));
  const source = read("apps/voltpro-engineering-source/electrical-canvas.js");
  for (const handler of ["function validate()", "function openProject(", "function undo()", "function redo()", "function addRoom(", "function showSchedule()"]) assert.ok(source.includes(handler));
});

test("PLC command menus are wired to project, editing, draw, validation, simulation, and view handlers", () => {
  const menu = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/CommandMenus.tsx");
  const app = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/App.tsx");
  for (const item of ["File", "Edit", "Draw", "Tools", "View", "New control project", "Open project JSON", "Validate program", "On-delay timer"]) assert.ok(menu.includes(item));
  for (const prop of ["onNew=", "onOpen=", "onSave=", "onExport=", "onUndo=", "onRedo=", "onDraw=", "onValidate=", "onRun=", "onGrid=", "onFit="]) assert.ok(app.includes(prop));
});

test("ElectCAD Tools exposes connectivity, wire numbering, and a non-certifying symbol provenance audit", () => {
  const app = read("apps/voltpro-electcad/App.tsx");
  assert.ok(app.includes("['Run connectivity diagnostics',runDiagnostics]"));
  assert.ok(app.includes("['Wire numbering',autoNumberWires]"));
  assert.ok(app.includes("['Audit symbol source IDs',reviewStandardsProvenance]"));
  assert.match(app, /installation-specific DIN VDE checks are not assessed/);
});

test("Breadboard command menu proxies only to implemented native controls", () => {
  const html = read("apps/voltpro-engineering-source/breadboard.html");
  const proxies = [...html.matchAll(/data-proxy=(?:"([^"]+)"|'([^']+)')/g)].map(match => match[1] || match[2]);
  assert.ok(proxies.length >= 15);
  for (const target of proxies) {
    if (target === "print") continue;
    if (target === "#bbUndo" || target === "#bbRedo") {
      const studio = read("apps/voltpro-engineering-source/src/ui/breadboard-studio.js");
      assert.ok(studio.includes(`id="${target.slice(1)}"`), `Missing dynamic ${target}`);
      continue;
    }
    if (target.startsWith("#")) assert.ok(html.includes(`id="${target.slice(1)}"`), `Missing ${target}`);
    else assert.ok(html.includes(target.replaceAll('\\"', '"')), `Missing ${target}`);
  }
  assert.match(html, /\.breadboard-menubar \[data-proxy\].*?\.click\(\)/s);
});

test("all five editor entry points load the shared charcoal and orange finish", () => {
  const shared = read("apps/voltpro-engineering-source/workspace-engineering-theme.css");
  assert.match(shared, /--vp-workspace-accent:#ff8a24/);
  for (const file of ["apps/voltpro-engineering-source/simulator.html", "apps/voltpro-engineering-source/breadboard.html", "apps/voltpro-engineering-source/electrical-canvas.html"]) assert.ok(read(file).includes("workspace-engineering-theme.css"));
  assert.ok(read("apps/voltpro-engineering-source/apps/voltpro-plc/src/main.tsx").includes("workspace-engineering-theme.css"));
  assert.ok(read("apps/voltpro-electcad/main.tsx").includes("workspace-engineering-theme.css"));
});

test("Adigun switches into architectural wiring context on the electrical route", () => {
  assert.match(ai, /building-electrical/);
  assert.match(ai, /Architectural\/Building Wiring/);
});
