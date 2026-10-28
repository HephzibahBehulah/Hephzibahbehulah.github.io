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
 assert.match(source,/root\.parentElement!==panel\)panel\.append\(root\)/);
 assert.match(source,/#vpDemoLibrary\{position:relative;width:100%;height:100%/);
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
 assert.ok(source.includes("document.querySelector(\"#fitBtn\")?.click()"),"all imported circuit stages should be fitted into view");
});
