/* Appended inside the pinned PLC module so imports use its validator and project store. */
window.HBPLCStudioBridge={importProject(input){
 const project=JSON.parse(JSON.stringify(input));const errors=Ei(project);if(errors.length)throw Error(errors.join(' '));
 const previous=xt.getState().project,history=JSON.parse(localStorage.getItem('voltpro-recovery-history-v1')||'[]');if(!Array.isArray(history))throw Error('PLC recovery history could not be read. Save or export the current drawing first.');
 localStorage.setItem('voltpro-recovery-history-v1',JSON.stringify([{id:crypto.randomUUID(),kind:'plc',name:previous.name,created:new Date().toISOString(),data:previous},...history].slice(0,30)));
 xt.getState().setProject(project);return {name:project.name,devices:project.nodes.length,wires:project.edges.length};
}};
