(()=>{'use strict';
function fields(device){return Object.entries(device.parameters||{}).map(([key,value])=>({key,value,type:typeof value,editable:true})).concat(Object.entries(device.state||{}).map(([key,value])=>({key,value,type:typeof value,editable:false,state:true}))) }
function setParameter(device,key,value){return {...device,parameters:{...(device.parameters||{}),[key]:value}}}
function validate(device){const errors=[];if(!device.id)errors.push('id required');if(!device.type)errors.push('type required');for(const t of device.terminals||[])if(!t.id)errors.push('terminal id required');return {valid:errors.length===0,errors}}
window.VoltProInspector={fields,setParameter,validate};
})();