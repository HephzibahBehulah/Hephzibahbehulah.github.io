import { catalogItem, PROFILES, CATALOG, CATEGORIES } from './building-catalog.mjs';
export function nodeSpecification(node,doc) {return {...catalogItem(node.type,doc.catalog)?.spec,...node.spec};}
export function connectionLength(doc,wire) {
 const from=doc.nodes.find(n=>n.id===wire.from),to=doc.nodes.find(n=>n.id===wire.to);
 if(!from||!to||wire.internalBoardId)return null;
 const crossFloor=(from.floor||1)!==(to.floor||1);
 if(crossFloor&&!(Number.isFinite(wire.verticalRiseM)&&wire.verticalRiseM>0))return null;
 const segments=wire.segments||[{points:wire.routePoints||[from,to]}];
 const plan=segments.reduce((sum,segment)=>sum+segment.points.slice(1).reduce((length,p,i)=>length+Math.abs(p.x-segment.points[i].x)+Math.abs(p.y-segment.points[i].y),0),0)*doc.gridMillimetres/1000;
 const height=n=>n.inBoard?doc.nodes.find(b=>b.id===n.boardId)?.mountingHeight:n.mountingHeight;
 const tails=Number.isFinite(wire.routingHeightMM)&&[height(from),height(to)].every(Number.isFinite)?(Math.abs(wire.routingHeightMM-height(from))+Math.abs(wire.routingHeightMM-height(to)))/1000:0;
 return (plan+tails+(crossFloor?wire.verticalRiseM:0)+(Number(wire.extraLengthM)||0))*(1+(Number(wire.sparePercent)||0)/100);
}
export function materialSchedule(doc) {
 const rows=new Map();
 function collect(key,row,quantity) {if(rows.has(key))rows.get(key).quantity+=quantity;else rows.set(key,{...row,quantity});}
 for(const node of doc.nodes){const item=catalogItem(node.type,doc.catalog);if(!item)continue;const floor=node.floor||1;
  collect(`${floor}:${node.type}:${JSON.stringify(node.spec||{})}`,{floor,category:CATEGORIES.find(c=>c.id===item.category)?.label||item.category,name:item.label,unit:item.unit,manufacturer:item.manufacturer||'',partNumber:item.partNumber||'',source:item.sourceUrl||'',spec:JSON.stringify(nodeSpecification(node,doc)),basis:'Placed quantity',unmeasured:false},node.quantity||1);
 }
 for(const wire of doc.wires){if(wire.internalBoardId)continue;const cable=catalogItem(wire.cableId,doc.catalog),length=connectionLength(doc,wire),from=doc.nodes.find(n=>n.id===wire.from),floor=from?.floor||1;
  collect(`${floor}:${wire.cableId||'unassigned'}:route:${length===null}`,{floor,category:'Cable routes',name:cable?.label||'Cable selection missing',unit:'m',manufacturer:cable?.manufacturer||'',partNumber:cable?.partNumber||'',source:cable?.sourceUrl||'',spec:JSON.stringify(cable?.spec||{}),basis:length===null?'Vertical length unresolved':'Orthogonal plan + declared height tails + entered rise/extra + spare',unmeasured:length===null},length===null?0:length*(wire.runs||1));
 }
 return [...rows.values()].sort((a,b)=>a.floor-b.floor||a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
}
export function reviewInstallation(doc) {
 const issues=[],circuits=new Map();
 const issue=(code,object,message,level='review')=>issues.push({code,object,message,level});
 const profile=PROFILES[doc.metadata.profile]||PROFILES.DE;
 if(!Number.isInteger(doc.metadata.floors)||doc.metadata.floors<1||doc.metadata.floors>300)issue('floors','Project','Floor count must be 1–300.','error');
 for(const node of doc.nodes){
  const item=catalogItem(node.type,doc.catalog);if(!item)continue;const spec=nodeSpecification(node,doc);
  if(!item.regions.includes(doc.metadata.profile))issue('region',node.id,`${item.label}: outside the selected regional library; obtain local approval.`);
  if((node.floor||1)>doc.metadata.floors||node.floor<1)issue('floor',node.id,'Assigned floor is outside the project floor count.','error');
  if(!(Number.isFinite(node.quantity)&&node.quantity>0))issue('quantity',node.id,'Enter a positive material quantity.','error');
  if(item.kind==='device'&&item.category!=='earthing'&&item.category!=='containment'&&!node.circuit)issue('circuit',node.id,'Assign a circuit identifier.');
  if(node.circuit){const key=`${node.floor||1}:${node.circuit}`;const c=circuits.get(key)||{floor:node.floor||1,id:node.circuit,devices:0,connectedW:0,unknownLoads:0};c.devices++;if(['lighting','ventilation','loads','energy'].includes(item.category)){if(Number.isFinite(spec.loadW)&&spec.loadW>=0)c.connectedW+=spec.loadW*(node.quantity||1);else c.unknownLoads++;}circuits.set(key,c);}
  if(item.kind==='device'&&['lighting','ventilation','loads','energy'].includes(item.category)&&!(Number.isFinite(spec.loadW)&&spec.loadW>=0))issue('load',node.id,'Enter the equipment nameplate input power (W); no assumed load is used.');
  if(node.wallId){const opening=(doc.openings||[]).find(o=>o.wallId===node.wallId&&node.wallOffsetMM>=o.offsetMM&&node.wallOffsetMM<=o.offsetMM+o.widthMM&&node.mountingHeight>=o.sillMM&&node.mountingHeight<=o.sillMM+o.heightMM);if(opening)issue('opening-clearance',node.id,'Mounted equipment overlaps a door/window opening at the entered mounting height.','error');}
  if(!item.manufacturer)issue('part',node.id,'Design specification: select a manufacturer part and verify its datasheet before procurement.','info');
  if(node.boardId){const board=doc.nodes.find(n=>n.id===node.boardId);if(!board||catalogItem(board.type,doc.catalog)?.category!=='distribution'||board.id===node.id)issue('board',node.id,'Board assignment does not identify a separate distribution board.','error');}
  const protection=doc.nodes.find(n=>n.id===node.protectiveDeviceId),ps=protection?nodeSpecification(protection,doc):{};
  if(node.protectiveDeviceId&&(!protection||catalogItem(protection.type,doc.catalog)?.category!=='protection'||protection.id===node.id))issue('protection',node.id,'Protective-device assignment is invalid.','error');
  if(doc.metadata.profile==='DE'&&(item.category==='sockets'||item.category==='lighting'||(/bathroom|badezimmer/i.test(node.room||'')&&['loads','ventilation'].includes(item.category)))){
    if(!protection||!(ps.residualMA>0&&ps.residualMA<=30))issue('DE-RCD',node.id,'German residential/general-use screening: document upstream ≤30 mA RCD protection. Scope and exceptions require DIN VDE 0100-410 review.');
  }
  if(item.category==='distribution'&&item.spec.modules){const allocated=doc.nodes.filter(n=>n.boardId===node.id).reduce((sum,n)=>sum+(Number(n.spec?.modulesUsed)||0),0);if(allocated>item.spec.modules)issue('board-capacity',node.id,`Entered module allocation ${allocated} exceeds ${item.spec.modules} modules.`,'error');}
 }
 for(const wire of doc.wires){
  if(wire.internalBoardId)continue;
  const cable=catalogItem(wire.cableId,doc.catalog),from=doc.nodes.find(n=>n.id===wire.from),to=doc.nodes.find(n=>n.id===wire.to),length=connectionLength(doc,wire);
  if(!cable||cable.kind!=='route')issue('cable',wire.id,'Select a named wire/cable specification for this route.');
  if(cable&&from&&cable.system!==catalogItem(from.type,doc.catalog)?.system)issue('cable-system',wire.id,'Selected cable belongs to a different power/data system.','error');
  if(wire.routeMode==='wall'&&!Number.isFinite(wire.routingHeightMM))issue('routing-height',wire.id,'Enter the routing height before checking door/window penetrations.');
  if(wire.routingError)issue('route-error',wire.id,wire.routingError,'error');
  if(length===null)issue('vertical-length',wire.id,'Cross-floor route: enter surveyed vertical rise; no assumed storey height is used.');
  if(!(wire.runs>=1&&Number.isInteger(wire.runs)))issue('runs',wire.id,'Parallel cable/conductor count must be a positive integer.','error');
  if([wire.extraLengthM,wire.sparePercent].some(v=>v!==undefined&&(!Number.isFinite(v)||v<0)))issue('length',wire.id,'Extra route length and spare percentage must be non-negative finite values.','error');
  const protection=doc.nodes.find(n=>n.id===wire.protectiveDeviceId),ps=protection?nodeSpecification(protection,doc):{};
  if(wire.protectiveDeviceId&&(!protection||!['breaker','rcbo'].includes(catalogItem(protection.type,doc.catalog)?.symbol)))issue('route-protection',wire.id,'Route protective device is missing or invalid.','error');
  if(cable?.system==='power'){
   if(wire.pePresent!==true)issue('missing-PE',wire.id,'Protective-earth conductor is missing or not documented.','error');
   if(wire.minimumSectionMM2>0&&cable.spec.sectionMM2<wire.minimumSectionMM2)issue('section-constraint',wire.id,'Cable cross-section is below the explicit project design requirement; thermal sizing is still required.','error');
   if(!(wire.verifiedAmpacityA>0))issue('ampacity',wire.id,'Enter ampacity verified for installation method, temperature, grouping and terminations. Cross-section alone does not establish ampacity.');
   if(protection&&catalogItem(protection.type,doc.catalog)?.symbol==='rcd')issue('RCCB-overcurrent',wire.id,'An RCCB does not provide overcurrent protection. Assign an MCB, MCCB, ACB or RCBO.','error');
   if(wire.verifiedAmpacityA>0&&ps.ratingA>wire.verifiedAmpacityA)issue('overcurrent',wire.id,'Selected protective-device rating exceeds the entered verified cable ampacity.','error');
   if(wire.designCurrentA>0&&ps.ratingA>0&&wire.designCurrentA>ps.ratingA)issue('design-current',wire.id,'Entered design current exceeds the protective-device rating.','error');
   if(wire.prospectiveFaultKA>0&&ps.breakingKA>0&&wire.prospectiveFaultKA>ps.breakingKA)issue('fault-duty',wire.id,'Entered prospective fault current exceeds the requested breaking capacity. Verify the actual device ratings and applicable standard.','error');
   if(!(wire.designCurrentA>0))issue('design-current',wire.id,'Enter circuit design current; no automatic cable size is selected.');
  }
 }
 if(doc.metadata.floors>=2)issue('riser','Project','Multi-storey review: riser capacity, fire compartments, penetration systems, emergency supplies, lift/fire-pump provisions and approval drawings remain to be engineered.');
 return {profile,issues,circuits:[...circuits.values()],materials:materialSchedule(doc),notAssessed:['Protective-device selectivity and disconnection times','Thermal cable sizing and correction factors','Fire-resistance/CPR and fire-compartment suitability','Earthing and lightning risk assessment','NEC/AHJ, NEMSA or DEWA approval','Licensed symbol identity and final construction certification']};
}
export function resistiveVoltageDrop(doc,wire) {
 const cable=catalogItem(wire.cableId,doc.catalog),length=connectionLength(doc,wire),s=cable?.spec;
 if((wire.runs||1)!==1||length===null||s?.conductor!=='Cu'||!(s.sectionMM2>0)||!(wire.designCurrentA>0)||!(wire.circuitVoltage>0)||!['1-phase','3-phase'].includes(wire.phases))return null;
 const volts=(wire.phases==='3-phase'?Math.sqrt(3):2)*.0175*length*wire.designCurrentA/s.sectionMM2;
 return {volts,percent:100*volts/wire.circuitVoltage,note:'Cu resistance-only estimate at 20 °C; unity power factor; excludes reactance, operating-temperature rise and parallel conductor sharing. Not a cable-sizing or compliance result.'};
}
