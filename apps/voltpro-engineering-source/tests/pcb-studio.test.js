'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{VoltProTerminalGraph:{definitionFor:()=>({terminals:[{id:'1'},{id:'2'}]})}},document:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('src/ui/pcb-studio.js','utf8'),context);const {model}=context.window.VoltProPCBStudio;

test('breadboard PCB nets include shared strips and jumper wires that start on empty holes',()=>{
 const p={parts:[{id:'R1',type:'resistor',value:'1 kΩ',x:5,y:3,pins:[{r:3,c:5},{r:3,c:10}]},{id:'LED1',type:'led',value:'Red LED',x:20,y:4,pins:[{r:4,c:20},{r:4,c:25}]}],wires:[{a:{r:4,c:5},b:{r:4,c:20}}]};
 const board=model('breadboard',p),a=board.comps[0].pins[0],b=board.comps[1].pins[0];
 assert.equal(a.net,b.net);assert.equal(board.nets.length,1);assert.ok(board.board.w>=130);assert.equal(board.unmapped.length,0);
});

test('schematic PCB conversion preserves explicit terminal wiring and flags unsupported packages',()=>{
 const p={components:[{id:'R1',type:'resistor',props:{}},{id:'D1',type:'diode',props:{}},{id:'X1',type:'industrial-contactor',props:{}}],wires:[{a:'R1:1',b:'D1:0'}]};
 const board=model('simulator',p);assert.equal(board.comps[0].pins[1].net,board.comps[1].pins[0].net);assert.equal(board.comps[2].pins.length,0);assert.deepEqual(Array.from(board.unmapped),['X1']);assert.equal(board.nets.length,1);
});
