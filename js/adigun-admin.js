document.addEventListener("DOMContentLoaded",()=>{
  const $=s=>document.querySelector(s);
  const accessStatus=$("#accessStatus"),identityEmail=$("#identityEmail"),heroAuth=$("#heroAuth"),heroIdentity=$("#heroIdentity");
  const systemState=$("#systemState"),identityState=$("#identityState"),identityDetail=$("#identityDetail");
  const inspectOutput=$("#inspectOutput"),inspectState=$("#inspectState");

  async function status(){
    const send=$("#adminSend");
    if(send)send.disabled=false;
    try{
      const r=await fetch("/api/admin/status",{credentials:"same-origin",cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.authenticated){
        accessStatus.textContent="● DENIED";accessStatus.className="denied";
        systemState.textContent="BLOCKED";identityState.textContent="NOT AUTHENTICATED";
        identityDetail.textContent=d.error||"Cloudflare Access authentication is required.";
        heroAuth.textContent="ACCESS DENIED";heroIdentity.textContent=d.error||"Sign in through Cloudflare Access.";
        return;
      }
      accessStatus.textContent="● AUTHENTICATED";accessStatus.className="ok";
      identityEmail.textContent=d.identity?.email||"verified";
      systemState.textContent="ONLINE";identityState.textContent="AUTHORIZED";
      identityDetail.textContent=d.identity?.email||"Cloudflare Access user";
      heroAuth.textContent="CLOUDFLARE ACCESS";
      heroIdentity.textContent=d.identity?.email||"ADIGUN Control administrator";
    }catch{
      systemState.textContent="UNAVAILABLE";identityState.textContent="UNKNOWN";
      identityDetail.textContent="Authentication status could not be refreshed. The Private Operator remains available and will report request errors.";
    }
  }

  async function inspect(target){
    inspectState.textContent="● SCANNING";
    inspectOutput.textContent="Running "+target+" inspection…";
    document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=true);
    try{
      const r=await fetch("/api/admin/inspect?target="+encodeURIComponent(target),{credentials:"same-origin",cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"Inspection failed");
      inspectOutput.textContent=JSON.stringify(d,null,2);
      inspectState.textContent="● COMPLETE";
    }catch(e){
      inspectOutput.textContent="Inspection error: "+String(e.message||e);
      inspectState.textContent="● ERROR";
    }finally{
      document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=false);
    }
  }

  document.querySelectorAll("[data-inspect]").forEach(b=>b.addEventListener("click",()=>inspect(b.dataset.inspect)));
  $("#refreshStatus")?.addEventListener("click",status);
  status();
});
