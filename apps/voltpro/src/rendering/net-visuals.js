(()=>{'use strict';
function key(p){return Math.round(p.x*100)/100+':'+Math.round(p.y*100)/100}
function junctions(wires){const counts=new Map();for(const w of wires)for(const s of w.segments||[]){for(const p of [{x:s.x1,y:s.y1},{x:s.x2,y:s.y2}]){const k=key(p);counts.set(k,(counts.get(k)||0)+1)}}return Array.from(counts.entries()).filter(([,n])=>n>=3).map(([k])=>{const [x,y]=k.split(':').map(Number);return {x,y}})}
function labels(nets,labels=[]){const by=new Map(labels.map(x=>[x.netId,x]));return nets.map(n=>({...n,label:by.get(n.id)?.label||n.id}))}
function highlight(netId,nets){const n=nets.find(x=>x.id===netId);return new Set(n?.terminals||[])}
window.VoltProNetVisuals={junctions,labels,highlight};
})();