/* VoltPRo core contracts. Framework-independent and deterministic. */
(()=>{"use strict";
const VERSION=5;
const PIN_TYPES=new Set(["electrical","power","control","ground","digital","analog","passive"]);
const DOMAINS=new Set(["dc","ac","three-phase","digital","control","mechanical","ground"]);
const assert=(ok,msg)=>{if(!ok)throw new Error("VoltPRo contract: "+msg)};
function terminal(id,label,type="electrical",number=null,domain="dc"){
 assert(typeof id==="string"&&id.length>0,"terminal id required");
 assert(PIN_TYPES.has(type),"unknown pin type "+type);
 assert(DOMAINS.has(domain),"unknown domain "+domain);
 return Object.freeze({id,label:String(label??id),type,number:number==null?null:String(number),domain});
}
function device(spec={}){
 assert(typeof spec.id==="string"&&spec.id,"device id required");
 assert(typeof spec.type==="string"&&spec.type,"device type required");
 const terminals=(spec.terminals||[]).map(t=>terminal(t.id,t.label,t.type,t.number,t.domain));
 assert(new Set(terminals.map(t=>t.id)).size===terminals.length,"duplicate terminal ids: "+spec.id);
 return {id:spec.id,type:spec.type,version:spec.version||"1.0.0",ref:spec.ref||spec.id,position:{x:Number(spec.position?.x||0),y:Number(spec.position?.y||0)},rotation:Number(spec.rotation||0),terminals,parameters:structuredClone(spec.parameters||{}),state:structuredClone(spec.state||{}),model:spec.model||null};
}
function wire(spec={}){
 assert(spec.from&&spec.to,"wire endpoints required");
 return {id:spec.id||"W"+cryptoSafeId(),from:String(spec.from),to:String(spec.to),segments:Array.isArray(spec.segments)?structuredClone(spec.segments):[],number:spec.number??null,crossSection:spec.crossSection??null,colour:spec.colour??null,material:spec.material??null,domain:spec.domain||"dc",phase:spec.phase??null};
}
function cryptoSafeId(){return Math.random().toString(36).slice(2,10)}
function project(spec={}){
 return {format:"voltpro",version:VERSION,metadata:structuredClone(spec.metadata||{}),settings:{grid:20,units:"SI",symbolStandard:"IEC",...(spec.settings||{})},workspace:spec.workspace||"schematic",devices:(spec.devices||spec.components||[]).map(device),wires:(spec.wires||[]).map(wire),nets:structuredClone(spec.nets||[]),panel:structuredClone(spec.panel||{rails:[],items:[],width:600,height:400}),simulation:structuredClone(spec.simulation||{mode:"dc",running:false,time:0}),plc:structuredClone(spec.plc||null)};
}
window.VoltProContracts={VERSION,PIN_TYPES,DOMAINS,terminal,device,wire,project};
})();