import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('src/editor-model.ts','utf8');
const javascript=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('module','exports',javascript)(module,module.exports);
const {decodeDocument,serializeDocument,netGroups,connectablePins,wireSegments}=module.exports;
test('Pages entry stays relative for repository deployment',()=>assert.ok(fs.readFileSync('index.html','utf8').includes('./main.tsx')));
test('legacy version one projects migrate into a sheet',()=>{const migrated=decodeDocument({schemaVersion:1,projectName:'Migrated',parts:[],wires:[]});assert.equal(migrated.schemaVersion,2);assert.equal(migrated.sheets.length,1);});
test('invalid and duplicate IDs are rejected',()=>{const sample={schemaVersion:2,projectName:'Test',activeSheetId:'one',sheets:[{id:'one',name:'Sheet',parts:[{id:'a',type:'resistor',x:0,y:0,ref:'R1',value:'100'},{id:'a',type:'resistor',x:20,y:0,ref:'R2',value:'200'}],wires:[]}]};assert.throws(()=>decodeDocument(sample),/Duplicate component/);sample.sheets[0].parts.pop();sample.sheets[0].parts[0].x=Infinity;assert.throws(()=>decodeDocument(sample),/Invalid component/);});
test('serialization survives round-trip',()=>{const doc=decodeDocument({schemaVersion:2,projectName:'Test',activeSheetId:'one',sheets:[{id:'one',name:'Sheet',parts:[],wires:[]}]});assert.deepEqual(decodeDocument(JSON.parse(serializeDocument(doc))),doc);});
test('orthogonal wire bend creates two segments',()=>{assert.equal(wireSegments({id:'x',x1:0,y1:0,x2:20,y2:20}).length,2);});
test('a pin touching the middle of a wire shares its net',()=>{const groups=netGroups({id:'s',name:'S',parts:[{id:'terminal',type:'terminal',x:10,y:0,ref:'X1',value:'1'}],wires:[{id:'wire',x1:0,y1:0,x2:20,y2:0}]});assert.ok(groups.some(g=>g.includes('pin:terminal:0')&&g.includes('0,0')&&g.includes('20,0')));});
test('unconnected crossings remain separate',()=>{const groups=netGroups({id:'s',name:'S',parts:[],wires:[{id:'h',x1:0,y1:10,x2:20,y2:10},{id:'v',x1:10,y1:0,x2:10,y2:20}]});assert.equal(groups.length,2);});
test('pin transformations respect quarter turns',()=>{assert.deepEqual(connectablePins({id:'r',type:'resistor',x:50,y:50,ref:'R1',value:'1k',rotation:90}),[{x:50,y:12},{x:50,y:88}]);});

test('transistor and op-amp expose three explicit electrical pins',()=>{assert.equal(connectablePins({id:'q',type:'npn-transistor',x:100,y:100,ref:'Q1',value:'2N2222'}).length,3);assert.deepEqual(connectablePins({id:'u',type:'op-amp',x:100,y:100,ref:'U1',value:'ideal'}),[{x:62,y:88},{x:62,y:112},{x:138,y:100}]);});
test('explicit junction pin joins wires that meet at its location',()=>{const groups=netGroups({id:'s',name:'S',parts:[{id:'j',type:'junction',x:10,y:10,ref:'J1',value:'junction'}],wires:[{id:'h',x1:0,y1:10,x2:10,y2:10},{id:'v',x1:10,y1:10,x2:10,y2:20}]});assert.ok(groups.some(g=>g.includes('pin:j:0')));});

test('matching named net labels connect separate wire groups',()=>{const groups=netGroups({id:'s',name:'S',parts:[{id:'n1',type:'net-label',x:10,y:10,ref:'N1',value:'+24V'},{id:'n2',type:'net-label',x:100,y:10,ref:'N2',value:'+24V'}],wires:[]});assert.ok(groups.some(g=>g.includes('pin:n1:0')&&g.includes('pin:n2:0')));});

test('wire labels and cable metadata survive serialization and are validated',()=>{const doc={schemaVersion:2,projectName:'Wire metadata',activeSheetId:'s',sheets:[{id:'s',name:'Sheet',parts:[],wires:[{id:'w',x1:0,y1:0,x2:20,y2:20,ref:'W001',label:'+24V',color:'#58d9c2',gauge:'1.5 mm²',cores:3}]}]};assert.deepEqual(decodeDocument(JSON.parse(serializeDocument(decodeDocument(doc)))),doc);doc.sheets[0].wires[0].color='url(javascript:alert(1))';assert.throws(()=>decodeDocument(doc),/Invalid wire/);});

test('horizontal mirroring changes pin locations and survives project validation',()=>{const original={id:'r',type:'resistor',x:50,y:50,ref:'R1',value:'1k'};assert.deepEqual(connectablePins(original),[{x:12,y:50},{x:88,y:50}]);assert.deepEqual(connectablePins({...original,mirrorX:true}),[{x:88,y:50},{x:12,y:50}]);const doc={schemaVersion:2,projectName:'Mirror',activeSheetId:'s',sheets:[{id:'s',name:'Sheet',parts:[{...original,mirrorX:true}],wires:[]}]};assert.equal(decodeDocument(doc).sheets[0].parts[0].mirrorX,true);});

test('project title-block metadata survives serialization and is validated',()=>{const doc={schemaVersion:2,projectName:'Title block',activeSheetId:'s',metadata:{projectNumber:'VP-100',client:'Client A',engineer:'Engineer B',revision:'C',standard:'IEC 61082',description:'Control panel'},sheets:[{id:'s',name:'Sheet',parts:[],wires:[]}]};assert.deepEqual(decodeDocument(JSON.parse(serializeDocument(decodeDocument(doc)))),doc);doc.metadata.projectNumber='x'.repeat(501);assert.throws(()=>decodeDocument(doc),/Invalid project metadata/);});
