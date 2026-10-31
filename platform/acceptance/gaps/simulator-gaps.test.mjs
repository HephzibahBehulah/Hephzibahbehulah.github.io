import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

test.todo("accept.sim.drc.topology-and-ratings");
test("accept.sim.nets.labels-colors-roundtrip",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),ctx={console,window:{},structuredClone};
 vm.createContext(ctx);
 for(const file of ["src/core/terminal-graph.js","src/core/net-resolver.js","src/core/net-labels.js","platform/canonical-project.js","platform/project-format.js"])vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),ctx,{filename:file});
 const project={devices:["A","B","C"].map(id=>({id,type:"net-endpoint",terminals:[{id:"T1"},{id:"T2"}]})),wires:[{id:"W1",from:"A:T1",to:"B:T1"},{id:"W2",from:"B:T1",to:"C:T1"},{id:"W3",from:"A:T2",to:"B:T2"}]};
 const resolve=wires=>{const p={...project,wires},graph=ctx.window.VoltProTerminalGraph.build(p),nets=ctx.window.VoltProNetResolver.resolve(p,graph);return ctx.window.VoltProNetLabels.decorate(wires,nets)};
 const first=resolve(project.wires),reordered=resolve(project.wires.slice().reverse()),byId=result=>new Map(result.wires.map(w=>[w.id,[w.netId,w.netLabel,w.netColor]]));
 assert.deepEqual([...byId(first)].sort(([a],[b])=>a.localeCompare(b)), [...byId(reordered)].sort(([a],[b])=>a.localeCompare(b)));
 const rows=byId(first);assert.equal(rows.get("W1")[1],rows.get("W2")[1]);assert.equal(rows.get("W1")[2],rows.get("W2")[2]);assert.notEqual(rows.get("W1")[1],rows.get("W3")[1]);
 const legacy={format:"voltpro",version:2,components:project.devices,wires:first.wires};
 const roundTrip=ctx.window.VoltProProject.toLegacy(ctx.window.VoltProProject.decode(ctx.window.VoltProProject.encode(legacy)));
 for(const wire of first.wires){const saved=roundTrip.wires.find(item=>item.id===wire.id);assert.equal(saved.netLabel,wire.netLabel);assert.equal(saved.netColor,wire.netColor);assert.equal(saved.netId,wire.netId)}
 const simulator=fs.readFileSync(path.join(root,"simulator.js"),"utf8"),html=fs.readFileSync(path.join(root,"simulator.html"),"utf8");
 assert.match(simulator,/function wireNetPresentation\(\)/);assert.match(simulator,/net\.netColor/);assert.match(html,/src\/core\/net-labels\.js/);
});
test("accept.sim.bom.model-parameters",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),ctx={window:{}};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,"platform/bom.js"),"utf8"),ctx,{filename:"bom.js"});
 const project={components:[{id:"c1",tag:"R1",type:"resistor",props:{resistance:4700,tolerancePercent:5}},{id:"c2",type:"resistor",props:{resistance:10000}}]},library=[{id:"resistor",name:"Resistor"}],bom=ctx.window.VoltProBOM;
 const rows=bom.buildDetailed(project,library);assert.equal(rows.length,2);assert.equal(rows[0].reference,"R1");assert.equal(rows[0].description,"Resistor");assert.equal(rows[0].tolerance,"5");assert.match(rows[0].modelParameters,/4700/);assert.equal(rows[1].tolerance,"Not specified");
 const csv=bom.detailedCsv(rows);assert.match(csv,/Model parameters/);assert.match(csv,/tolerancePercent/);assert.equal(bom.build(project,library).reduce((sum,row)=>sum+row.quantity,0),2);
});
test.todo("accept.sim.hierarchy.typed-ports");
test("accept.sim.history.parameter-audit",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),ctx={console,window:{},structuredClone};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,"src/core/parameter-history.js"),"utf8"),ctx,{filename:"parameter-history.js"});
 const core=ctx.window.VoltProParameterAuditCore,storageMap=new Map(),storage={getItem:key=>storageMap.get(key)||null,setItem:(key,value)=>storageMap.set(key,value)};
 const first=core.makeParameterAudit({projectId:"project-a",componentId:"R1",componentType:"resistor",parameter:"resistance",from:1000,to:1200},{id:"entry-1",at:"2026-01-01T00:00:00.000Z"});
 assert.ok(first);assert.equal(core.makeParameterAudit({...first,from:first.to,to:first.to}),null);
 const coalesced=core.appendParameterAudit([first],{...first,id:"entry-2",at:"2026-01-01T00:00:01.000Z",from:"1200",to:"1500"},Date.parse("2026-01-01T00:00:01.000Z"));
 assert.equal(coalesced.length,1);assert.equal(coalesced[0].id,"entry-1");assert.equal(coalesced[0].from,"1000");assert.equal(coalesced[0].to,"1500");
 assert.equal(core.saveParameterAudit(storage,"project-a",coalesced),true);assert.equal(core.loadParameterAudit(storage,"project-a").length,1);assert.equal(core.loadParameterAudit(storage,"project-b").length,0);
 const capped=Array.from({length:305},(_,index)=>({...first,id:"e"+index,at:new Date(Date.parse(first.at)+index*3000).toISOString()}));assert.equal(core.normalizeParameterAudit(capped).length,300);assert.equal(core.normalizeParameterAudit(capped)[0].id,"e5");
 const html=fs.readFileSync(path.join(root,"simulator.html"),"utf8"),simulator=fs.readFileSync(path.join(root,"simulator.js"),"utf8"),toolbar=fs.readFileSync(path.join(root,"platform/toolbar-menus.js"),"utf8");
 assert.match(html,/src\/core\/parameter-history\.js[^>]*defer><\/script><script src="simulator\.js/);assert.match(simulator,/VoltProSimulatorAudit\?\.record/);assert.match(toolbar,/Parameter change history/);assert.match(fs.readFileSync(path.join(root,"simulator.css"),"utf8"),/\.vp-audit-backdrop/);
});
test("accept.sim.wiring.domains-and-current-flow",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),ctx={console,window:{}};vm.createContext(ctx);
 for(const file of ["src/core/terminal-graph.js","src/core/wire-flow.js"])vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),ctx,{filename:file});
 const terminals=[{id:"OUT",label:"Output",type:"electrical",domain:"signal"},{id:"IN",label:"Input",type:"electrical",domain:"signal"}],project={devices:[{id:"U1",type:"test-device",terminals},{id:"U2",type:"test-device",terminals}],wires:[{id:"W1",from:"U1:OUT",to:"U2:IN",domain:"dc"}]},graph=ctx.window.VoltProTerminalGraph.build(project);
 assert.equal(graph.validateTopology().valid,false);assert.ok(graph.validateTopology().errors.some(error=>/DOMAIN_MISMATCH/.test(error.code)));
 const flow=ctx.VoltProWireFlow.compute([{id:"W1",a:"U1:OUT",b:"U2:IN"}],[{terminalA:"U1:RETURN",terminalB:"U1:OUT",current:.1},{terminalA:"U2:IN",terminalB:"U2:RETURN",current:.1}]);assert.equal(flow.get("W1").current,.1);
 const reversed=ctx.VoltProWireFlow.compute([{id:"W1",a:"U2:IN",b:"U1:OUT"}],[{terminalA:"U1:RETURN",terminalB:"U1:OUT",current:.1},{terminalA:"U2:IN",terminalB:"U2:RETURN",current:.1}]);assert.equal(reversed.get("W1").current,-.1);
 const loop=ctx.VoltProWireFlow.compute([{id:"W1",a:"A",b:"B"},{id:"W2",a:"B",b:"C"},{id:"W3",a:"C",b:"A"}]);assert.equal(loop.get("W1").current,null);assert.match(loop.get("W1").reason,/indeterminate/);
 const simulator=fs.readFileSync(path.join(root,"simulator.html"),"utf8"),liveFlow=fs.readFileSync(path.join(root,"src/ui/live-flow.js"),"utf8");assert.match(simulator,/src\/core\/wire-flow\.js/);assert.match(liveFlow,/LIVE DC/);assert.match(liveFlow,/VoltProWireFlow\.compute/);
});
