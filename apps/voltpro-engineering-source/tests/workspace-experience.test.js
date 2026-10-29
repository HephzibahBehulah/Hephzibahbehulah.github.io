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
 assert.ok(toolbar.includes("positionMenu"));
 assert.ok(toolbar.includes("box.addEventListener('pointerleave',scheduleMenuClose)"));
});
test("top menus and nested project menus float over the canvas without a side dock",()=>{
 const toolbar=read("src/ui/toolbar-layout.js"),menus=read("platform/toolbar-menus.js"),css=read("src/ui/toolbar-layout.css"),html=read("simulator.html"),shell=read("workspace-shell.js");
 assert.ok(toolbar.includes("box.addEventListener('pointerleave',scheduleMenuClose)"));
 assert.ok(toolbar.includes("positionMenu"));
 assert.ok(menus.includes('trigger.closest(".vp-toolbar-menus")'));
 assert.ok(menus.includes('trigger.closest(".vp-toolbar-dropdown")'));
 assert.ok(css.includes(".vp-toolbar-dropdown"));
 assert.ok(css.includes(".vp-toolbar-dropdown.vp-menu-open{position:fixed!important;z-index:100100!important"));
 assert.ok(css.includes(".vp-toolbar-popover{z-index:100200"));
 assert.ok(html.includes("toolbar-layout.js?v=20261029-dropdown1"));
 assert.ok(html.includes("toolbar-layout.css?v=20261029-dropdown1"));
 assert.ok(html.includes("platform/toolbar-menus.js?v=20261029-dropdown1"));
 assert.ok(shell.includes("simulator.html?vp_embed=1&v=20261029-dropdown1"));
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

