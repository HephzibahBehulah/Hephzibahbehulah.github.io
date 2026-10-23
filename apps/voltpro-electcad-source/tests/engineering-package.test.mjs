import test from 'node:test';
import assert from 'node:assert/strict';
import {createIndustrialFacilityPackage,createSmartSubstationPackage,packageToCsv,renderSingleLineSvg,renderSiteLayoutSvg} from '../src/engineering-package.mjs';
import {exportEngineeringPackageIfc4,exportEngineeringPackageGltf,analyzeEngineeringPackageClashes} from '../src/engineering-tools.mjs';

test('industrial package calculates the specified connected load and demand transparently',()=>{
 const p=createIndustrialFacilityPackage();
 assert.equal(p.calculations.connectedLoadKW,3315);
 assert.equal(p.calculations.utilizedLoadBeforeDiversityKW,2691.75);
 assert.equal(p.calculations.maximumDemandKW,2287.99);
 assert.equal(p.calculations.designDemandWithReserveKW,2859.98);
 assert.equal(p.calculations.selectedTransformerKVA,4000);
 assert.equal(p.loadSchedule.length,6);
 assert.equal(p.cableSchedule.length,6);
 assert.equal(p.protection.length,7);
 assert.equal(p.equipmentCoordinates.length,9);
 assert.ok(p.assumptions.some(x=>x.includes('not issued for construction')));
 assert.equal(p.groundGrid.earthResistanceOhm,null);
});

test('generator size is not misrepresented as full-facility capacity',()=>{
 const p=createIndustrialFacilityPackage();
 assert.ok(p.calculations.generatorSpecifiedKVA<p.calculations.designApparentPowerKVA);
 assert.ok(p.assumptions.some(x=>x.includes('not sized to support the full facility')));
});

test('industrial SLD SVG and schedule CSV are exportable',()=>{
 const p=createIndustrialFacilityPackage();
 const svg=renderSingleLineSvg(p);
 assert.match(svg,/<svg/);
 assert.match(svg,/UTILITY 11 kV/);
 assert.match(svg,/NOT FOR CONSTRUCTION/);
 const layout=renderSiteLayoutSvg(p);assert.match(layout,/CONCEPT SITE LAYOUT/);assert.match(layout,/Production hall/);
 const csv=packageToCsv(p,'loadSchedule');
 assert.match(csv,/connectedKW/);
 assert.match(csv,/CNC machines/);
 assert.equal(packageToCsv(p,'unknownSection'),'');
});

test('smart substation package exposes required equipment without inventing ratings',()=>{
 const p=createSmartSubstationPackage();
 assert.equal(p.architecture.length,8);
 assert.equal(p.calculations.status,'NOT CALCULATED');
 assert.ok(p.assumptions.some(x=>x.includes('No transformer ratings')));
 assert.match(renderSingleLineSvg(p),/132 kV GRID/);
 assert.match(packageToCsv(p,'architecture'),/SCADA-01/);
});

test('smart substation concept massing contains explicit geometry and connected route endpoints',()=>{const p=createSmartSubstationPackage();assert.equal(p.project.facility.buildingZones.length,5);assert.equal(p.equipmentCoordinates.length,8);assert.equal(p.cableRoutes.length,6);assert.ok(p.equipmentCoordinates.every(e=>e.widthM>0&&e.depthM>0&&e.heightM>0&&e.geometryBasis==='Concept envelope only'));const onFootprint=(x,y,e)=>{const dx=Math.abs(x-e.xM),dy=Math.abs(y-e.yM),hw=e.widthM/2,hd=e.depthM/2;return (Math.abs(dx-hw)<.01&&dy<=hd+.01)||(Math.abs(dy-hd)<.01&&dx<=hw+.01)};for(const route of p.cableRoutes){assert.ok(p.equipmentCoordinates.some(e=>onFootprint(route.x1M,route.y1M,e)),'route start must meet an equipment footprint: '+route.tag);assert.ok(p.equipmentCoordinates.some(e=>onFootprint(route.x2M,route.y2M,e)),'route end must meet an equipment footprint: '+route.tag)}assert.match(renderSiteLayoutSvg(p),/132 kV switchyard/);assert.match(p.deliverables.BIM,/Concept 3D site massing/)});


test('smart substation package generates inspectable 3D concept geometry and IFC/glTF exports',()=>{const p=createSmartSubstationPackage();assert.equal(p.project.facility.buildingZones.length,5);assert.equal(p.equipmentCoordinates.length,8);assert.equal(p.cableRoutes.length,6);assert.ok(p.equipmentCoordinates.every(e=>e.widthM>0&&e.depthM>0&&e.heightM>0));const gltf=JSON.parse(exportEngineeringPackageGltf(p));const expectedRouteNodes=p.cableRoutes.reduce((n,r)=>n+1+(Math.abs(r.y2M-r.y1M)>.01?1:0),0);assert.equal(gltf.nodes.length,p.project.facility.buildingZones.length+p.equipmentCoordinates.length+expectedRouteNodes);const ifc=exportEngineeringPackageIfc4(p);assert.match(ifc,/TR-132-01 transformer/);assert.match(ifc,/IFCSPACE/);assert.match(ifc,/IFCCABLESEGMENT/);assert.match(renderSiteLayoutSvg(p),/Concept zone/);assert.match(renderSiteLayoutSvg(p),/BAY-132-01/);assert.equal(analyzeEngineeringPackageClashes(p).forConstruction,false);assert.equal(p.calculations.status,'NOT CALCULATED')});
