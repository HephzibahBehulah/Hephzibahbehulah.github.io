import {catalogItem} from './building-catalog.mjs';
import {connectionLength,nodeSpecification} from './building-tools.mjs';
export function circuitAssessment(doc){
 const result=[];
 for(const circuit of doc.circuits||[]){
  const nodes=doc.nodes.filter(n=>n.circuit===circuit.id),loads=nodes.filter(n=>['lighting','sockets','loads','ventilation','energy'].includes(catalogItem(n.type,doc.catalog)?.category)),unknown=loads.filter(n=>!Number.isFinite(nodeSpecification(n,doc).loadW)),watts=loads.reduce((sum,n)=>sum+(Number(nodeSpecification(n,doc).loadW)||0)*(n.quantity||1),0);
  const issues=[],device=doc.nodes.find(n=>n.id===circuit.overcurrentDeviceId),protection=device?nodeSpecification(device,doc):{},rcd=doc.nodes.find(n=>n.id===circuit.rcdId),rcdSpec=rcd?nodeSpecification(rcd,doc):{};
  const known=unknown.length===0&&loads.length>0,defined=circuit.voltage>0&&circuit.powerFactor>0&&circuit.powerFactor<=1&&circuit.demandFactor>0&&circuit.demandFactor<=1&&[1,3].includes(circuit.phases);
  const current=known&&defined?watts*circuit.demandFactor/((circuit.phases===3?Math.sqrt(3):1)*circuit.voltage*circuit.powerFactor):null;
  if(unknown.length)issues.push({level:'review',message:`${unknown.length} connected equipment/outlet loads need declared input power.`});
  if(!defined)issues.push({level:'review',message:'Enter circuit voltage, phase arrangement, power factor and a justified demand factor.'});
  if(!device||!['breaker','rcbo'].includes(catalogItem(device?.type,doc.catalog)?.symbol))issues.push({level:'error',message:'Assign an overcurrent protective device.'});
  if(current!==null&&protection.ratingA>0&&current>protection.ratingA)issues.push({level:'error',message:`Calculated design current ${current.toFixed(2)} A exceeds ${protection.ratingA} A protection.`});
  if(circuit.requiresRCD&&!(rcdSpec.residualMA>0&&rcdSpec.residualMA<=30)&&!(protection.residualMA>0&&protection.residualMA<=30))issues.push({level:'error',message:'Required ≤30 mA RCD protection is missing.'});
  if(circuit.faultKA>0&&protection.breakingKA>0&&circuit.faultKA>protection.breakingKA)issues.push({level:'error',message:'Prospective fault current exceeds the requested device breaking capacity.'});
  if(!(circuit.faultKA>0))issues.push({level:'review',message:'Fault level and device duty/disconnection verification are missing.'});
  const cables=doc.wires.filter(w=>w.circuit===circuit.id&&!w.internalBoardId),routeResults=[],adj=new Map(),parent=new Map(),edgeChild=new Map(),order=[],loadByNode=new Map(loads.map(n=>[n.id,(Number(nodeSpecification(n,doc).loadW)||0)*(n.quantity||1)]));
  for(const wire of cables){for(const [a,b]of [[wire.from,wire.to],[wire.to,wire.from]]){if(!adj.has(a))adj.set(a,[]);adj.get(a).push({to:b,wire:wire.id});}}
  const root=circuit.overcurrentDeviceId,seen=new Set(),todo=root?[root]:[];let cyclic=false;
  if(root)parent.set(root,null);
  while(todo.length){const id=todo.pop();if(seen.has(id))continue;seen.add(id);order.push(id);for(const edge of adj.get(id)||[]){if(edge.to===parent.get(id))continue;if(parent.has(edge.to)){cyclic=true;continue;}parent.set(edge.to,id);edgeChild.set(edge.wire,edge.to);todo.push(edge.to);}}
  const subtree=new Map(order.map(id=>[id,loadByNode.get(id)||0]));for(const id of [...order].reverse()){const p=parent.get(id);if(p)subtree.set(p,(subtree.get(p)||0)+(subtree.get(id)||0));}
  if(cyclic)issues.push({level:'review',message:'Looped/meshed wiring needs an appropriate network calculation; radial branch/drop results are withheld.'});
  for(const load of loads)if(!seen.has(load.id))issues.push({level:'error',message:load.id+': load has no routed path to the assigned protective device.'});
  const branchCurrent=wire=>!cyclic&&known&&defined&&edgeChild.has(wire.id)?(subtree.get(edgeChild.get(wire.id))||0)*circuit.demandFactor/((circuit.phases===3?Math.sqrt(3):1)*circuit.voltage*circuit.powerFactor):null;
  for(const wire of cables){const branchA=branchCurrent(wire),item=catalogItem(wire.cableId,doc.catalog),spec=item?.spec,ampacity=wire.verifiedAmpacityA||circuit.verifiedAmpacityA,length=connectionLength(doc,wire);let drop=null;
   if(!(ampacity>0))issues.push({level:'review',message:`${wire.id}: verified installed cable ampacity is missing.`});
   if(ampacity>0&&protection.ratingA>ampacity)issues.push({level:'error',message:`${wire.id}: protection exceeds the verified installed ampacity.`});
   if(ampacity>0&&branchA!==null&&branchA>ampacity)issues.push({level:'error',message:`${wire.id}: design current exceeds the verified installed ampacity.`});
   const minimum=circuit.minimumSectionMM2||wire.minimumSectionMM2;if(minimum>0&&spec?.sectionMM2<minimum)issues.push({level:'error',message:`${wire.id}: cable is below the explicit circuit cross-section requirement.`});
   if(item?.system==='power'&&wire.pePresent!==true)issues.push({level:'error',message:`${wire.id}: PE conductor provision is missing.`});
   const required=circuit.phases===3?(circuit.neutralRequired===false?4:5):3;if(spec?.cores>1&&spec.cores<required)issues.push({level:'error',message:`${wire.id}: ${required} conductors including PE are required by the declared circuit arrangement.`});
   if(spec?.conductor==='Cu'&&spec.sectionMM2>0&&length!==null&&branchA!==null&&Number.isFinite(circuit.conductorTemperatureC)&&Number.isFinite(circuit.reactanceOhmPerKm)&&circuit.reactanceOhmPerKm>=0&&(wire.runs||1)===1){const r=.0175*(1+.00393*(circuit.conductorTemperatureC-20))/spec.sectionMM2,x=circuit.reactanceOhmPerKm/1000,pf=circuit.powerFactor;const volts=(circuit.phases===3?Math.sqrt(3):2)*length*branchA*(r*pf+x*Math.sqrt(1-pf*pf));drop={volts,percent:100*volts/circuit.voltage};}
   else issues.push({level:'review',message:`${wire.id}: complete length, load, temperature and reactance inputs are needed for the circuit voltage-drop screen.`});
   routeResults.push({id:wire.id,lengthM:length,designCurrentA:branchA,drop});
  }
  const accumulated=new Map([[root,0]]),dropByWire=new Map(routeResults.map(r=>[r.id,r.drop?.volts??null]));
  for(const id of order.slice(1)){const wireId=[...edgeChild.entries()].find(([,child])=>child===id)?.[0],prior=accumulated.get(parent.get(id)),drop=dropByWire.get(wireId);accumulated.set(id,prior!==null&&prior!==undefined&&drop!==null&&drop!==undefined?prior+drop:null);}
  const endDrops=loads.map(load=>({nodeId:load.id,volts:cyclic?null:accumulated.get(load.id)??null}));for(const endpoint of endDrops){if(endpoint.volts!==null){endpoint.percent=endpoint.volts/circuit.voltage*100;if(circuit.maxVoltageDropPercent>0&&endpoint.percent>circuit.maxVoltageDropPercent)issues.push({level:'error',message:`${endpoint.nodeId}: cumulative supply-to-load drop ${endpoint.percent.toFixed(2)}% exceeds the entered ${circuit.maxVoltageDropPercent}% criterion.`});}}
  const board=doc.nodes.find(n=>n.id===circuit.boardId);if(!board||catalogItem(board.type,doc.catalog)?.category!=='distribution')issues.push({level:'error',message:'Assign the circuit to a distribution board.'});
  result.push({id:circuit.id,label:circuit.label||circuit.id,knownConnectedW:watts,unresolvedLoads:unknown.length,designCurrentA:current,board:board?.tag||board?.name||'',protection:device?.tag||'',rcd:rcd?.tag||'',routes:routeResults,endDrops,issues});
 }
 return result;
}
export function circuitSchedule(doc){return circuitAssessment(doc).map(c=>({circuit:c.id,label:c.label,board:c.board,protection:c.protection,rcd:c.rcd,knownConnectedW:c.knownConnectedW,unresolvedLoads:c.unresolvedLoads,designCurrentA:c.designCurrentA??'UNRESOLVED',routeCount:c.routes.length,reviewCount:c.issues.length}));}
