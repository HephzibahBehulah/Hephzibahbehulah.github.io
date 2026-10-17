(()=>{"use strict";
const gates={AND:(a,b)=>a&&b?1:0,OR:(a,b)=>a||b?1:0,XOR:(a,b)=>(!!a)!==!!b?1:0,NAND:(a,b)=>!(a&&b)?1:0,NOR:(a,b)=>!(a||b)?1:0,NOT:a=>a?0:1};
function evaluate(type,inputs=[]){const f=gates[type];if(!f)throw Error("Unsupported gate: "+type);return Number(f(...inputs.map(Boolean)))}
function clock(sequence,steps=16){let out=[];for(let i=0;i<steps;i++)out.push(sequence[i%sequence.length]?1:0);return out}
window.VoltProDigital={evaluate,clock,gates};
})();