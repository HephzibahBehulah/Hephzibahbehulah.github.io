import test from 'node:test';
import assert from 'node:assert/strict';
import {createSchematic3DPackage} from '../src/schematic-3d.mjs';

test('3D schematic preview preserves component tags and wire routes with explicit scale',()=>{
 const model=createSchematic3DPackage({projectName:'Panel A',activeSheetId:'s1',sheets:[{id:'s1',name:'Main',parts:[{id:'p1',type:'motor',ref:'M1',value:'7.5 kW',manufacturer:'Acme',partNumber:'MTR-75',x:100,y:150}],wires:[{id:'w1',ref:'W1',x1:100,y1:150,x2:200,y2:150}]}]});
 assert.equal(model.kind,'schematic-3d-preview');assert.equal(model.project.name,'Panel A');assert.equal(model.equipmentCoordinates[0].tag,'M1');assert.equal(model.equipmentCoordinates[0].manufacturer,'Acme');assert.equal(model.equipmentCoordinates[0].partNumber,'MTR-75');assert.equal(model.equipmentCoordinates[0].xM,2);assert.equal(model.cableRoutes[0].x2M,4);assert.equal(model.forConstruction,false);assert.match(model.status,/NOT A BUILDING BIM MODEL/);
});
test('3D schematic preview rejects a project without sheets',()=>assert.throws(()=>createSchematic3DPackage({sheets:[]}),/no active sheet/));
