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
 assert.ok(views.includes('frame.src = "breadboard.html?vp_embed=1"'));
 assert.ok(!views.includes("location.href"));
});
test("oscilloscope is docked, closable and activated only by its workspace view",()=>{
 const css=read("simulator.css"),html=read("simulator.html"),views=read("src/ui/workspace-views.js"),runtime=read("simulator.js");
 assert.ok(css.includes(".workspace.vp-scope-open>#simScopePanel"));
 assert.ok(css.includes("@media(max-width:1000px)"));
 assert.ok(html.includes('id="simScopeClose"'));
 assert.ok(views.includes('workspace.classList.add("vp-scope-open")'));
 assert.ok(runtime.includes('if(scopeProject&&window.VoltProWorkspaceViews?.active?.()==="scope")captureSimulatorScope(scopeProject)'));
 assert.ok(html.includes("workspace-views.js?v=20261027b"));
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
 assert.ok(toolbar.includes("positionDropdown"));
});
test("Serial view receives output from the virtual MCU interpreter",()=>{
 const views=read("src/ui/workspace-views.js"),mcu=read("platform/mcu-lab-ui.js");
 assert.ok(views.includes("voltpro-serial-output"));
 assert.ok(mcu.includes("voltpro-serial-output"));
});
test("new workspace module is included in the active offline cache",()=>{
 const html=read("simulator.html"),worker=read("service-worker.js");
 assert.ok(html.includes("service-worker.js?v=20261027b"));
 assert.ok(worker.includes('const CACHE="voltpro-v96"'));
 assert.ok(worker.includes('"./src/ui/workspace-views.js"'));
});
