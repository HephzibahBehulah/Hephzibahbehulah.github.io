"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("simulator learning tools are in-page dropdowns rather than outbound Workbench links", () => {
  const html = read("simulator.html");
  for (const menu of ["demos","motor","logic","projects","faults","challenges","tutorials","mcu","tools"]) assert.ok(html.includes('data-vp-menu="' + menu + '"'));
  assert.ok(!html.includes('href="academy-workbench.html'));
  assert.ok(html.includes('id="pngBtn"'));
  assert.ok(html.includes('>SVG</button>'));
  assert.ok(html.includes('id="paletteBtn"'));
  assert.ok(html.includes('id="inspectorBtn"'));
  assert.ok(html.includes('data-ui-build="2026.10.12-tool-action-repair"'));
});

test("SVG export serializes the current schematic and reports success or failure", () => {
  const js = read("simulator.js");
  assert.match(js, /function exportSVG\(\)/);
  assert.match(js, /XMLSerializer\(\)/);
  assert.match(js, /download\("voltpro-schematic\.svg"/);
  assert.match(js, /SVG schematic exported/);
  assert.match(js, /SVG export failed/);
});

test("keyboard arrow movement remains available and avoids editable fields", () => {
  const js = read("simulator.js");
  assert.match(js, /\["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"\]/);
  assert.match(js, /target\.isContentEditable/);
  assert.match(js, /saveHistory\(\)/);
  assert.match(js, /e\.shiftKey\?5:1/);
});

test("sidebar controls expose state and CSS gives the canvas released space", () => {
  const html = read("simulator.html");
  const js = read("simulator.js");
  const css = read("simulator-layout-restore.css");
  assert.match(html, /id="paletteBtn"[^>]*aria-controls="palette"[^>]*aria-expanded="true"/);
  assert.match(html, /id="inspectorBtn"[^>]*aria-controls="inspectorPanel"/);
  assert.match(js, /workspace\?\.classList\.toggle\("palette-hidden"/);
  assert.match(js, /workspace\.classList\.toggle\("inspector-hidden"\)/);
  assert.match(css, /\.workspace\.palette-hidden\.inspector-hidden/);
  assert.match(css, /#palette,\s*\.simulator-page \.workspace\.inspector-hidden #inspectorPanel/);
});

test("Workbench provides Logic Lab and motor deep links focus the intended tools", () => {
  const html = read("academy-workbench.html");
  const js = read("academy-workbench.js");
  assert.match(html, /id="logic-lab"/);
  assert.match(html, /simulator\.html\?mode=logic/);
  assert.match(js, /get\("focus"\)/);
  assert.match(js, /focus==="motor"/);
  assert.match(js, /demoSearch/);
});

test("changed JavaScript files parse without syntax errors", () => {
  assert.doesNotThrow(() => new Function(read("simulator.js")));
  assert.doesNotThrow(() => new Function(read("academy-workbench.js")));
});

test("component and inspector controls bind before initial rendering can fail",()=>{
 const js=read("simulator.js");
 assert.ok(js.indexOf("bindExtraControls();renderPalette();render();")>0);
 assert.ok(js.indexOf("bindExtraControls();renderPalette();render();")<js.indexOf("log(\"Base simulation components"));
 assert.match(js,/const pb=document\.querySelector\("#paletteBtn"\)/);
 assert.match(js,/const ib=document\.querySelector\("#inspectorBtn"\)/);
});

test("empty top menus now contain purposeful simulator actions",()=>{
 const layout=read("src/ui/toolbar-layout.js");
 for(const label of ["Fit drawing to canvas","Open engineering calculations","Show measurement results","Generate project report","Create bill of materials","Import .voltpro / JSON","Save a separate copy","Schematic canvas","Breadboard workspace","PCB workspace"])assert.ok(layout.includes(label),"missing action "+label);
 assert.ok(layout.includes("\u0027File\u0027"));
 assert.ok(layout.includes("VoltProProjectWorkspace?.open"));
 assert.ok(layout.includes("VoltProPlatformActions"));
 assert.ok(layout.includes("data-vp-command"));
});

test("responsive inspector and component panels resize the canvas instead of overlaying it",()=>{
 const template=read("simulator-template.css"),css=read("simulator.css");
 assert.ok(template.includes("Compact screens keep panels in the workspace grid"));
 assert.match(template,/\.workspace\.vp-managed-panels #inspectorPanel\{position:relative!important/);
 assert.match(template,/\.workspace\.vp-managed-panels #palette,\s*body\.simulator-page\.vp-template-simulator \.workspace\.vp-managed-panels #inspectorPanel\{position:relative!important/);
 assert.ok(css.includes("Responsive panel layout: sidebars stay in grid flow"));
});