document.addEventListener("DOMContentLoaded",()=>{
const $=s=>document.querySelector(s);
const accessStatus=$("#accessStatus"), identityEmail=$("#identityEmail"), heroAuth=$("#heroAuth"), heroIdentity=$("#heroIdentity");
const systemState=$("#systemState"), identityState=$("#identityState"), identityDetail=$("#identityDetail"), run=$("#runAutomation"), stream=$("#eventStream"), badge=$("#automationBadge");

function setDenied(message){
  accessStatus.textContent="● DENIED"; accessStatus.className="denied";
  systemState.textContent="BLOCKED"; identityState.textContent="NOT AUTHENTICATED";
  identityDetail.textContent=message||"Cloudflare Access authentication is required.";
  heroAuth.textContent="ACCESS DENIED"; heroIdentity.textContent=message||"Sign in through Cloudflare Access.";
  run.disabled=true; badge.textContent="ACCESS REQUIRED";
}
async function status(){
  try{
    const r=await fetch("/api/admin/status",{credentials:"same-origin",cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.authenticated){setDenied(d.error||"This private control panel requires an authorized identity.");return;}
    accessStatus.textContent="● AUTHENTICATED"; accessStatus.className="ok";
    identityEmail.textContent=d.identity?.email||"verified";
    systemState.textContent="ONLINE"; identityState.textContent="AUTHORIZED";
    identityDetail.textContent=d.identity?.email||"Authenticated administrator";
    heroAuth.textContent="AUTHENTICATED"; heroIdentity.textContent=d.identity?.email||"Verified administrator";
    badge.textContent="AUTHENTICATED";
    run.disabled=false;
  }catch{setDenied("Authentication service unavailable.");}
}
run?.addEventListener("click",async()=>{
  run.disabled=true; stream.innerHTML='<div class="event-line pending"><b>00</b> REQUEST / validating administrator…</div>';
  try{
    const r=await fetch("/api/automation/demo",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({workflow:"adigun-controlled-demo"})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!Array.isArray(d.events)){setDenied(d.error||"The privileged workflow was rejected.");stream.innerHTML='<div class="event-line error"><b>ERR</b> '+escapeHtml(d.error||"Access denied.")+"</div>";return;}
    stream.innerHTML="";
    d.events.forEach((e,i)=>{const el=document.createElement("div");el.className="event-line";el.innerHTML="<b>"+String(i+1).padStart(2,"0")+"</b> "+escapeHtml(e);stream.appendChild(el)});
    badge.textContent="WORKFLOW COMPLETE";
  }catch{stream.innerHTML='<div class="event-line error"><b>ERR</b> Workflow service unavailable.</div>'}
  finally{run.disabled=false}
});
$("#refreshStatus")?.addEventListener("click",status);
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
status();
});