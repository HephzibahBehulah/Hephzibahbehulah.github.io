(()=>{"use strict";
if(typeof window==="undefined"||!window.document||window.VoltProCircuitDesigner)return;
const boot=()=>{
 if(document.getElementById("vpCircuitDesigner"))return;
 const root=document.createElement("div");
 root.id="vpCircuitDesigner";
 root.innerHTML='<button type="button" class="vp-cd-launch" id="vpCdLaunch" aria-expanded="false" aria-controls="vpCdPanel">AI Circuit Designer</button><section class="vp-cd-panel" id="vpCdPanel" aria-label="AI Circuit Designer" aria-hidden="true"><header class="vp-cd-head"><div><strong>AI CIRCUIT DESIGNER</strong><small>Prompt → editable schematic → validation</small></div><button type="button" id="vpCdClose" aria-label="Close designer">×</button></header><label class="vp-cd-label" for="vpCdPrompt">Describe the circuit</label><textarea id="vpCdPrompt" rows="3" maxlength="1200" placeholder="Example: build a 24 V control circuit and three-phase motor starter with a three-pole breaker and start pushbutton"></textarea><div class="vp-cd-actions"><button type="button" id="vpCdGenerate" class="vp-cd-primary">Generate preview</button><button type="button" id="vpCdClear">Clear</button></div><div id="vpCdStatus" class="vp-cd-status" role="status" aria-live="polite">Templates are generated locally. Nothing is added to your canvas until you review and confirm.</div><div id="vpCdPreview" class="vp-cd-preview" hidden></div><div id="vpCdWarnings" class="vp-cd-warnings"></div><button type="button" id="vpCdInsert" class="vp-cd-insert" disabled>Insert editable design</button><footer>Educational topology only. Verify component data, protection, wiring and applicable standards before real-world use.</footer></section>';
 document.body.appendChild(root);
 const panel=root.querySelector("#vpCdPanel"),launch=root.querySelector("#vpCdLaunch"),prompt=root.querySelector("#vpCdPrompt"),generate=root.querySelector("#vpCdGenerate"),insert=root.querySelector("#vpCdInsert"),status=root.querySelector("#vpCdStatus"),preview=root.querySelector("#vpCdPreview"),warnings=root.querySelector("#vpCdWarnings");
 let draft=null,lastValidation=null;
 const open=()=>{panel.classList.add("open");panel.setAttribute("aria-hidden","false");launch.setAttribute("aria-expanded","true");prompt.focus()};
 const close=()=>{panel.classList.remove("open");panel.setAttribute("aria-hidden","true");launch.setAttribute("aria-expanded","false")};
 launch.addEventListener("click",()=>panel.classList.contains("open")?close():open());
 root.querySelector("#vpCdClose").addEventListener("click",close);
 root.querySelector("#vpCdClear").addEventListener("click",()=>{prompt.value="";draft=null;lastValidation=null;preview.hidden=true;preview.replaceChildren();warnings.replaceChildren();insert.disabled=true;status.textContent="Describe a circuit to generate a fresh preview."});
 const addText=(parent,tag,text,className)=>{const el=document.createElement(tag);el.textContent=String(text);if(className)el.className=className;parent.appendChild(el);return el};
 function renderPreview(){
  preview.replaceChildren();warnings.replaceChildren();
  if(!draft||!draft.recognized){preview.hidden=true;insert.disabled=true;return}
  preview.hidden=false;
  addText(preview,"h3",draft.title);
  addText(preview,"p",draft.description);
  addText(preview,"h4","Components ("+draft.components.length+")");
  const list=document.createElement("ul");
  draft.components.forEach(c=>{
   const item=document.createElement("li");item.className="vp-cd-component";
   const name=window.defs?.[c.type]?.name||c.type;addText(item,"span",c.id+" — "+name,"vp-cd-component-name");
   if(window.VoltProDeviceFace?.face){
    const terminals=window.VoltProTerminalGraph?.definitionFor?.(c.type)?.terminals||[];
    const face=document.createElement("div");face.className="vp-cd-device-face";
    face.innerHTML=window.VoltProDeviceFace.face({id:c.id,type:c.type,terminals,dimensions:c.dimensions||null});
    item.appendChild(face);
   }
   list.appendChild(item);
  });
  preview.appendChild(list);
  addText(preview,"h4","Terminal-to-terminal wires ("+draft.wires.length+")");
  const wires=document.createElement("ul");
  draft.wires.forEach(w=>addText(wires,"li",w.a+" → "+w.b));
  preview.appendChild(wires);
  const errors=lastValidation?.errors||[];
  if(lastValidation?.valid){status.textContent="Topology validation passed. Review the warnings, then confirm insertion.";status.dataset.state="valid"}
  else{status.textContent="Topology validation failed. This draft cannot be inserted until the connection errors are resolved.";status.dataset.state="invalid";const list=document.createElement("ul");errors.forEach(e=>addText(list,"li",(e.code||"ERROR")+": "+(e.message||e.terminalId||e.wireId||"Invalid topology")));warnings.appendChild(list)}
  (draft.warnings||[]).forEach(w=>addText(warnings,"p",w,"vp-cd-warning"));
  insert.disabled=!lastValidation?.valid;
 }
 generate.addEventListener("click",()=>{
  const planner=window.VoltProCircuitPlanner;
  if(!planner){status.textContent="Circuit planner module is unavailable. Reload the simulator and try again.";insert.disabled=true;return}
  draft=planner.plan(prompt.value,draft);
  if(!draft.recognized){status.textContent=draft.error||"This circuit request is not supported by the current planner.";status.dataset.state="invalid";preview.hidden=true;warnings.replaceChildren();insert.disabled=true;return}
  try{
   const runtime=window.VoltProV5Runtime,graph=window.VoltProTerminalGraph;
   if(!runtime||!graph)throw new Error("Topology validation modules are unavailable.");
   const adapted=runtime.adapt({components:draft.components,wires:draft.wires});
   lastValidation=graph.build(adapted).validateTopology();
  }catch(error){lastValidation={valid:false,errors:[{code:"VALIDATION_EXCEPTION",message:error.message}]}}
  renderPreview();
 });
 insert.addEventListener("click",()=>{
  const app=window.VoltProUI,state=window.S;
  if(!draft||!lastValidation?.valid||!app||!state){status.textContent="Cannot insert: simulator project API is unavailable or topology is invalid.";return}
  app.saveHistory();
  const existing=new Set(state.components.map(c=>c.id));
  const idMap=new Map();
  const unique=(base,set)=>{let id=base;while(set.has(id))id=base+"_"+Math.random().toString(36).slice(2,6);set.add(id);return id};
  draft.components.forEach(c=>idMap.set(c.id,unique("AI_"+c.id,existing)));
  const minX=Math.min(...draft.components.map(c=>c.x));
  const maxExisting=state.components.length?Math.max(...state.components.map(c=>c.x)):minX;
  const offset=state.components.length?Math.max(0,maxExisting-minX+180):0;
  draft.components.forEach(c=>state.components.push({...JSON.parse(JSON.stringify(c)),id:idMap.get(c.id),x:c.x+offset,pins:[]}));
  const wireIds=new Set(state.wires.map(w=>w.id).filter(Boolean));
  draft.wires.forEach((w,i)=>{
   const id=unique("AI_W"+(i+1),wireIds);
   const mapEnd=end=>{const parts=String(end).split(":");const old=parts.shift();return [idMap.get(old)||old,...parts].join(":")};
   state.wires.push({...JSON.parse(JSON.stringify(w)),id,a:mapEnd(w.a),b:mapEnd(w.b)});
  });
  state.selected=null;state.selectedWireId=null;app.render();
  status.textContent="Inserted "+draft.components.length+" components and "+draft.wires.length+" wires into the editable canvas. Save or export the project to keep the design.";
  status.dataset.state="valid";
 });
 launch.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
 window.VoltProCircuitDesigner={open,close,generate:()=>generate.click(),getDraft:()=>draft,getValidation:()=>lastValidation};
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();