(()=>{"use strict";
const registry=new Map();
function register(def){if(!def?.id||registry.has(def.id))throw Error("Plugin id missing or already registered");registry.set(def.id,Object.freeze({...def}));return def.id}
function list(){return [...registry.values()]}
function load(url){return fetch(url).then(r=>{if(!r.ok)throw Error("Plugin load failed");return r.json()}).then(register)}
window.VoltProPlugins={register,list,load};
})();