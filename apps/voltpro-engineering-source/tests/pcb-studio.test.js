'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={TextEncoder,Blob,window:{VoltProTerminalGraph:{definitionFor:type=>['resistor','led','diode','capacitor','inductor','switch'].includes(type)?{terminals:[{id:'1'},{id:'2'}]}:null}},document:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('src/ui/pcb-studio.js','utf8'),context);const {model,autoroute,routeViolations,designRuleViolations,fabricationFiles,zipStore}=context.window.VoltProPCBStudio;

test('breadboard PCB nets include shared strips and jumper wires that start on empty holes',()=>{
 const p={parts:[{id:'R1',type:'resistor',value:'1 kΩ',x:5,y:3,pins:[{r:3,c:5},{r:3,c:10}]},{id:'LED1',type:'led',value:'Red LED',x:20,y:4,pins:[{r:4,c:20},{r:4,c:25}]}],wires:[{a:{r:4,c:5},b:{r:4,c:20}}]};
 const board=model('breadboard',p),a=board.comps[0].pins[0],b=board.comps[1].pins[0];
 assert.equal(a.net,b.net);assert.equal(board.nets.length,1);assert.ok(board.board.w>=130);assert.equal(board.unmapped.length,0);
});

test('schematic PCB conversion preserves explicit terminal wiring and flags unsupported packages',()=>{
 const p={components:[{id:'R1',type:'resistor',props:{}},{id:'D1',type:'diode',props:{}},{id:'X1',type:'industrial-contactor',props:{}}],wires:[{a:'R1:1',b:'D1:0'}]};
 const board=model('simulator',p);assert.equal(board.comps[0].pins[1].net,board.comps[1].pins[0].net);assert.equal(board.comps[2].pins.length,0);assert.deepEqual(Array.from(board.unmapped),['X1']);assert.equal(board.nets.length,1);
});

test('generic terminal definitions create editable footprint pads and remain flagged for fabrication review',()=>{
 const definition=context.window.VoltProTerminalGraph.definitionFor;context.window.VoltProTerminalGraph.definitionFor=type=>type==='sensor-module'?{terminals:[{id:'VCC'},{id:'GND'},{id:'OUT'}]}:definition(type);
 const board=model('simulator',{components:[{id:'U1',type:'sensor-module',props:{}}],wires:[]});context.window.VoltProTerminalGraph.definitionFor=definition;
 assert.equal(board.comps[0].pins.length,3);assert.deepEqual(Array.from(board.generic),['U1']);assert.deepEqual(Array.from(board.unmapped),['U1']);
});

test('geometric autorouter avoids package keepouts and routes connected terminals without copper conflicts',()=>{
 const board=model('simulator',{components:[{id:'R1',type:'resistor',props:{}},{id:'R2',type:'resistor',props:{}}],wires:[{a:'R1:0',b:'R2:0'}]});
 const result=autoroute(board.board,board.comps,board.nets,[]);
 assert.equal(result.failed.length,0);assert.equal(result.routes.length,1);assert.equal(result.routes[0].net,board.nets[0].id);assert.ok(result.routes[0].points.length>=2);assert.deepEqual(Array.from(routeViolations(result.routes)),[]);assert.deepEqual(Array.from(designRuleViolations(board,result.routes)),[]);
});

test('clearance checker reports crossings between different nets on the same copper layer',()=>{
 const routes=[{net:'A',layer:'top',a:{x:10,y:10},b:{x:20,y:10},points:[{x:10,y:10},{x:20,y:10}]},{net:'B',layer:'top',a:{x:15,y:5},b:{x:15,y:15},points:[{x:15,y:5},{x:15,y:15}]}];
 assert.equal(routeViolations(routes).length,1);
});

test('fabrication export contains dimensioned Gerber copper, edge and separate plated drill layers',async()=>{
 const board=model('simulator',{components:[{id:'R1',type:'resistor',props:{}},{id:'R2',type:'resistor',props:{}}],wires:[{a:'R1:0',b:'R2:0'}]}),routes=autoroute(board.board,board.comps,board.nets,[]).routes,files=fabricationFiles(board,routes,'<svg/>');
 const byName=Object.fromEntries(files.map(f=>[f.name,f.text]));assert.ok(byName['board-F_Cu.gbr'].includes('%MOMM*%'));assert.ok(byName['board-B_Cu.gbr'].includes('M02*'));assert.ok(byName['board-Edge_Cuts.gbr'].includes('D01*'));assert.ok(byName['board-PTH.drl'].includes('T01C0.800'));assert.ok(byName['board-NPTH.drl'].includes('T01C3.200'));assert.ok(byName['board-layers.svg'].includes('<svg'));
 const bytes=new Uint8Array(await zipStore(files).arrayBuffer()),view=new DataView(bytes.buffer),names=[];let offset=0;while(view.getUint32(offset,true)===0x04034b50){const nameLength=view.getUint16(offset+26,true),extraLength=view.getUint16(offset+28,true),size=view.getUint32(offset+18,true);names.push(new TextDecoder().decode(bytes.slice(offset+30,offset+30+nameLength)));offset+=30+nameLength+extraLength+size}assert.ok(names.includes('board-F_Cu.gbr'));assert.ok(names.includes('board-NPTH.drl'));assert.ok(names.includes('README.txt'));
});
