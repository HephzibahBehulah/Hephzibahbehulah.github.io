const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("left rail switches workspace views through an independent runtime",()=>{
 const toolbar=read("src/ui/toolbar-layout.js"),views=read("src/ui/workspace-views.js");
 for(const view of ["schematic","breadboard","pcb","code","serial","scope"])assert.ok(toolbar.includes("'"+view+"'"));
 assert.ok(views.includes("window.VoltProWorkspaceViews = { switch: switchView"));
 assert.ok(views.includes("const createBoardProject = ()"));
 assert.ok(views.includes("onMovePart: (id, hole)"));
 assert.ok(views.includes("component.x = 80 + part.x * 12"));
 assert.ok(!views.includes("location.href"));
});
test("PCB view reads and writes state through the simulator runtime API",()=>{
 const views=read("src/ui/workspace-views.js");
 assert.ok(views.includes("simulator.state.components"));
 assert.ok(views.includes("simulator.state.wires"));
 assert.ok(views.includes("simulator.state.projectMetadata"));
 assert.ok(!views.includes("ui.state"));
});
test("oscilloscope is compact, resizable, persistent and activated only by its workspace view",()=>{
 const css=read("simulator.css"),html=read("simulator.html"),views=read("src/ui/workspace-views.js"),runtime=read("simulator.js");
 assert.ok(css.includes(".sim-scope-panel{position:absolute"));
 assert.ok(css.includes("@media(max-width:1000px)"));
 assert.ok(html.includes('id="simScopeClose"'));
 assert.ok(html.includes('id="simScopeMaximize"'));
 assert.ok(css.includes("width:min(400px"));
 assert.ok(css.includes("height:min(300px"));
 assert.ok(views.includes('const scopeLayoutKey = "voltpro-simulator-scope-layout-v1"'));
 assert.ok(views.includes("ResizeObserver"));
 assert.ok(views.includes("scopePanel.classList.toggle(\"expanded\")"));
 assert.ok(views.includes("canvasWrap.clientWidth * .68"),"expanded scope stays within the canvas instead of covering it");
 assert.ok(views.includes("canvasWrap.append(scopePanel)"));
 assert.ok(runtime.includes("VoltProWorkspaceViews?.openScope?.(scopeProject)"));
 assert.ok(html.includes("workspace-views.js?v=20261027e"));
});
test("Run, Pause, Resume and Stop retain explicit active states",()=>{
 const html=read("simulator.html"),runtime=read("simulator.js");
 assert.ok(html.includes('id="pauseBtn"'));
 assert.ok(runtime.includes("function pauseSimulation()"));
 assert.ok(runtime.includes("simulationPaused=false"));
 assert.ok(runtime.includes("!simulationPaused"));
 assert.ok(runtime.includes('$("#pauseBtn").onclick=pauseSimulation'));
});
test("Simulation dropdown controls use the shared toolbar actions",()=>{
 const toolbar=read("src/ui/toolbar-layout.js");
 for(const command of ["runBtn","pauseBtn","stopBtn","studioLaunch"])assert.ok(toolbar.includes(command));
 assert.ok(toolbar.includes("vp-menu-dock-open"));
});
test("top menus and nested project menus use an in-flow dock beside the canvas",()=>{
 const toolbar=read("src/ui/toolbar-layout.js"),menus=read("platform/toolbar-menus.js"),css=read("src/ui/toolbar-layout.css"),html=read("simulator.html"),shell=read("workspace-shell.js");
 assert.ok(toolbar.includes("workspace.insertBefore(menuDock"));
 assert.ok(toolbar.includes("menuDock.replaceChildren(title,box)"));
 assert.ok(toolbar.includes("menuDock?.contains(event.target)"));
 assert.ok(menus.includes("dock.appendChild(popover)"));
 assert.ok(css.includes(".workspace.vp-has-rail.vp-menu-dock-open"));
 assert.ok(css.includes("grid-row:2!important"));
 assert.ok(css.includes("grid-template-rows:minmax(180px,1fr) minmax(140px,34vh)!important"));
 assert.ok(css.includes("height:100%!important;min-height:0!important;max-height:none!important"));
 assert.ok(css.includes("#canvasWrap{grid-column:2!important;grid-row:1!important;display:block!important"));
 assert.ok(css.includes(".vp-menu-dock .vp-toolbar-popover{position:static"));
 assert.ok(html.includes("toolbar-layout.js?v=20261028a"));
 assert.ok(html.includes("toolbar-layout.css?v=20261028a"));
 assert.ok(shell.includes("simulator.html?vp_embed=1&v=20261028a"));
});
test("Serial view receives output from the virtual MCU interpreter",()=>{
 const views=read("src/ui/workspace-views.js"),mcu=read("platform/mcu-lab-ui.js");
 assert.ok(views.includes("voltpro-serial-output"));
 assert.ok(mcu.includes("voltpro-serial-output"));
 assert.ok(views.includes('boardHost.querySelector(".vp-board-live")'));
 assert.ok(views.includes("if (boardCanvas) boardCanvas.hidden = true"));
});
test("new workspace module is included in the active offline cache",()=>{
 const html=read("simulator.html"),worker=read("service-worker.js");
 assert.ok(html.includes("service-worker.js?v=20261027e"));
 assert.ok(worker.includes('const CACHE="voltpro-v99"'));
 assert.ok(worker.includes('"./src/ui/workspace-views.js"'));
});

