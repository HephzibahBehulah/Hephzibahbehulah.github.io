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
test.todo("accept.sim.bom.model-parameters");
test.todo("accept.sim.hierarchy.typed-ports");
test.todo("accept.sim.history.parameter-audit");
test.todo("accept.sim.wiring.domains-and-current-flow");
