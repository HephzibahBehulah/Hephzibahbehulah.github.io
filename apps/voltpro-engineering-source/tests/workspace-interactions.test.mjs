import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(app,file),"utf8");

test("workspace views stay in the simulator and keep scope inside the drawing canvas",()=>{
 const html=read("simulator.html"),views=read("src/ui/workspace-views.js"),css=read("simulator.css"),scopeCss=read("oscilloscope/style.css"),runtime=read("simulator.js"),rail=read("src/ui/toolbar-layout.js");
 for(const view of ["schematic","breadboard","pcb","code","serial","scope"])assert.ok(rail.includes("['"+view+"'"),"missing "+view+" workspace button");
 assert.match(views,/canvasWrap\.append\(scopePanel\)/);
 assert.match(views,/activeView !== "schematic"/);
 assert.match(views,/scopePanel\.hidden = false/);
 assert.match(views,/scopePanel\.hidden = true/);
 assert.match(css,/\.sim-scope-panel\{position:absolute/);
 assert.match(css,/width:min\(400px/);
 assert.match(css,/resize:both/);
 assert.match(views,/scopeLayoutKey/);
 assert.match(views,/localStorage\.setItem\(scopeLayoutKey/);
 assert.match(scopeCss,/#scopeApp\.scope-embedded>header[^}]*display:none!important/);
 assert.doesNotMatch(css,/vp-scope-open/);
 assert.match(runtime,/VoltProWorkspaceViews\?\.openScope/);
});

test("circuit study library docks in the inspector and never masks the canvas or top bar",()=>{
 const library=read("platform/demo-library.js");
 assert.match(library,/#vpDemoLibrary\{position:absolute;inset:0/);
 assert.doesNotMatch(library,/#vpDemoLibrary\{position:fixed/);
 assert.match(library,/panel\.appendChild\(root\)/);
 assert.match(library,/vp-demo-library-open/);
});

test("canvas rulers and drag alignment guides are active in world coordinates",()=>{
 const html=read("simulator.html"),runtime=read("simulator.js"),css=read("simulator.css");
 assert.ok(html.includes('id="simRulerX"')&&html.includes('id="simRulerY"'));
 assert.ok(html.includes('id="alignmentGuides"')&&html.includes('id="simAlignStatus"'));
 assert.match(runtime,/function updateRulers\(\)/);
 assert.match(runtime,/alignDraggedComponent\(c\)/);
 assert.match(runtime,/clearAlignmentGuides\(\)/);
 assert.ok(css.includes(".sim-ruler-x")&&css.includes(".sim-ruler-y")&&css.includes(".alignment-guide"));
});
