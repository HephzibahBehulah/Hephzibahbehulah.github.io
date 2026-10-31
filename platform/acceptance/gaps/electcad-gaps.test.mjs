import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require=createRequire(new URL('../../../apps/engineering/voltpro-electcad/package.json',import.meta.url));
import { assignWireReferences, formatSheetZoneReference } from '../../../apps/engineering/voltpro-electcad/src/wire-numbering.mjs';
import { recordDocumentAudit, readDocumentAudit, exportDocumentAudit } from '../../../apps/engineering/voltpro-electcad/src/document-audit.mjs';

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
test.todo("accept.electcad.bom.manufacturing-and-lengths");
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
