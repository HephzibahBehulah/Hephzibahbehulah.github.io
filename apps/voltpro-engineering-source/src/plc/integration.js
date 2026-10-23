(()=>{'use strict';
function applyOutputs(project,io,mapping={}){for(const [tag,target] of Object.entries(mapping.outputs||{})){const d=(project.devices||[]).find(x=>x.id===target);if(!d)continue;d.state={...(d.state||{}),plcCommand:Boolean(io[tag]),coilVoltage:Boolean(io[tag])?Number(d.parameters?.coilVoltage||24):0}}return project}
function readInputs(project,mapping={}){const io={};for(const [tag,target] of Object.entries(mapping.inputs||{})){const d=(project.devices||[]).find(x=>x.id===target);io[tag]=Boolean(d?.state?.energized||d?.state?.active||d?.state?.closed)}return io}
window.VoltProPLCIntegration={applyOutputs,readInputs};
})();