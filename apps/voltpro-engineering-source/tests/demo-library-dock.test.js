"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");

test("demo project library docks in the Inspector and never overlays the canvas",()=>{
 const source=fs.readFileSync(path.join(root,"platform/demo-library.js"),"utf8");
 assert.doesNotThrow(()=>new Function(source));
 assert.match(source,/getElementById\("inspectorPanel"\)/);
 assert.match(source,/setPanel\?\.\("right",true\)/);
 assert.match(source,/root\.parentElement!==panel\)panel\.appendChild\(root\)/);
 assert.match(source,/#vpDemoLibrary\{position:absolute;inset:0;width:100%;height:100%/);
 assert.doesNotMatch(source,/#vpDemoLibrary\{position:fixed/);
 assert.match(source,/function close\(\)[\s\S]*?node\.hidden=panel\._demoLibraryHidden\.get\(node\)/);
});
test("Protected DC Lamp demo closes the source-to-fuse-to-switch-to-lamp loop",()=>{
 const source=fs.readFileSync(path.join(root,"platform/demo-library.js"),"utf8"),state={components:[],wires:[],history:[],future:[]},defs={};
 for(const type of ["battery","fuse","switch","lamp","resistor","led","capacitor","inductor","acsource","diode","buzzer","heater"])defs[type]={pins:2,props:{}};
 const context={window:{S:state,defs,VoltProUI:{render(){}}},document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return[]},querySelector(){return null}}};
 vm.createContext(context);vm.runInContext(source,context);
 context.window.VoltProDemoLibrary.load(context.window.VoltProDemoLibrary.demos().find(d=>d.title==="Protected DC Lamp · Starter"));
 assert.deepEqual(JSON.parse(JSON.stringify(state.wires.map(w=>[w.a,w.b]))),[["demo1_0:0","demo1_1:0"],["demo1_1:1","demo1_2:0"],["demo1_2:1","demo1_3:0"],["demo1_3:1","demo1_0:1"]]);
 assert.ok(source.includes('document.querySelector("#fitBtn")?.click()'),"all imported circuit stages should be fitted into view");
});
test("all non-motor demo variants load with complete, connected terminal wiring",()=>{
 const source=fs.readFileSync(path.join(root,"platform/demo-library.js"),"utf8"),defs={};
 for(const type of ["battery","fuse","switch","lamp","resistor","led","capacitor","inductor","acsource","diode","buzzer","heater","breaker","motor","terminal","oscilloscope","multimeter"])defs[type]={pins:type==="relay"?5:2,props:{}};
 defs.relay={pins:5,props:{}};
 const context={window:{defs},document:{addEventListener(){},getElementById(){return null},querySelectorAll(){return[]},querySelector(){return null}}};
 vm.createContext(context);vm.runInContext(source,context);
 const projects=context.window.VoltProDemoLibrary.demos().filter(d=>d.wiring!=="motor-system");
 for(const demo of projects){const state={components:[],wires:[],history:[],future:[]};context.window.S=state;context.window.VoltProUI={render(){}};context.window.VoltProDemoLibrary.load(demo);
  const ids=new Set(state.components.map(c=>c.id)),edges=new Map([...ids].map(id=>[id,new Set()]));
  for(const wire of state.wires){const [a]=wire.a.split(":"),[b]=wire.b.split(":");assert.ok(ids.has(a)&&ids.has(b),demo.title+" has a dangling wire");edges.get(a).add(b);edges.get(b).add(a)}
  const reached=new Set(),queue=[state.components[0]?.id];while(queue.length){const id=queue.shift();if(!id||reached.has(id))continue;reached.add(id);for(const next of edges.get(id)||[])queue.push(next)}
  assert.equal(reached.size,ids.size,demo.title+" is not one connected circuit");
 }
 assert.equal(projects.length,85);
});

