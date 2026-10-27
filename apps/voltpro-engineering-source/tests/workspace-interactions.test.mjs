import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(app,file),"utf8");

test("workspace views stay in the simulator and keep scope inside the drawing canvas",()=>{
 const html=read("simulator.html"),views=read("src/ui/workspace-views.js"),css=read("simulator.css"),runtime=read("simulator.js"),rail=read("src/ui/toolbar-layout.js");
 for(const view of ["schematic","breadboard","pcb","code","serial","scope"])assert.ok(rail.includes("['"+view+"'"),"missing "+view+" workspace button");
 assert.match(views,/canvasWrap\.append\(scopePanel\)/);
 assert.match(views,/activeView !== "schematic"/);
 assert.match(views,/scopePanel\.hidden = false/);
 assert.match(views,/scopePanel\.hidden = true/);
 assert.match(css,/\.sim-scope-panel\{position:absolute/);
 assert.match(css,/resize:both/);
 assert.doesNotMatch(css,/vp-scope-open/);
 assert.match(runtime,/VoltProWorkspaceViews\?\.openScope/);
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
