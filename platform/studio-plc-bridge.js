/* Appended inside the pinned PLC module so imports use its validator and project store. */
const clearWorkingCanvas=()=>{const state=xt.getState();const current=state.project;if(!current||typeof state.setProject!=='function')return;state.setProject({...current,name:'Untitled PLC project',nodes:[],edges:[]});};
if(typeof document!=='undefined'&&!window.__voltProPLCCanvasTools){
 window.__voltProPLCCanvasTools=true;
 const mount=()=>{if(!document.body)return;const button=document.createElement('button');button.type='button';button.textContent='Clear Canvas';button.setAttribute('aria-label','Clear PLC working canvas');button.style.cssText='position:fixed;z-index:99999;right:18px;top:14px;padding:9px 13px;border-radius:8px;border:1px solid #4a7a89;background:#102733;color:#e7f1f5;font:600 13px system-ui;cursor:pointer;box-shadow:0 3px 12px #0004';button.addEventListener('click',()=>{const state=xt.getState();const project=state.project;if((project?.nodes?.length||project?.edges?.length)&&!window.confirm('Clear the current PLC canvas? Unsaved work will be discarded. Saved library projects will not be deleted.'))return;clearWorkingCanvas();});document.body.appendChild(button);setTimeout(clearWorkingCanvas,0);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else setTimeout(mount,0);
}
window.HBPLCStudioBridge={importProject(input){
 const project=JSON.parse(JSON.stringify(input));const errors=Ei(project);if(errors.length)throw Error(errors.join(' '));
 const previous=xt.getState().project,history=JSON.parse(localStorage.getItem('voltpro-recovery-history-v1')||'[]');if(!Array.isArray(history))throw Error('PLC recovery history could not be read. Save or export the current drawing first.');
 localStorage.setItem('voltpro-recovery-history-v1',JSON.stringify([{id:crypto.randomUUID(),kind:'plc',name:previous.name,created:new Date().toISOString(),data:previous},...history].slice(0,30)));
 xt.getState().setProject(project);return {name:project.name,devices:project.nodes.length,wires:project.edges.length};
}};
