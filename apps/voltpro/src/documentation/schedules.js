(()=>{'use strict';
function bom(p){const m=new Map();for(const d of p.devices||[]){const key=d.type||'unknown';m.set(key,(m.get(key)||0)+1)}return Array.from(m.entries()).map(([type,quantity])=>({type,quantity}))}
function wireSchedule(p){return (p.wires||[]).map(w=>({number:w.number||w.id,from:w.from,to:w.to,crossSection:w.crossSection||null,colour:w.colour||null,domain:w.domain||null,phase:w.phase||null}))}
function terminalSchedule(p){
 const netByTerminal=new Map();
 for(const n of p.nets||[])for(const t of n.terminals||[])netByTerminal.set(t,n.id);
 return (p.devices||[]).flatMap(d=>(d.terminals||[]).map(t=>{
  const endpoint=d.id+':'+t.id;
  return {device:d.ref||d.id,terminal:t.number||t.label||t.id,net:netByTerminal.get(endpoint)||null};
 }));
}
window.VoltProSchedules={bom,wireSchedule,terminalSchedule};
})();
