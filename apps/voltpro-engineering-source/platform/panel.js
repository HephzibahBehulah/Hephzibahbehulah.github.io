(()=>{"use strict";
const MODULE=18,WIDTH=600,HEIGHT=400;
const clone=x=>structuredClone(x);
function create(spec={}){
 const rails=Array.isArray(spec.rails)&&spec.rails.length?clone(spec.rails):[{id:"R1",label:"DIN rail 1",length:18,y:92}];
 return {width:Number(spec.width)||WIDTH,height:Number(spec.height)||HEIGHT,enclosure:{label:"Main distribution board",ipRating:"IP40",...(spec.enclosure||{})},rails,items:Array.isArray(spec.items)?clone(spec.items):[],ducts:Array.isArray(spec.ducts)?clone(spec.ducts):[],terminalStrips:Array.isArray(spec.terminalStrips)?clone(spec.terminalStrips):[],excludedComponentIds:Array.isArray(spec.excludedComponentIds)?clone(spec.excludedComponentIds):[]};
}
function normalizeItem(item,index=0){
 const width=Math.max(MODULE,Math.ceil(Number(item.width)||MODULE));
 return {...item,id:String(item.id||"P"+(index+1)),label:String(item.label||item.ref||item.type||"Device"),railId:String(item.railId||"R1"),position:Math.max(0,Number(item.position)||0),width};
}
function place(panel,item){
 if(!panel||!Array.isArray(panel.rails)||!Array.isArray(panel.items))throw Error("Invalid panel layout");
 const next=normalizeItem(item,panel.items.length),rail=panel.rails.find(r=>r.id===next.railId);
 if(!rail)throw Error("Unknown rail: "+next.railId);
 if(next.position+next.width>Number(rail.length||18)*MODULE)throw Error("Device exceeds rail length");
 const existing=panel.items.find(x=>x.id===next.id);
 if(existing)throw Error("Duplicate panel item id: "+next.id);
 panel.items.push(next);return panel;
}
function move(panel,id,changes){
 const item=panel.items.find(x=>x.id===id);if(!item)throw Error("Unknown panel item: "+id);
 const next={...item,...changes,position:Math.max(0,Number(changes.position??item.position)||0)};
 const rail=panel.rails.find(r=>r.id===next.railId);if(!rail)throw Error("Unknown rail: "+next.railId);
 if(next.position+next.width>Number(rail.length||18)*MODULE)throw Error("Device exceeds rail length");
 Object.assign(item,next);return panel;
}
function remove(panel,id){const i=panel.items.findIndex(x=>x.id===id);if(i>=0)panel.items.splice(i,1);return panel}
function addRail(panel,spec={}){const id=String(spec.id||"R"+(panel.rails.length+1));if(panel.rails.some(r=>r.id===id))throw Error("Duplicate rail id: "+id);panel.rails.push({id,label:spec.label||"DIN rail "+(panel.rails.length+1),length:Math.max(1,Math.min(72,Number(spec.length)||18)),y:Number(spec.y)||92+panel.rails.length*110});return panel}
function validate(panelOrItems,legacyRails){
 const panel=Array.isArray(panelOrItems)?{items:panelOrItems,rails:Array.isArray(legacyRails)?legacyRails:[{id:"R1",length:18}]}:(panelOrItems||create());
 const errors=[],warnings=[],ids=new Set();
 for(const r of panel.rails||[]){if(!r.id||ids.has(r.id))errors.push("Rail IDs must be unique.");ids.add(r.id);if(!Number.isFinite(Number(r.length))||Number(r.length)<1)errors.push((r.id||"Rail")+" has an invalid length.")}
 const occupied=new Map(),itemIds=new Set();
 for(const raw of panel.items||[]){
  const x=normalizeItem(raw);if(itemIds.has(x.id))errors.push("Duplicate placement ID: "+x.id+".");itemIds.add(x.id);const rail=(panel.rails||[]).find(r=>r.id===x.railId);
  if(!x.id)errors.push("Every placement needs an ID.");
  if(!rail){errors.push(x.label+" references missing rail "+x.railId+".");continue}
  if(x.position<0||x.position+x.width>Number(rail.length||18)*MODULE)errors.push(x.label+" exceeds "+rail.label+".");
  for(let slot=Math.floor(x.position/MODULE);slot<Math.ceil((x.position+x.width)/MODULE);slot++){
   const key=x.railId+":"+slot,other=occupied.get(key);
   if(other&&other!==x.id)errors.push("Overlap on "+x.railId+" at module "+(slot+1)+": "+other+" and "+x.label+".");
   else occupied.set(key,x.label);
  }
  if(!x.componentId&&x.kind!=="accessory")warnings.push(x.label+" is panel-only and has no schematic component.");
 }
 for(const d of panel.ducts||[])if(Number(d.fill)>0.75)warnings.push((d.label||d.id||"Cable duct")+" exceeds 75% fill; review duct capacity.");
 return {valid:errors.length===0,errors:[...new Set(errors)],warnings:[...new Set(warnings)],modules:occupied.size,deviceCount:(panel.items||[]).filter(x=>x.kind!=="accessory").length,railCount:(panel.rails||[]).length};
}
function dinRail(length=18){return {standard:"TS 35 / DIN rail",length:Math.max(1,Math.min(72,Number(length)||18)),unit:"modules",moduleWidth:MODULE}}
window.VoltProPanel={MODULE,create,normalizeItem,place,move,remove,addRail,validate,dinRail};
})();