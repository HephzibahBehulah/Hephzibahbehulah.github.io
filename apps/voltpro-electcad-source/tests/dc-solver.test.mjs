import test from 'node:test';
import assert from 'node:assert/strict';
import { runDcOperatingPoint } from '../src/dc-solver.mjs';

test('DC MNA solves a grounded 24 V source and 1 kΩ resistor',()=>{
  const sheet={id:'s1',name:'Test',parts:[
    {id:'v1',type:'power',x:100,y:100,ref:'V1',value:'24 V DC'},
    {id:'r1',type:'resistor',x:200,y:100,ref:'R1',value:'1 kΩ'},
    {id:'g1',type:'ground',x:200,y:200,ref:'GND',value:'0'}
  ],wires:[
    {id:'w1',x1:138,y1:100,x2:162,y2:100},
    {id:'w2',x1:200,y1:190,x2:62,y2:100},
    {id:'w3',x1:238,y1:100,x2:200,y2:190}
  ]};
  const result=runDcOperatingPoint(sheet);
  assert.equal(result.analysis,'DC operating point');
  assert.equal(result.componentResults.length,2);
  const resistor=result.componentResults.find(x=>x.ref==='R1');
  assert.ok(Math.abs(Math.abs(resistor.voltageDrop)-24)<1e-6);
  assert.ok(Math.abs(Math.abs(resistor.current)-0.024)<1e-6);
  assert.ok(Math.abs(Math.abs(resistor.power)-0.576)<1e-6);
});

test('DC analysis requires an explicit ground',()=>{
  assert.throws(()=>runDcOperatingPoint({parts:[{id:'r',type:'resistor',x:0,y:0,ref:'R1',value:'1 kΩ'}],wires:[]}),/explicit ground/);
});

test('invalid resistor values fail instead of inventing a result',()=>{
  const sheet={parts:[
    {id:'v',type:'power',x:100,y:100,ref:'V1',value:'24 V'},
    {id:'r',type:'resistor',x:200,y:100,ref:'R1',value:'unknown'},
    {id:'g',type:'ground',x:200,y:200,ref:'GND',value:'0'}
  ],wires:[
    {id:'a',x1:138,y1:100,x2:162,y2:100},
    {id:'b',x1:200,y1:190,x2:62,y2:100},
    {id:'c',x1:238,y1:100,x2:200,y2:190}
  ]};
  assert.throws(()=>runDcOperatingPoint(sheet),/resistance must be a positive SI value/);
});
