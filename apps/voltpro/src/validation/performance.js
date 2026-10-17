(()=>{'use strict';
function profile(fn,iterations=1){const t0=performance.now();let result;for(let i=0;i<iterations;i++)result=fn();const ms=performance.now()-t0;return {milliseconds:ms,perIteration:ms/iterations,result}}
function limits(project){const devices=(project.devices||[]).length,wires=(project.wires||[]).length;return {devices,wires,warnings:[...(devices>500?['device-count-high']:[]),...(wires>1500?['wire-count-high']:[])]}}
window.VoltProPerformance={profile,limits};
})();