const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../src/core/terminal-graph.js");
const P = require("../platform/canonical-project.js");

function project(devices = [], wires = []) {
  return { format: P.FORMAT, formatVersion: P.VERSION, metadata:{id:"terminal-test",name:"Terminal test"},
    workspace:{mode:"schematic",grid:20}, devices, wires, nets:{policy:"derived",snapshot:null},
    panel:{rails:[],items:[]},plc:{programs:[],ioMappings:[]},
    simulation:{configuration:{mode:"dc"},resultsMetadata:null},extensions:{} };
}
function device(id,type,extra={}) {
  return {id,type,position:{x:100,y:50},rotation:0,...extra};
}
function wire(id,from,to,domain="dc") { return {id,from,to,domain,routing:[],electrical:{}}; }

test("stable terminal lookup is independent of rendering and DOM", () => {
  const p=project([device("R1","resistor")]);
  const engine=T.build(p);
  assert.equal(engine.resolveTerminal("R1:1").id,"R1:1");
  assert.equal(engine.resolveTerminal("R1","2").id,"R1:2");
  assert.equal(engine.resolveTerminal("R1:missing"),null);
  assert.deepEqual(engine.terminalPosition("R1:1"),{x:80,y:50});
});

test("moving a device changes position, not terminal identity", () => {
  const p=project([device("R1","resistor")]), engine=T.build(p);
  const before=engine.resolveTerminal("R1:1").id;
  p.devices[0].position={x:300,y:180};
  engine.updateTopology();
  assert.equal(engine.resolveTerminal("R1:1").id,before);
  assert.deepEqual(engine.terminalPosition("R1:1"),{x:280,y:180});
});

test("rotation transforms terminal world positions deterministically", () => {
  const p=project([device("R1","resistor")]), engine=T.build(p);
  p.devices[0].rotation=90;
  engine.updateTopology();
  const pos=engine.terminalPosition("R1:1");
  assert.ok(Math.abs(pos.x-100)<1e-9);
  assert.ok(Math.abs(pos.y-30)<1e-9);
  assert.equal(engine.resolveTerminal("R1:1").id,"R1:1");
});

test("duplicate device and terminal identities are reported", () => {
  const p=project([
    device("R1","resistor"),
    device("R1","resistor"),
    P.createDevice({id:"R2",type:"custom",position:{x:0,y:0},terminals:[
      {id:"1",label:"1",type:"electrical",domain:"dc"},
      {id:"1",label:"duplicate",type:"electrical",domain:"dc"}
    ]})
  ]);
  const engine=T.build(p);
  assert.ok(engine.errors.some(e=>e.code==="DUPLICATE_DEVICE"));
  assert.ok(engine.errors.some(e=>e.code==="DUPLICATE_TERMINAL"));
});

test("three-pole circuit breaker exposes six phase-matched terminals and three independent pole paths", () => {
  const p=project([device("Q1","circuit-breaker-3p")]), engine=T.build(p);
  assert.equal(engine.terminalsForDevice("Q1").length,6);
  for(const id of ["L1","L2","L3","T1","T2","T3"]) assert.ok(engine.resolveTerminal("Q1:"+id), "missing terminal "+id);
  const paths=engine.internalPaths("Q1");
  assert.deepEqual(paths.map(x=>x.id),["breaker-pole-1","breaker-pole-2","breaker-pole-3"]);
  assert.deepEqual(paths.map(x=>[x.from,x.to,x.phase]),[["Q1:L1","Q1:T1","L1"],["Q1:L2","Q1:T2","L2"],["Q1:L3","Q1:T3","L3"]]);
  assert.equal(T.build(project([device("Q2","mcb-3p")])).terminalsForDevice("Q2").length,6);
});

test("contactor has independently addressable coil, main and auxiliary paths", () => {
  const p=project([device("KM1","contactor")]), engine=T.build(p);
  for(const id of ["A1","A2","L1","T1","L2","T2","L3","T3","13","14","21","22"])
    assert.equal(engine.resolveTerminal("KM1:"+id).deviceId,"KM1");
  const paths=engine.internalPaths("KM1");
  assert.deepEqual(paths.map(x=>x.id),["coil","main-1","main-2","main-3","aux-no-13-14","aux-nc-21-22"]);
  assert.notEqual(paths.find(x=>x.id==="main-1").from,paths.find(x=>x.id==="main-2").from);
  assert.equal(paths.find(x=>x.id==="coil").kind,"coil");
  const legacyGeneric=project([P.createDevice({id:"KM2",type:"contactor"})]);
  const modelEngine=T.build(legacyGeneric);
  assert.equal(modelEngine.terminalsForDevice("KM2").length,12);
  assert.ok(modelEngine.resolveTerminal("KM2:A1"));
});

test("connected wires, connected nets, compatibility and dangling terminals work", () => {
  const p=project([device("R1","resistor"),device("R2","resistor")],[wire("W1","R1:2","R2:1")]);
  const engine=T.build(p);
  assert.equal(engine.findConnectedWires("R1:2").length,1);
  assert.deepEqual(engine.findConnectedNets("R1:2"),["R1:2","R2:1"]);
  assert.equal(engine.resolveTerminal("R1:2").connectionStatus,"connected");
  assert.ok(engine.danglingTerminals().includes("R1:1"));
  assert.equal(engine.validateConnection("R1:2","R2:1",{domain:"dc"}).valid,true);
  assert.equal(engine.validateConnection("R1:2","R2:1",{domain:"ac"}).valid,false);
});

test("canonical object endpoints resolve to the same stable terminal identity", () => {
  const p=project([device("R1","resistor"),device("R2","resistor")],[
    {id:"W1",from:{deviceId:"R1",terminalId:"2"},to:{deviceId:"R2",terminalId:"1"},domain:"dc"}
  ]);
  const engine=T.build(p);
  assert.equal(engine.findConnectedWires("R1:2").length,1);
  assert.deepEqual(engine.findConnectedNets("R1:2"),["R1:2","R2:1"]);
  assert.equal(engine.validateTopology().valid,true);
});

test("invalid wire references and duplicate wire ids fail topology validation", () => {
  const p=project([device("R1","resistor")],[
    wire("W1","R1:1","R1:2"),
    wire("W1","R1:1","R9:1")
  ]);
  const result=T.build(p).validateTopology();
  assert.equal(result.valid,false);
  assert.ok(result.errors.some(e=>e.code==="DUPLICATE_WIRE_ID"));
  assert.ok(result.errors.some(e=>e.code==="INVALID_TERMINAL_REFERENCE"));
});

test("deleting a device removes dependent wires and rebuilds indexes", () => {
  const p=project([device("R1","resistor"),device("R2","resistor")],[wire("W1","R1:2","R2:1")]);
  const engine=T.build(p);
  const result=engine.deleteDevice("R1");
  assert.deepEqual(result.removedWires,["W1"]);
  assert.equal(engine.resolveTerminal("R1:1"),null);
  assert.equal(p.wires.length,0);
  assert.equal(engine.validateTopology().valid,true);
});

test("delete can be rejected safely when connected wires exist", () => {
  const p=project([device("R1","resistor"),device("R2","resistor")],[wire("W1","R1:2","R2:1")]);
  const engine=T.build(p);
  const result=engine.deleteDevice("R1",{wires:"reject"});
  assert.equal(result.deleted,false);
  assert.equal(p.devices.length,2);
  assert.equal(p.wires.length,1);
});

test("terminal identities and topology survive canonical project reload", () => {
  const p=project();
  const engine=T.build(p);
  engine.createDevice(device("R1","resistor"));
  engine.createDevice(device("R2","resistor"));
  p.wires.push(wire("W1","R1:2","R2:1"));
  engine.updateTopology();
  const loaded=P.deserialize(P.serialize(p));
  const reloaded=T.build(loaded);
  assert.deepEqual(reloaded.findConnectedNets("R1:2"),["R1:2","R2:1"]);
  assert.equal(reloaded.resolveTerminal("R1:2").id,"R1:2");
});

test("three-phase source, contactor and control terminals preserve domains and phase identity", () => {
  const p=project([
    device("PS1","threephase"),device("QF1","circuit-breaker-3p"),
    device("KM1","contactor"),device("M1","motor"),
    device("CS1","controlsource"),device("PB1","pushbutton-no")
  ]);
  const engine=T.build(p);
  assert.equal(engine.resolveTerminal("PS1:L1").domain,"ac3");
  assert.equal(engine.resolveTerminal("QF1:T2").phase,"L2");
  assert.equal(engine.resolveTerminal("KM1:L3").phase,"L3");
  assert.equal(engine.resolveTerminal("M1:W1").phase,"L3");
  assert.equal(engine.resolveTerminal("CS1:PLUS").domain,"control");
  assert.equal(engine.resolveTerminal("PB1:13").domain,"control");
  const mismatch=T.compatibility(engine.resolveTerminal("PS1:L1"),engine.resolveTerminal("QF1:L2"));
  assert.equal(mismatch.valid,false);
  assert.ok(mismatch.errors.some(e=>e.code==="PHASE_MISMATCH"));
});
