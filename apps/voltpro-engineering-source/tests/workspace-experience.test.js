const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("left rail switches workspace views without navigating away",()=>{
 const toolbar=read("src/ui/toolbar-layout.js"),runtime=read("simulator.js");
 for(const view of ["schematic","breadboard","pcb","code","serial","scope"])assert.ok(toolbar.includes("'"+view+"'"));
 assert.ok(runtime.includes("window.VoltProWorkspaceViews={switch:switchView"));
 assert.ok(runtime.includes("frame.src='breadboard.html?vp_embed=1'"));
 assert.ok(!runtime.includes("location.href='breadboard.html'"));
});

test("oscilloscope occupies a reserved workspace column and can be closed",()=>{
 const css=read("simulator.css"),html=read("simulator.html"),runtime=read("simulator.js");
 assert.ok(css.includes(".workspace.vp-scope-open>#simScopePanel"));
 assert.ok(css.includes("@media(max-width:1000px)"));
 assert.ok(html.includes('id="simScopeClose"'));
 assert.ok(runtime.includes("workspace.classList.add('vp-scope-open')"));
});

test("Run, Pause, Resume and Stop have explicit live states",()=>{
 const html=read("simulator.html"),runtime=read("simulator.js");
 assert.ok(html.includes('id="pauseBtn"'));
 assert.ok(runtime.includes("function pauseSimulation()"));
 assert.ok(runtime.includes("simulationPaused=false"));
 assert.ok(runtime.includes("!simulationPaused"));
 assert.ok(runtime.includes("$(\"#pauseBtn\").onclick=pauseSimulation"));
});

test("Simulation dropdown controls use the same toolbar actions",()=>{
 const toolbar=read("src/ui/toolbar-layout.js");
 for(const command of ["runBtn","pauseBtn","stopBtn","studioLaunch"])assert.ok(toolbar.includes(command));
 assert.ok(toolbar.includes("positionDropdown"));
});

test("Serial view receives output from the virtual MCU interpreter",()=>{
 const runtime=read("simulator.js"),mcu=read("platform/mcu-lab-ui.js");
 assert.ok(runtime.includes("voltpro-serial-output"));
 assert.ok(mcu.includes("voltpro-serial-output"));
});
