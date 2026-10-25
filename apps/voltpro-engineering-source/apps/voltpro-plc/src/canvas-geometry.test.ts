import assert from 'node:assert/strict';
import test from 'node:test';
import { expandBounds, initialBounds, rowLabel, rulerCells, zoomAtOrigin } from './canvas-geometry';
test('model space expands both ways without shrinking existing bounds',()=>{const b=expandBounds(initialBounds,-12000,9000,2000,1000);assert.ok(b.minX < -12000 && b.maxY > 10000);assert.ok(b.minY<=initialBounds.minY);assert.equal(b.maxX,initialBounds.maxX);assert.deepEqual(expandBounds(b,1000,1000,100,100),b);});
test('rulers track camera translation and zoom',()=>{const c=rulerCells(-450,1.5,900);assert.equal(c[0].index,1);assert.equal(c[0].position,-150);assert.equal(c[1].position,150);assert.equal(c[1].size,300);assert.equal(c[1].label,'2');const n=rulerCells(300,.5,500,true);assert.equal(n[0].index,0);assert.equal(n[0].label,'A');assert.ok(n.at(-1)!.position>=500);});
test('lettered rulers extend past Z and into negative coordinates',()=>{assert.equal(rowLabel(0),'A');assert.equal(rowLabel(25),'Z');assert.equal(rowLabel(26),'AA');assert.equal(rowLabel(701),'ZZ');assert.equal(rowLabel(702),'AAA');assert.equal(rowLabel(-27),'−AA');});

test('spreadsheet ruler endpoints are 0 through 10000 and A through ZZ',()=>{assert.equal(rulerCells(0,1,600)[0].label,'0');assert.equal(rulerCells(-2000000,1,600)[0].label,'10000');assert.equal(rulerCells(-2000000,1,600).length,1);assert.equal(rulerCells(-140200,1,600,true)[0].label,'ZZ');assert.equal(rulerCells(-140200,1,600,true).length,1);assert.deepEqual(rulerCells(-140400,1,600,true),[]);assert.ok(initialBounds.maxX>=200*10001);assert.ok(initialBounds.maxY>=200*702);});


test('zoom preserves the on-screen origin for buttons, wheel and pinch',()=>{for(const camera of [{x:0,y:0,zoom:1},{x:-430,y:-260,zoom:.5}]){for(const zoom of [.25,.65,1,1.7,2.5]){const next=zoomAtOrigin(camera,zoom);assert.equal(next.x,camera.x);assert.equal(next.y,camera.y);if(camera.x===0)assert.equal(rulerCells(next.x,next.zoom,800)[0].position,0);assert.equal(next.zoom,zoom);}}assert.equal(zoomAtOrigin({x:0,y:0,zoom:1},10).zoom,2.5);assert.equal(zoomAtOrigin({x:0,y:0,zoom:1},.01).zoom,.25);});
