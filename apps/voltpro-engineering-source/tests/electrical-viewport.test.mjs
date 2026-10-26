import test from 'node:test';
import assert from 'node:assert/strict';
import {drawingPoint,visibleTicks,zoomScroll,drawingExtent,clampZoom} from '../electrical-viewport.mjs';
import {createBuildingDocument,recoverBuildingDocument,validateBuildingDocument} from '../building-document.mjs';
test('placement maps a scrolled and zoomed surface back to integer model grid',()=>{
  assert.deepEqual(drawingPoint(560,250,{left:-41.333333,top:15.333333},1.2),{x:22,y:8});
  assert.deepEqual(drawingPoint(-100,-100,{left:0,top:0},.25),{x:1,y:0});
});
test('virtual rulers reach 10000 and ZZ without allocating the entire ruler',()=>{
  const columns=visibleTicks(239024,1,1000,10001),rows=visibleTicks(16248,1,600,702);
  assert.equal(columns.at(-1).index,10000);assert.equal(rows.at(-1).index,701);
  assert.ok(columns.length<50);assert.ok(rows.length<30);
  assert.ok(visibleTicks(0,.25,1200,10001).length<=52);
});
test('zoom preserves the model point under the gesture anchor and respects limits',()=>{
  const s=zoomScroll(400,300,1,2,200,100);
  assert.equal((s.left+200)/2,600);assert.equal((s.top+100)/2,400);
  assert.equal(clampZoom(.01),.1);assert.equal(clampZoom(20),2.5);
});
test('expanded drawing preserves imported projects beyond the former 80 by 42 boundary',()=>{
  const doc=createBuildingDocument({name:'Imported title',documentNumber:'D-42',drafter:'Tester'});
  doc.nodes.push({id:'B1',type:'wall-switch',name:'Switch',x:12000,y:900,tag:'S1',room:'Hall',voltage:'230 V AC',mountingHeight:1000});
  const loaded=recoverBuildingDocument(JSON.parse(JSON.stringify(doc)));
  assert.equal(validateBuildingDocument(loaded).errors.length,0);assert.deepEqual(loaded.metadata,doc.metadata);
  const size=drawingExtent(loaded);assert.ok(size.width>12000*24);assert.ok(size.height>900*24);
});
