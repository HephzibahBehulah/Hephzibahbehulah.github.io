(function(root){'use strict';
function endpoint(value,format){if(typeof value==='string')return value.trim()||null;if(!value||!Number.isInteger(Number(value.r))||!Number.isInteger(Number(value.c)))return null;return typeof format==='function'?format(Number(value.r),Number(value.c)):null;}
function build(wires=[],formatEndpoint){return (Array.isArray(wires)?wires:[]).map((wire,index)=>{const from=endpoint(wire?.a??wire?.from,formatEndpoint),to=endpoint(wire?.b??wire?.to,formatEndpoint),color=typeof wire?.color==='string'&&/^#[0-9a-f]{6}$/i.test(wire.color)?wire.color.toUpperCase():'Unspecified';return {id:String(wire?.id||'W'+(index+1)),from,to,color,status:from&&to&&from!==to?'ready':'incomplete'};});}
const api={build};root.VoltProBreadboardWiringChecklist=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
