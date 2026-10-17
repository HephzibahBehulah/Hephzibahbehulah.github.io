/* Main-thread bridge. The worker protocol is intentionally small and deterministic. */
(()=>{'use strict';
function create(workerFactory){let seq=0;const pending=new Map();const worker=workerFactory();worker.onmessage=e=>{const m=e.data||{},p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.ok===false?p.reject(new Error(m.error||'Simulation worker error')):p.resolve(m.result)};return {request(type,payload){const id='REQ'+(++seq);return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker.postMessage({id,type,payload})})},terminate(){for(const p of pending.values())p.reject(new Error('Simulation worker terminated'));pending.clear();worker.terminate()}}}
window.VoltProSimulationBridge={create};
})();