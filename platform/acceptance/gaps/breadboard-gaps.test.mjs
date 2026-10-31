import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);

test("accept.breadboard.drc.placement-and-ground",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),model=require(path.join(root,"packages/board/BreadboardModel.js")),drc=require(path.join(root,"packages/board/BreadboardDRC.js")),board=model.createDefaultModel();
 const battery={id:"BAT1",type:"battery",pins:[{r:2,c:0},{r:8,c:0}]};
 const missingReturn=drc.check({parts:[battery],wires:[]},{model:board});assert.equal(missingReturn.valid,true);assert.ok(missingReturn.warnings.some(x=>x.code==="return-reference-unmarked"));
 const returned=drc.check({parts:[battery],wires:[{id:"W1",a:{r:8,c:0},b:{r:14,c:0}}]},{model:board});assert.equal(returned.valid,true);assert.equal(returned.warnings.length,0);
 const bad=drc.check({parts:[battery,{id:"R1",type:"resistor",pins:[{r:2,c:0},{r:3,c:5}]},{id:"X1",type:"capacitor",pins:[{r:7,c:4},{r:8,c:4}]}],wires:[{id:"W2",a:{r:2,c:0},b:{r:8,c:0}}]},{model:board});
 assert.ok(bad.errors.some(x=>x.code==="overlapping-component-legs"));assert.ok(bad.errors.some(x=>x.code==="pin-outside-board"));assert.ok(bad.errors.some(x=>x.code==="source-terminals-shorted"));
 const html=fs.readFileSync(path.join(root,"breadboard.html"),"utf8"),studio=fs.readFileSync(path.join(root,"src/ui/breadboard-studio.js"),"utf8");assert.match(html,/BreadboardDRC\.js/);assert.match(html,/data-proxy="#bbRunDRC"/);assert.match(studio,/id="bbRunDRC"/);assert.match(studio,/VoltProBreadboardDRC\.check/);assert.match(studio,/do not establish protective earth/);
});
test("accept.breadboard.wiring-checklist.endpoints",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),checklist=require(path.join(root,"packages/board/WiringChecklist.js"));
 const rows=checklist.build([{id:"W1",a:{r:2,c:4},b:{r:8,c:9},color:"#e37777"},{id:"W2",a:{r:3,c:5},b:{r:3,c:5},color:"invalid"},{id:"W3",a:null,b:{r:4,c:8}}],(r,c)=>`hole-${r}-${c}`);
 assert.deepEqual(rows.map(row=>[row.id,row.from,row.to,row.color,row.status]),[["W1","hole-2-4","hole-8-9","#E37777","ready"],["W2","hole-3-5","hole-3-5","Unspecified","incomplete"],["W3",null,"hole-4-8","Unspecified","incomplete"]]);
 const html=fs.readFileSync(path.join(root,"breadboard.html"),"utf8"),studio=fs.readFileSync(path.join(root,"src/ui/breadboard-studio.js"),"utf8");
 assert.match(html,/Wire checklist/);assert.match(html,/packages\/board\/WiringChecklist\.js[^>]*><\/script><script src="packages\/board\/BreadboardBOM\.js[^>]*><\/script><script src="src\/ui\/breadboard-studio\.js/);assert.match(studio,/VoltProBreadboardWiringChecklist\.build/);assert.match(studio,/recorded hole endpoints and wire colour/);
});
test("accept.breadboard.bom.replication-details",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),bom=require(path.join(root,"packages/board/BreadboardBOM.js")),model=require(path.join(root,"packages/board/BreadboardModel.js"));
 const rowNames={2:'a',3:'b',4:'c',5:'d',6:'e',8:'f',9:'g',10:'h',11:'i',12:'j'},hole=(r,c)=>rowNames[r]?rowNames[r]+(c+1):null;
 const project={parts:[{id:'R1',type:'resistor',value:'470 Ω',resistanceOhm:470},{id:'R2',type:'resistor',value:'470 Ω',resistanceOhm:470},{id:'LED1',type:'led',value:'Green LED',forwardVoltageV:2.1}],wires:[{id:'W1',a:{r:2,c:0},b:{r:2,c:1},color:'#e37777'},{id:'W2',a:{r:2,c:1},b:{r:3,c:1},color:'#7cadde',measuredLengthMm:25}]};
 const rows=bom.build(project,type=>({resistor:{name:'Resistor'},led:{name:'LED'} }[type]),hole,id=>model.holeAt(id));
 const resistors=rows.find(row=>row.Type==='resistor'),led=rows.find(row=>row.Type==='led'),firstWire=rows.find(row=>row.Reference==='W1'),secondWire=rows.find(row=>row.Reference==='W2');
 assert.equal(resistors.Quantity,2);assert.match(resistors['Value / model data'],/470/);assert.equal(led['LED colour'],'Green');assert.equal(led.Quantity,1);
 assert.equal(firstWire['From hole'],'a1');assert.equal(firstWire['To hole'],'a2');assert.equal(firstWire['Minimum endpoint separation (mm)'],2.54);assert.match(firstWire['Length basis'],/Geometric minimum/);
 assert.equal(secondWire['Measured length (mm)'],25);assert.match(secondWire['Length basis'],/User-entered measured/);
 assert.match(bom.csv(rows),/Minimum endpoint separation/);
 const html=fs.readFileSync(path.join(root,'breadboard.html'),'utf8'),studio=fs.readFileSync(path.join(root,'src/ui/breadboard-studio.js'),'utf8');assert.match(html,/packages\/board\/BreadboardBOM\.js/);assert.match(html,/data-proxy="#bbBOM">Bill of materials/);assert.match(studio,/VoltProBreadboardBOM\.build/);assert.match(studio,/bend and slack allowance/);
});
test("accept.breadboard.pages.independent-projects",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),storeApi=require(path.join(root,"packages/board/BreadboardPageStore.js")),values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};let now=Date.parse("2026-10-31T10:00:00Z");
 const pages=storeApi.create({storage,now:()=>now,maxPages:5}),firstData={format:"voltpro.vbb.json",version:2,parts:[{id:"R1"}],wires:[]},first=pages.create("Divider",firstData);firstData.parts[0].id="MUTATED";
 const second=pages.create("Motor starter",{format:"voltpro.vbb.json",version:2,parts:[{id:"K1"}],wires:[]});assert.notEqual(first.id,second.id);assert.equal(pages.current().name,"Motor starter");
 pages.save(first.id,"Divider",{format:"voltpro.vbb.json",version:2,parts:[{id:"R1"},{id:"R2"}],wires:[]});const opened=pages.open(first.id);assert.deepEqual(opened.data.parts.map(x=>x.id),["R1","R2"]);assert.deepEqual(pages.get(second.id).data.parts.map(x=>x.id),["K1"]);
 const duplicate=pages.duplicate(first.id,"Divider copy");assert.equal(duplicate.name,"Divider copy");assert.equal(pages.list().length,3);assert.equal(pages.remove(second.id),true);
 const restored=storeApi.create({storage,now:()=>now,maxPages:5});assert.equal(restored.current().id,duplicate.id);assert.equal(restored.list().length,2);assert.equal(JSON.parse(restored.export()).pages.length,2);
 const html=fs.readFileSync(path.join(root,"breadboard.html"),"utf8"),studio=fs.readFileSync(path.join(root,"src/ui/breadboard-studio.js"),"utf8");assert.match(html,/BreadboardPageStore\.js/);assert.match(html,/data-proxy="#bbNewPage"/);assert.match(html,/data-proxy="#bbOpenPages"/);assert.match(studio,/function initializePages\(/);assert.match(studio,/pageStore\.save\(activePageId,name,ui\.project\(\)\)/);assert.match(studio,/pageStore\.duplicate\(/);assert.match(studio,/data-export-board-pages/);
});
test("accept.breadboard.history.placement-and-wire-moves",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),auditApi=require(path.join(root,"packages/board/BreadboardAudit.js")),values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};let now=Date.parse("2026-10-30T10:00:00Z");
 const audit=auditApi.create({storage,now:()=>now,maxEntries:10}),empty={parts:[],wires:[]},placed={parts:[{id:"R1",type:"resistor",pins:[{r:2,c:0},{r:2,c:5}],resistanceOhm:220}],wires:[]};
 assert.equal(audit.record(empty,placed,"Divider")[0].action,"placed");
 const moved={parts:[{...placed.parts[0],pins:[{r:2,c:1},{r:2,c:6}]}],wires:[]};audit.record(placed,moved,"Divider");now+=100;audit.record(moved,{parts:[{...moved.parts[0],resistanceOhm:470}],wires:[]},"Divider");
 const wireAdded={parts:moved.parts,wires:[{id:"W1",a:{r:2,c:1},b:{r:8,c:1},color:"#f3bd54"}]};audit.record(moved,wireAdded,"Divider");
 const wireMoved={parts:moved.parts,wires:[{...wireAdded.wires[0],b:{r:8,c:2}}]},wireMovedAgain={parts:moved.parts,wires:[{...wireAdded.wires[0],b:{r:8,c:3}}]};audit.record(wireAdded,wireMoved,"Divider");audit.record(wireMoved,wireMovedAgain,"Divider");
 const entries=audit.list("Divider");assert.equal(entries.length,5);assert.ok(entries.some(x=>x.action==="moved"));assert.ok(entries.some(x=>x.action==="rerouted"&&x.count===2));
 const reopened=auditApi.create({storage,now:()=>now,maxEntries:10});assert.equal(reopened.list("Divider").length,5);assert.equal(JSON.parse(reopened.export("Divider")).entries.length,5);
 const html=fs.readFileSync(path.join(root,"breadboard.html"),"utf8"),studio=fs.readFileSync(path.join(root,"src/ui/breadboard-studio.js"),"utf8");assert.match(html,/BreadboardAudit\.js/);assert.match(html,/data-proxy="#bbHistory"/);assert.match(studio,/audit\.record\(/);assert.match(studio,/audit\.export\(name\)/);
});
test("accept.breadboard.wiring.net-compatibility",()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../apps/voltpro-engineering-source"),model=require(path.join(root,"packages/board/BreadboardModel.js")),rules=require(path.join(root,"packages/board/BreadboardCompatibility.js")),defs={driver:{terminals:[{label:"OUT",direction:"output",domain:"digital",minimumVoltageV:0,maximumVoltageV:3.3},{label:"GND",direction:"passive",domain:"dc"}]},input:{terminals:[{label:"IN",direction:"input",domain:"digital",minimumVoltageV:0,maximumVoltageV:3.3},{label:"GND",direction:"passive",domain:"dc"}]},high:{terminals:[{label:"OUT",direction:"output",domain:"power",minimumVoltageV:5,maximumVoltageV:24},{label:"RET",direction:"passive",domain:"dc"}]}};
 const components={get:type=>defs[type]},project={parts:[{id:"U1",type:"driver",pins:[{r:2,c:0},{r:2,c:5}]},{id:"U2",type:"input",pins:[{r:6,c:0},{r:6,c:5}]}],wires:[]};
 const matched=rules.check(project,{model,components});assert.equal(matched.warnings.length,0);project.parts.push({id:"U3",type:"driver",pins:[{r:6,c:0},{r:6,c:5}]});
 const contention=rules.check(project,{model,components});assert.ok(contention.warnings.some(x=>x.code==="multiple-output-drivers"));
 const mixed={parts:[project.parts[0],{id:"PS1",type:"high",pins:[{r:2,c:0},{r:2,c:9}]}],wires:[]},incompatible=rules.check(mixed,{model,components});assert.ok(incompatible.warnings.some(x=>x.code==="domain-mismatch"));assert.ok(incompatible.warnings.some(x=>x.code==="voltage-range-mismatch"));
 const html=fs.readFileSync(path.join(root,"breadboard.html"),"utf8"),studio=fs.readFileSync(path.join(root,"src/ui/breadboard-studio.js"),"utf8");assert.match(html,/BreadboardCompatibility\.js/);assert.match(html,/data-proxy="#bbRunCompatibility"/);assert.match(studio,/VoltProBreadboardCompatibility\.check/);
});
