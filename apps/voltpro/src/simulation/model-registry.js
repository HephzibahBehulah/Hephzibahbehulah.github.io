/* VoltPRo executable device-model registry. */
(()=>{'use strict';
const models=new Map();
function register(model){if(!model?.id||typeof model.evaluate!=='function')throw Error('Invalid device model');if(models.has(model.id)&&!model.replace)throw Error('Duplicate device model: '+model.id);models.set(model.id,model);return model.id}
function get(id){return models.get(id)||null}
function has(id){return models.has(id)}
function list(){return Array.from(models.values()).map(m=>({id:m.id,version:m.version||'1.0.0',domains:m.domains||[],validated:Boolean(m.validated)}))}
function evaluate(device,context={}){const id=device.model||device.type,m=get(id);if(!m)return {ok:false,status:'catalogue-only',deviceId:device.id,model:id,error:'No executable model registered'};return m.evaluate(device,context)}
window.VoltProDeviceModels={register,get,has,list,evaluate};
})();