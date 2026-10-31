/* Advisory pin-contract checks for breadboard nets; never substitutes for a safety review. */
(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.VoltProBreadboardCompatibility=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
'use strict';
function check(project,{model,components}={}){
 const warnings=[],infos=[],nets=new Map(),find=id=>{if(!nets.has(id))nets.set(id,id);let p=nets.get(id);if(p!==id){p=find(p);nets.set(id,p)}return p},union=(a,b)=>{if(a&&b){const x=find(a),y=find(b);if(x!==y)nets.set(y,x)}},node=point=>{const r=point?.r,c=point?.c;if(!Number.isInteger(r)||!Number.isInteger(c)||c<0)return null;let hole;if(r===0||r===1||r===13||r===14){if(c>=50)return null;hole=(r<2?'T':'B')+'P'+(r%2===0?'+':'-')+(c+1)}else{if(r<2||r>14||r===7||c>=63)return null;hole='abcdefghij'[r<=6?r-2:r-3]+(c+1)}return model?.holeAt?.(hole)?model.nodeOf(hole):null},add=(code,net,objects,message)=>warnings.push({code,net,objects:[...new Set(objects)],message});
 const pins=[];
 for(const part of Array.isArray(project?.parts)?project.parts:[]){if(!Array.isArray(part?.pins))continue;const contract=components?.get?.(part.type);for(let i=0;i<part.pins.length;i++){const terminal=contract?.terminals?.[i],id=node(part.pins[i]);if(!id||!terminal)continue;pins.push({partId:String(part.id),pin:terminal.label||terminal.number||String(i+1),net:id,direction:terminal.direction||'passive',domain:terminal.domain||null,minimum:terminal.minimumVoltageV,maximum:terminal.maximumVoltageV});}}
 for(const pin of pins)find(pin.net);
 for(const wire of Array.isArray(project?.wires)?project.wires:[])union(node(wire.a),node(wire.b));
 const groups=new Map();for(const pin of pins){const id=find(pin.net);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(pin)}
 for(const [id,group]of groups){const devices=[...new Set(group.map(pin=>pin.partId))];if(devices.length<2)continue;
  const domains=[...new Set(group.map(pin=>pin.domain).filter(Boolean))];if(domains.length>1)add('domain-mismatch',id,devices,'Connected terminals declare different signal domains ('+domains.join(', ')+').');
  const drivers=group.filter(pin=>pin.direction==='output');if(drivers.length>1&&new Set(drivers.map(pin=>pin.partId)).size>1)add('multiple-output-drivers',id,drivers.map(pin=>pin.partId),'Multiple active outputs share one electrical net; check for output contention.');
  const ranged=group.filter(pin=>Number.isFinite(pin.minimum)||Number.isFinite(pin.maximum));if(ranged.length>1){const minimum=Math.max(...ranged.map(pin=>Number.isFinite(pin.minimum)?pin.minimum:-Infinity)),maximum=Math.min(...ranged.map(pin=>Number.isFinite(pin.maximum)?pin.maximum:Infinity));if(minimum>maximum)add('voltage-range-mismatch',id,ranged.map(pin=>pin.partId),'Declared terminal voltage ranges do not overlap.');}
  if(!drivers.length&&group.every(pin=>pin.direction==='input'))add('input-without-driver',id,devices,'This connected net contains only input terminals; verify its source or bias path.');
 }
 if(!pins.length)infos.push({code:'no-terminal-contracts',message:'No component pin contracts were available for compatibility review.'});
 return {valid:warnings.length===0,warnings,infos,checked:{terminals:pins.length,nets:groups.size}};
}
return {check};
});
