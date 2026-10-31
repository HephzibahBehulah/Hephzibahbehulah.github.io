(function(root){'use strict';
function csv(rows){const columns=['Reference','Type','Description','Quantity','Value / model data','LED colour','Wire colour','From hole','To hole','Measured length (mm)','Minimum endpoint separation (mm)','Length basis'];const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';return [columns.join(','),...(rows||[]).map(row=>columns.map(column=>quote(row[column])).join(','))].join('\n');}
function build(project={},definitionFor=()=>null,formatHole=()=>null,geometryFor=()=>null){
 const rows=[],counts=new Map();
 for(const part of Array.isArray(project.parts)?project.parts:[]){
  const definition=definitionFor(part.type)||{},properties={};
  for(const key of ['resistanceOhm','capacitanceF','inductanceH','voltageV','forwardVoltageV','logicVoltage','currentLimitA'])if(Number.isFinite(part[key]))properties[key]=part[key];
  const value=String(part.value??definition.value??'Not specified'),color=String(part.ledColor??part.color??(/^led$/i.test(part.type||'')?value.match(/\b(red|green|blue|yellow|white|amber)\b/i)?.[0]||'Not specified':'Not applicable'));
  const signature=JSON.stringify([part.type,value,properties,color]),existing=counts.get(signature);
  if(existing){existing.Quantity++;existing.Reference+=`, ${part.id||'unreferenced'}`;continue;}
  const row={Reference:String(part.id||'unreferenced'),Type:String(part.type||'unknown'),Description:String(definition.name||definition.label||part.type||'Unspecified component'),Quantity:1,'Value / model data':JSON.stringify({value,...properties}),'LED colour':color,'Wire colour':'','From hole':'','To hole':'','Measured length (mm)':'','Minimum endpoint separation (mm)':'','Length basis':'Component quantity; model data copied from project'};
  counts.set(signature,row);rows.push(row);
 }
 for(const [index,wire] of (Array.isArray(project.wires)?project.wires:[]).entries()){
  const format=point=>point&&Number.isInteger(Number(point.r))&&Number.isInteger(Number(point.c))?formatHole(Number(point.r),Number(point.c)):typeof point==='string'?point:null;
  const from=format(wire?.a??wire?.from),to=format(wire?.b??wire?.to),a=from&&geometryFor(from),b=to&&geometryFor(to),separation=a&&b?Math.hypot(a.x-b.x,a.y-b.y):null;
  const measured=Number.isFinite(wire?.measuredLengthMm)&&wire.measuredLengthMm>=0?wire.measuredLengthMm:null;
  rows.push({Reference:String(wire?.id||`W${index+1}`),Type:'Jumper wire',Description:'Breadboard jumper; verify physical cut length during assembly',Quantity:1,'Value / model data':'','LED colour':'Not applicable','Wire colour':/^#[0-9a-f]{6}$/i.test(wire?.color||'')?wire.color.toUpperCase():'Unspecified','From hole':from||'Unresolved','To hole':to||'Unresolved','Measured length (mm)':measured??'','Minimum endpoint separation (mm)':separation===null?'Unresolved':Number(separation.toFixed(2)),'Length basis':measured===null?(separation===null?'Endpoints unresolved; length not estimated':'Geometric minimum only; actual jumper needs slack and bend allowance'):'User-entered measured cut length'});
 }
 return rows;
}
const api={build,csv};root.VoltProBreadboardBOM=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
