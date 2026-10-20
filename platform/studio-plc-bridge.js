/* Appended inside the pinned PLC module so imports use its validator and project store. */
const clearWorkingCanvas=()=>{const state=xt.getState();const current=state.project;if(!current||typeof state.setProject!=='function')return;state.setProject({...current,name:'Untitled PLC project',nodes:[],edges:[]});};
const plcNode=(id,kind,tag,x,y)=>({id,type:'device',position:{x,y},data:{kind,tag,label:tag,preset:1000,pin:kind==='coil'?8:2}});
const plcWire=(id,source,sourceHandle,target,targetHandle)=>({id,source,sourceHandle,target,targetHandle,type:'smoothstep'});
const plcStarter=(kind)=>{
 const n=plcNode,e=plcWire;
 if(kind==='fbd')return {version:1,name:'Function Block Logic · Start AND NOT Stop',mode:'fbd',nodes:[n('start','no','Start',0,0),n('stop','no','Stop',0,240),{...n('not','NOT','INV',240,240),data:{...n('not','NOT','INV',240,240).data,pin:2}},n('and','AND','Enable',480,0),n('coil','coil','Motor',740,0)],edges:[e('a','start','4','and','IN1'),e('b','stop','4','not','IN'),e('c','not','OUT','and','IN2'),e('d','and','OUT','coil','A1')]};
 if(kind==='plant'){
  const nodes=[],edges=[];
  for(let i=1;i<=3;i++){const p='u'+i+'_';nodes.push(n(p+'l','supply','L'+i,0,(i-1)*300),n(p+'start','no','Start '+i,220,(i-1)*300),n(p+'coil','coil','KM'+i,460,(i-1)*300),n(p+'n','neutral','N'+i,700,(i-1)*300));edges.push(e(p+'a',p+'l','L',p+'start','3'),e(p+'b',p+'start','4',p+'coil','A1'),e(p+'c',p+'coil','A2',p+'n','N'));}
  return {version:1,name:'Industrial Plant Control · Three Stations',mode:'ladder',nodes,edges};
 }
 if(kind==='reverse')return {version:1,name:'Interlocked Reversing Control',mode:'ladder',nodes:[n('l','supply','L',0,0),n('stop','nc','Stop',0,140),n('f','no','Forward',0,280),n('fh','auxNO','KM_F',180,280),n('rb','nc','Reverse',0,420),n('ri','auxNC','KM_R',0,560),n('fc','coil','KM_F',0,700),n('r','no','Reverse',400,280),n('rh','auxNO','KM_R',580,280),n('fb','nc','Forward',400,420),n('fi','auxNC','KM_F',400,560),n('rc','coil','KM_R',400,700),n('n','neutral','N',200,880)],edges:[e('w0','l','L','stop','1'),e('w1','stop','2','f','3'),e('w2','stop','2','fh','13'),e('w3','f','4','rb','1'),e('w4','fh','14','rb','1'),e('w5','rb','2','ri','21'),e('w6','ri','22','fc','A1'),e('w7','fc','A2','n','N'),e('w8','stop','2','r','3'),e('w9','stop','2','rh','13'),e('w10','r','4','fb','1'),e('w11','rh','14','fb','1'),e('w12','fb','2','fi','21'),e('w13','fi','22','rc','A1'),e('w14','rc','A2','n','N')]};
 return {version:1,name:'Motor Start/Stop · Seal-in Logic',mode:'ladder',nodes:[n('l','supply','L',0,0),n('stop','nc','Stop',0,140),n('start','no','Start',0,280),n('hold','auxNO','KM1',200,280),n('coil','coil','KM1',440,280),n('n','neutral','N',440,440)],edges:[e('w1','l','L','stop','1'),e('w2','stop','2','start','3'),e('w3','stop','2','hold','13'),e('w4','start','4','coil','A1'),e('w5','hold','14','coil','A1'),e('w6','coil','A2','n','N')]};
};
if(typeof document!=='undefined'&&!window.__voltProPLCCanvasTools){
 window.__voltProPLCCanvasTools=true;
 const mount=()=>{
  if(!document.body)return;
  const topbar=document.querySelector('.topbar');
  if(topbar&&!document.querySelector('.vp-platform-nav')){
   const nav=document.createElement('nav');nav.className='vp-platform-nav';nav.setAttribute('aria-label','VoltPro platforms');
   nav.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:600 11px system-ui;margin:4px 10px';
   const links=[['Academy','../index.html'],['Simulator','../simulator.html'],['VoltPro PLC','./'],['VoltPro ElectCAD','../voltPro-ElectCAD/'],['VoltPro Breadboard','../breadboard.html'],['Engineering','../engineering.html'],['Workbench','../academy-workbench.html'],['AI Circuit Designer','../simulator.html#ai-designer']];
   for(const [label,href]of links){const a=document.createElement('a');a.textContent=label;a.href=href;a.style.cssText='color:#b5c7d2;text-decoration:none;padding:6px 7px;border:1px solid #365264;border-radius:6px';if(label==='VoltPro PLC')a.setAttribute('aria-current','page');nav.appendChild(a);}
   const toolbar=topbar.querySelector('.toolbar');topbar.insertBefore(nav,toolbar||null);
  }
  const button=document.createElement('button');button.type='button';button.textContent='Clear Canvas';button.setAttribute('aria-label','Clear PLC working canvas');button.style.cssText='padding:8px 12px;border-radius:8px;border:1px solid #4a7a89;background:#102733;color:#e7f1f5;font:600 13px system-ui;cursor:pointer;white-space:nowrap';
  button.addEventListener('click',()=>{const project=xt.getState().project;if((project?.nodes?.length||project?.edges?.length)&&!window.confirm('Clear the current PLC canvas? Unsaved work will be discarded. Saved library projects will not be deleted.'))return;clearWorkingCanvas();});
  const plcToolbar=document.querySelector('.toolbar');if(plcToolbar)plcToolbar.prepend(button);else{button.style.cssText+=';position:fixed;z-index:99999;right:18px;top:14px';document.body.appendChild(button)}
  const overlay=document.createElement('div');overlay.id='vp-plc-welcome';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','vp-plc-welcome-title');overlay.style.cssText='position:fixed;inset:0;z-index:100000;background:#071019ed;display:grid;place-items:center;padding:18px';
  overlay.innerHTML='<section style="position:relative;width:min(760px,100%);max-height:90vh;overflow:auto;background:#101d29;color:#e7f1f5;border:1px solid #365264;border-radius:16px;padding:24px;box-shadow:0 24px 80px #0009"><button id="vp-plc-close" aria-label="Close welcome" style="position:absolute;right:14px;top:10px;background:transparent;border:0;color:inherit;font-size:26px;cursor:pointer">×</button><small style="color:#66dfc5;letter-spacing:.14em;font-weight:800">VOLTPro PLC</small><h1 id="vp-plc-welcome-title">Start a control project</h1><p style="color:#b5c7d2">Choose a starter, open your project library, or start with an empty canvas. Temporary work starts fresh.</p><div id="vp-plc-starters" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:20px 0"></div><div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap"><button id="vp-plc-library">Open project library</button><button id="vp-plc-blank">Start blank</button></div></section>';
  const grid=overlay.querySelector('#vp-plc-starters');
  for(const item of [{id:'motor',name:'Motor Start/Stop',desc:'Seal-in control logic'},{id:'fbd',name:'Function Block Logic',desc:'Start AND NOT Stop'},{id:'plant',name:'Industrial Plant Control',desc:'Three independent stations'},{id:'reverse',name:'Interlocked Reversing Control',desc:'Forward/reverse interlocks'}]){
   const card=document.createElement('button');card.type='button';card.style.cssText='text-align:left;display:flex;flex-direction:column;gap:7px;padding:14px;border:1px solid #31515f;border-radius:10px;background:#142631;color:inherit;cursor:pointer';card.innerHTML='<strong>'+item.name+'</strong><span style="font-size:12px;color:#afc3ce">'+item.desc+'</span>';
   card.addEventListener('click',()=>{try{window.HBPLCStudioBridge.importProject(plcStarter(item.id));overlay.remove()}catch(error){window.alert('Could not load starter: '+error.message)}});
   grid.appendChild(card);
  }
  const hide=()=>overlay.remove();
  overlay.querySelector('#vp-plc-close').addEventListener('click',hide);
  overlay.querySelector('#vp-plc-blank').addEventListener('click',()=>{clearWorkingCanvas();hide()});
  overlay.querySelector('#vp-plc-library').addEventListener('click',()=>{hide();const b=[...document.querySelectorAll('button')].find(x=>/project library/i.test(x.textContent));b?.click()});
  document.body.appendChild(overlay);
  setTimeout(clearWorkingCanvas,0);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else setTimeout(mount,0);
}
window.HBPLCStudioBridge={importProject(input){
 const project=JSON.parse(JSON.stringify(input));const errors=Ei(project);if(errors.length)throw Error(errors.join(' '));
 const previous=xt.getState().project,history=JSON.parse(localStorage.getItem('voltpro-recovery-history-v1')||'[]');if(!Array.isArray(history))throw Error('PLC recovery history could not be read. Save or export the current drawing first.');
 localStorage.setItem('voltpro-recovery-history-v1',JSON.stringify([{id:crypto.randomUUID(),kind:'plc',name:previous.name,created:new Date().toISOString(),data:previous},...history].slice(0,30)));
 xt.getState().setProject(project);return {name:project.name,devices:project.nodes.length,wires:project.edges.length};
}};
