(()=>{'use strict';
function validate(project){const errors=[];const ids=new Set();for(const d of project.devices||[]){if(ids.has(d.id))errors.push('duplicate device '+d.id);ids.add(d.id);for(const t of d.terminals||[]){if(!t.id)errors.push('terminal id missing '+d.id)}}for(const w of project.wires||[]){if(!w.from||!w.to)errors.push('wire endpoint missing '+w.id)}return {passed:errors.length===0,errors}}
window.VoltProAcceptance={validate};
})();