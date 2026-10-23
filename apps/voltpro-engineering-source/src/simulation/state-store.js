(()=>{'use strict';
const clone=x=>structuredClone(x);
function create(initial={}){
 let state=clone({version:1,time:0,running:false,electrical:{nodes:{},branches:{},nets:{}},devices:{},faults:[],diagnostics:[],...(initial||{})});
 const listeners=new Set();
 function publish(next){state=Object.freeze(clone(next));for(const fn of listeners)fn(clone(state));return clone(state)}
 return {
  get:()=>clone(state),
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn)},
  setElectrical(e){return publish({...state,electrical:clone(e)})},
  setDevice(id,value){return publish({...state,devices:{...state.devices,[id]:clone(value)}})},
  setFaults(faults){return publish({...state,faults:clone(faults)})},
  setDiagnostics(diagnostics){return publish({...state,diagnostics:clone(diagnostics)})},
  tick(time){return publish({...state,time})},
  setRunning(running){return publish({...state,running:Boolean(running)})},
  snapshot(){return clone(state)}
 };
}
window.VoltProSimulationStore={create};
})();
