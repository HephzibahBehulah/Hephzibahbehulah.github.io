(()=>{"use strict";
function graph(project){const g=new Map();for(const w of project.wires||[]){const [a,b]=[w.a,w.b];if(!g.has(a))g.set(a,new Set());if(!g.has(b))g.set(b,new Set());g.get(a).add(b);g.get(b).add(a)}return g}
function connected(project){const comps=project.components||[],g=graph(project);if(!comps.length)return false;const pins=c=>Array.from({length:c.pins?.length||c.pinCount||0},(_,i)=>c.id+":"+i);const start=comps[0];const seen=new Set(pins(start));const q=[...seen];while(q.length){const n=q.shift();for(const x of g.get(n)||[])if(!seen.has(x)){seen.add(x);q.push(x)}}return comps.every(c=>pins(c).some(p=>seen.has(p)))}
function validate(project,ch){const comps=project.components||[],types=new Set(comps.map(c=>c.type)),missing=(ch.requiredComponents||ch.required||[]).filter(t=>!types.has(t));const v=ch.validation||{};let ok=!missing.length;
if(v.minComponents)ok=ok&&comps.length>=v.minComponents;if(ch.rules)for(const r of ch.rules){if(r.type==="minComponents")ok=ok&&comps.length>=r.value;if(r.type==="connected")ok=ok&&(project.wires||[]).length>=r.value}
if(v.mustContainTypes)ok=ok&&v.mustContainTypes.every(t=>types.has(t));if(v.connected)ok=ok&&connected(project);
if(v.closedSwitches)ok=ok&&comps.filter(c=>c.type==="switch").every(c=>c.props?.closed);
const score=ok?100:Math.max(0,100-missing.length*20-(connected(project)?0:20));return {passed:ok,missing,score,message:ok?"Challenge complete":"Incomplete topology or required components",topologyConnected:connected(project)}}
function run(project,ch){return {...validate(project,ch),id:ch.id,title:ch.title}}
window.VoltProChallenge={validate,run,connected};
})();