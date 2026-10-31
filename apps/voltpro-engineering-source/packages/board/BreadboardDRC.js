/* Educational breadboard placement checks. These checks do not certify electrical safety. */
(function(root,factory){const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.VoltProBreadboardDRC=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
'use strict';
const ROWS=['a','b','c','d','e','f','g','h','i','j'];
function holeId(point){
 if(!point||!Number.isInteger(point.r)||!Number.isInteger(point.c)||point.c<0)return null;
 const {r,c}=point;
 if(r===0||r===1||r===13||r===14){if(c>=50)return null;return (r<2?'T':'B')+'P'+(r%2===0?'+':'-')+(c+1);}
 if(r<2||r>14||r===7||r<0||c>=63)return null;
 const rowIndex=r<=6?r-2:r-3;
 return ROWS[rowIndex]?ROWS[rowIndex]+(c+1):null;
}
function check(project,{model}={}){
 const errors=[],warnings=[],infos=[],parts=Array.isArray(project?.parts)?project.parts:[],wires=Array.isArray(project?.wires)?project.wires:[];
 const add=(list,code,object,message)=>list.push({code,object:object||null,message});
 const partIds=new Set(),wireIds=new Set(),legOwners=new Map(),nodes=new Map(),wirePairs=new Set();
 const find=id=>{if(!nodes.has(id))nodes.set(id,id);let p=nodes.get(id);if(p!==id){p=find(p);nodes.set(id,p)}return p};
 const union=(a,b)=>{if(a&&b){const x=find(a),y=find(b);if(x!==y)nodes.set(y,x)}};
 const getNode=point=>{const id=holeId(point);return id&&model?.holeAt?.(id)?model.nodeOf(id):null};
 for(const part of parts){
  const id=String(part?.id||'');
  if(!id||partIds.has(id)){add(errors,'duplicate-component-id',id,'Component references must be present and unique.');continue}
  partIds.add(id);
  if(!Array.isArray(part.pins)||part.pins.length<2){if(part.type!=='arduino')add(warnings,'missing-footprint-pins',id,'Component has no complete terminal footprint; place or re-place it before simulation.');continue}
  const ownHoles=new Set(),validNodes=[];
  for(let i=0;i<part.pins.length;i++){
   const pin=part.pins[i],hole=holeId(pin),node=hole&&model?.holeAt?.(hole)?model.nodeOf(hole):null;
   if(!node){add(errors,'pin-outside-board',id,'Terminal '+(i+1)+' is outside the 830-point board or in the center trench.');continue}
   if(ownHoles.has(hole))add(errors,'duplicate-component-pin',id,'Two terminals of this component occupy the same hole ('+hole+').');
   ownHoles.add(hole);validNodes.push(node);
   const prior=legOwners.get(hole);
   if(prior&&prior!==id)add(errors,'overlapping-component-legs',id,'Terminal '+hole+' is already occupied by component '+prior+'.');
   else legOwners.set(hole,id);
  }
  if(part.pins.length===2&&validNodes.length===2&&validNodes[0]===validNodes[1])add(errors,'component-on-one-strip',id,'Both component terminals land on the same connected breadboard strip.');
 }
 const validWires=[];
 for(const wire of wires){
  const id=String(wire?.id||'');
  if(!id||wireIds.has(id)){add(errors,'duplicate-wire-id',id,'Jumper references must be present and unique.');continue}
  wireIds.add(id);
  const a=holeId(wire.a),b=holeId(wire.b),an=a&&model?.holeAt?.(a)?model.nodeOf(a):null,bn=b&&model?.holeAt?.(b)?model.nodeOf(b):null;
  if(!an||!bn){add(errors,'wire-outside-board',id,'Jumper endpoint is outside the 830-point board or in the center trench.');continue}
  if(a===b){add(errors,'zero-length-wire',id,'Jumper endpoints must use two different holes.');continue}
  const key=[a,b].sort().join('|');if(wirePairs.has(key))add(warnings,'duplicate-jumper',id,'This jumper duplicates another direct connection between the same holes.');wirePairs.add(key);
  union(an,bn);validWires.push({id,a,b,an,bn});
 }
 const negativeRailNodes=[];
 for(const row of [1,14])for(let c=0;c<50;c++){const id=holeId({r:row,c}),node=id&&model?.holeAt?.(id)?model.nodeOf(id):null;if(node)negativeRailNodes.push(node)}
 const sources=parts.filter(part=>['battery','acsource'].includes(part?.type)&&Array.isArray(part.pins)&&part.pins.length>=2);
 for(const source of sources){
  const a=getNode(source.pins[0]),b=getNode(source.pins[1]);
  if(a&&b&&find(a)===find(b))add(errors,'source-terminals-shorted',source.id,'The source terminals are connected by board strips and jumper wires with no load between them.');
  const referenced=[a,b].some(node=>node&&negativeRailNodes.some(rail=>find(node)===find(rail)));
  if(!referenced)add(warnings,'return-reference-unmarked',source.id,'Neither source terminal reaches a designated negative power rail. The simulator may establish a mathematical reference; this check cannot infer a protective-earth or safety ground.');
 }
 if(!sources.length)infos.push({code:'no-source',object:null,message:'No battery or AC source is present; placement checks ran without an electrical return-reference check.'});
 return {valid:errors.length===0,errors,warnings,infos,checked:{components:parts.length,wires:wires.length}};
}
return {holeId,check};
});
