import assert from 'node:assert/strict';
import test from 'node:test';
import { expandBounds, initialBounds, rowLabel, rulerCells } from './canvas-geometry';
test('model space expands both ways without shrinking existing bounds',()=>{const b=expandBounds(initialBounds,-12000,9000,2000,1000);assert.ok(b.minX < -12000 && b.maxY > 10000);assert.equal(b.minY,initialBounds.minY);assert.equal(b.maxX,initialBounds.maxX);assert.deepEqual(expandBounds(b,0,0,100,100),b);});
test('rulers track camera translation and zoom',()=>{const c=rulerCells(-450,1.5,900);assert.equal(c[0].index,1);assert.equal(c[0].position,-150);assert.equal(c[1].position,150);assert.equal(c[1].size,300);assert.equal(c[1].label,'3');const n=rulerCells(300,.5,500,true);assert.equal(n[0].index,-3);assert.equal(n[0].label,'−C');assert.ok(n.at(-1)!.position>=500);});
test('lettered rulers extend past Z and into negative coordinates',()=>{assert.equal(rowLabel(0),'A');assert.equal(rowLabel(25),'Z');assert.equal(rowLabel(26),'AA');assert.equal(rowLabel(701),'ZZ');assert.equal(rowLabel(702),'AAA');assert.equal(rowLabel(-27),'−AA');});
