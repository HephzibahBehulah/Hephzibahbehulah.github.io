import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require=createRequire(new URL('../../../apps/engineering/voltpro-electcad/package.json',import.meta.url));
import { assignWireReferences, formatSheetZoneReference } from '../../../apps/engineering/voltpro-electcad/src/wire-numbering.mjs';
import { recordDocumentAudit, readDocumentAudit, exportDocumentAudit } from '../../../apps/engineering/voltpro-electcad/src/document-audit.mjs';
import { buildManufacturingSchedule, routeGeometryLength } from '../../../apps/engineering/voltpro-electcad/src/manufacturing-bom.mjs';

test.todo("accept.electcad.drc.verified-profile");
test("accept.electcad.wire-numbers.off-page-links", () => {
 const input=[{id:'wire-a'},{id:'wire-b',ref:'old'}],numbered=assignWireReferences(input);
 assert.deepEqual(numbered.map(wire=>wire.ref),['W001','W002']);
 assert.equal(input[0].ref,undefined,'numbering returns new wire records without mutating the current document');
 assert.throws(()=>assignWireReferences(input,'bad-prefix'),/uppercase/);
 assert.equal(formatSheetZoneReference(2,'C4'),'Sheet 2 / Zone C4');
 assert.equal(formatSheetZoneReference('', 'C4'),'');
 const app=fs.readFileSync(new URL('../../../apps/engineering/voltpro-electcad/App.tsx',import.meta.url),'utf8');
 assert.match(app,/case 'Tools':[\s\S]*\['Wire numbering',autoNumberWires\]/);
 assert.match(app,/setWires\(ws=>assignWireReferences\(ws\)\)/);
 assert.match(app,/formatSheetZoneReference\(sheetNumber\(target\.id\),zoneOf\(part\.x,part\.y\)\)/);
 assert.match(app,/<label>Connected sheet/);
});
test("accept.electcad.bom.manufacturing-and-lengths", async()=>{
 const sheets=[
  {id:'power',name:'Power',parts:[
   {id:'p1',type:'circuit-breaker',ref:'Q1',value:'3P 16 A',manufacturer:'Owner entered',partNumber:'CB-16'},
   {id:'p2',type:'circuit-breaker',ref:'Q2',value:'3P 16 A',manufacturer:'Owner entered',partNumber:'CB-16'},
   {id:'n1',type:'text-note',ref:'N1',value:'Not a material'}
  ],wires:[{id:'w1',ref:'W001',label:'L1',cableType:'Cu conductor',gauge:'2.5 mm²',cores:1,manufacturer:'Owner entered',partNumber:'CU-25',x1:10,y1:20,x2:70,y2:100,lengthAllowance:10}]},
  {id:'control',name:'Control',parts:[{id:'p3',type:'circuit-breaker',ref:'Q3',value:'3P 16 A',manufacturer:'Owner entered',partNumber:'CB-16'}],wires:[{id:'w2',x1:0,y1:0,x2:0,y2:50}]}
 ];
 const result=buildManufacturingSchedule(sheets);
 assert.deepEqual(routeGeometryLength(sheets[0].wires[0]),{horizontal:60,vertical:80,total:140});
 assert.equal(result.deviceItems.length,1);assert.equal(result.deviceItems[0].quantity,3);assert.deepEqual(result.deviceItems[0].references,['Q1','Q2','Q3']);
 assert.equal(result.totals.deviceQuantity,3);assert.equal(result.totals.cableRunCount,2);assert.equal(result.totals.cableGeometryLength,190);
 assert.equal(result.cableRuns[0].geometryLength,140);assert.equal(result.cableRuns[0].geometryPlusAllowance,150);assert.equal(result.cableRuns[0].sourcingStatus,'Owner-supplied identity; not independently verified');
 assert.match(result.cableRuns[0].lengthStatus,/not installed|installed route/i);assert.ok(result.notes.some(note=>/not independently verified|does not assert manufacturer validation/i.test(note)));
 assert.throws(()=>routeGeometryLength({x1:NaN,y1:0,x2:1,y2:1}),/finite/);
 const app=fs.readFileSync(new URL('../../../apps/engineering/voltpro-electcad/App.tsx',import.meta.url),'utf8');
 assert.match(app,/buildManufacturingSchedule\(documentData\(\)\.sheets\)/);assert.match(app,/geometryLength/);assert.match(app,/wire\.lengthAllowance/);assert.match(app,/tr\('cableType'\)/);
 const ts=require('typescript'),sourceUrl=new URL('../../../apps/engineering/voltpro-electcad/src/editor-model.ts',import.meta.url),source=fs.readFileSync(sourceUrl,'utf8'),js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,dir=path.dirname(fileURLToPath(sourceUrl)),temp=path.join(dir,`.accept-bom-${process.pid}-${Date.now()}.mjs`);
 fs.writeFileSync(temp,js);
 try{const {decodeDocument,serializeDocument}=await import(pathToFileURL(temp).href);const doc=decodeDocument({schemaVersion:3,projectName:'Manufacturing',activeSheetId:'s1',sheets:[{id:'s1',name:'Main',parts:[{id:'p',type:'cable',x:0,y:0,ref:'C1',value:'Control cable',manufacturer:'Owner entered',partNumber:'C-2'}],wires:[{id:'w',x1:0,y1:0,x2:10,y2:10,cableType:'Shielded cable',manufacturer:'Owner entered',partNumber:'W-2',lengthAllowance:5}]}]});const roundtrip=JSON.parse(serializeDocument(doc));assert.equal(roundtrip.sheets[0].wires[0].cableType,'Shielded cable');assert.equal(roundtrip.sheets[0].wires[0].lengthAllowance,5);assert.equal(roundtrip.sheets[0].parts[0].partNumber,'C-2');assert.throws(()=>decodeDocument({...roundtrip,sheets:[{...roundtrip.sheets[0],wires:[{...roundtrip.sheets[0].wires[0],lengthAllowance:-1}]}]}),/Invalid wire/);}finally{fs.rmSync(temp,{force:true});}
});
test("accept.electcad.sheets.cross-link-integrity",async()=>{
 const ts=require('typescript'),sourceUrl=new URL('../../../apps/engineering/voltpro-electcad/src/editor-model.ts',import.meta.url),source=fs.readFileSync(sourceUrl,'utf8'),js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,dir=path.dirname(fileURLToPath(sourceUrl)),temp=path.join(dir,`.accept-sheets-${process.pid}-${Date.now()}.mjs`);
 fs.writeFileSync(temp,js);
 try{
  const {decodeDocument}=await import(pathToFileURL(temp).href),document=decodeDocument({schemaVersion:3,projectName:'Two-sheet cross-reference',activeSheetId:'power',sheets:[{id:'power',name:'Power',parts:[{id:'X1',type:'off-page-connector',x:40,y:60,ref:'X1',value:'Control supply to control sheet',targetSheetId:'control'}],wires:[]},{id:'control',name:'Control',parts:[{id:'X2',type:'off-page-connector',x:80,y:100,ref:'X2',value:'Control supply from power sheet',targetSheetId:'power'}],wires:[]}]});
  assert.equal(document.sheets.length,2);assert.equal(document.sheets[0].parts[0].targetSheetId,'control');assert.equal(document.sheets[1].parts[0].targetSheetId,'power');
  const missing=structuredClone(document);missing.sheets[0].parts[0].targetSheetId='missing';assert.throws(()=>decodeDocument(missing),/Invalid component/);
  const self=structuredClone(document);self.sheets[0].parts[0].targetSheetId='power';assert.throws(()=>decodeDocument(self),/Invalid component/);
 }finally{fs.rmSync(temp,{force:true});}
});
test("accept.electcad.history.document-audit",()=>{
 const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
 const snapshot=(count)=>({schemaVersion:3,projectName:'Private drawing contents must not be stored',activeSheetId:'s1',sheets:[{id:'s1',name:'Main',parts:Array.from({length:count},(_,i)=>({id:`p${i}`,type:'resistor',x:i,y:0,ref:`R${i}`,value:'1k'})),wires:[]}]});
 recordDocumentAudit('Audit Project',snapshot(0),snapshot(1),{storage,at:1000});
 let entries=recordDocumentAudit('Audit Project',snapshot(1),snapshot(3),{storage,at:2000});
 assert.equal(entries.length,1,'rapid edits coalesce');assert.deepEqual(entries[0].changes,{sheets:0,devices:3,wires:0});
 assert.equal(JSON.stringify(entries).includes('Private drawing contents'),false,'audit stores counts rather than project contents');
 for(let index=0;index<305;index++)entries=recordDocumentAudit('Audit Project',snapshot(3),snapshot(4),{storage,at:10000+index*2000});
 assert.equal(readDocumentAudit('Audit Project',storage).length,300,'local history is capped');
 const exported=JSON.parse(exportDocumentAudit('Audit Project',readDocumentAudit('Audit Project',storage)));
 assert.equal(exported.schemaVersion,1);assert.equal(exported.entries.length,300);
 const app=fs.readFileSync(new URL('../../../apps/engineering/voltpro-electcad/App.tsx',import.meta.url),'utf8');
 assert.match(app,/\['Diagnostics','Simulation','Reports','Console','History'\]/);assert.match(app,/Export audit JSON/);assert.match(app,/recordDocumentAudit\(projectName,previous,currentSnapshot\)/);
});
test.todo("accept.electcad.wiring.routing-colors-crossings");
