document.addEventListener("DOMContentLoaded",()=>{
  const $=s=>document.querySelector(s);
  const accessStatus=$("#accessStatus"),identityEmail=$("#identityEmail"),heroAuth=$("#heroAuth"),heroIdentity=$("#heroIdentity");
  const systemState=$("#systemState"),identityState=$("#identityState"),identityDetail=$("#identityDetail");
  const messages=$("#adminMessages"),input=$("#adminInput"),send=$("#adminSend"),fileInput=$("#adminAttachmentInput"),attach=$("#adminAttach"),chips=$("#adminAttachmentChips");
  const inspectOutput=$("#inspectOutput"),inspectState=$("#inspectState");
  const terminalState=$("#terminalState"),terminalMeta=$("#terminalMeta"),terminalHost=$("#adigunTerminal"),terminalCommand=$("#terminalCommand"),terminalRun=$("#terminalRun"),terminalClear=$("#terminalClear");
  // Terminal execution is owned by js/adigun-terminal-controller-v2.js.\n  const history=[]; let files=[];
  const session=(()=>{let v=localStorage.getItem("hb-admin-session");if(!v){v=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36);localStorage.setItem("hb-admin-session",v)}return v})();

  function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
  function add(text,kind){
    const e=document.createElement("div");e.className="admin-chat-message "+kind;
    if(kind==="assistant"&&window.AdigunRenderer)window.AdigunRenderer.mount(e,text);else e.textContent=text;
    messages.appendChild(e);messages.scrollTop=messages.scrollHeight;
  }
  function showThinking(){
    const e=document.createElement("div");
    e.className="admin-chat-message assistant admin-thinking";
    e.setAttribute("role","status");
    e.setAttribute("aria-live","polite");
    e.innerHTML='<span>ADIGUN CONTROL IS GENERATING</span><i></i><i></i><i></i>';
    messages.appendChild(e);
    messages.scrollTop=messages.scrollHeight;
    return e;
  }
  function dataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error||new Error("read failed"));r.readAsDataURL(file)})}
  async function prepare(file){
    if(file.size>8*1024*1024)throw new Error(file.name+" is larger than 8 MB.");
    const data=await dataUrl(file);
    if(/^image\/(png|jpeg|webp|gif)$/i.test(file.type))return {name:file.name,size:file.size,part:{type:"input_image",image_url:data,detail:"auto"}};
    return {name:file.name,size:file.size,part:{type:"input_file",filename:file.name,file_data:data}};
  }
  function renderFiles(){chips.innerHTML=files.map((f,i)=>'<span class="admin-chip">📎 '+esc(f.name)+' <button data-i="'+i+'" type="button">×</button></span>').join("");chips.querySelectorAll("button").forEach(b=>b.onclick=()=>{files.splice(Number(b.dataset.i),1);renderFiles()})}
  fileInput?.addEventListener("change",async e=>{for(const f of [...e.target.files]){try{if(!files.some(x=>x.name===f.name&&x.size===f.size))files.push(await prepare(f))}catch(err){add("Attachment error: "+String(err.message||err),"assistant")}}e.target.value="";renderFiles()});
  attach?.addEventListener("click",()=>fileInput?.click());

  async function status(){
    try{
      const r=await fetch("/api/admin/status",{credentials:"same-origin",cache:"no-store"}),d=await r.json().catch(()=>({}));
      if(!r.ok||!d.authenticated){accessStatus.textContent="● DENIED";accessStatus.className="denied";systemState.textContent="BLOCKED";identityState.textContent="NOT AUTHENTICATED";identityDetail.textContent=d.error||"Cloudflare Access authentication is required.";heroAuth.textContent="ACCESS DENIED";heroIdentity.textContent=d.error||"Sign in through Cloudflare Access.";send.disabled=true;return}
      accessStatus.textContent="● AUTHENTICATED";accessStatus.className="ok";identityEmail.textContent=d.identity?.email||"verified";systemState.textContent="ONLINE";identityState.textContent="AUTHORIZED";identityDetail.textContent=d.identity?.email||"Cloudflare Access user";heroAuth.textContent="CLOUDFLARE ACCESS";heroIdentity.textContent=d.identity?.email||"ADIGUN Control administrator";send.disabled=false;
    }catch{systemState.textContent="UNAVAILABLE";identityState.textContent="UNKNOWN";send.disabled=false}
  }

  function showAgentPlan(plan){
    if(!plan)return;
    const lines=[
      "AGENT PLAN // "+String(plan.mode||"unknown").toUpperCase(),
      "approval: "+(plan.approvalRequired?"REQUIRED":"not required"),
      ...(plan.actions||[]).map(a=>"- "+String(a.title||a.id)+": "+String(a.status||"unknown")+" — "+String(a.description||""))
    ];
    add(lines.join("\n"),"system");
  }

  async function ask(){
    const q=input.value.trim();if(!q&&!files.length)return;
    const content=[];if(q)content.push({type:"input_text",text:q});content.push(...files.map(f=>f.part));
    add(q||("Attached "+files.length+" file"+(files.length===1?"":"s")),"user");
    history.push({role:"user",content});input.value="";send.disabled=true;
    const thinking=showThinking();
    const old=files;files=[];renderFiles();
    try{
      const r=await fetch("/api/admin/agent",{
        method:"POST",
        headers:{"content-type":"application/json","x-hb-session":session},
        credentials:"same-origin",
        body:JSON.stringify({
          task:q||"Analyze the attached material and investigate anything relevant to the request.",
          messages:history.slice(-8),
          siteContext:"PRIVATE ADMINISTRATOR CONTEXT: authenticated administrator is asking from ADIGUN Control."
        })
      });
      const d=await r.json().catch(()=>({}));
      thinking.remove();
      if(!r.ok||!d.answer)throw new Error(d.error||"Private agent unavailable");
      add(d.answer,"assistant");
      showAgentPlan(d.plan);
      history.push({role:"assistant",content:d.answer});
    }catch(e){thinking.remove();add("ADIGUN private agent error: "+String(e.message||e),"assistant")}
    finally{old.length=0;send.disabled=false}
  }
  send?.addEventListener("click",ask);input?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();ask()}});

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
    }catch(e){inspectOutput.textContent="Inspection error: "+String(e.message||e);inspectState.textContent="● ERROR"}
    finally{document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=false)}
  }
  document.querySelectorAll("[data-inspect]").forEach(b=>b.addEventListener("click",()=>inspect(b.dataset.inspect)));

  const commandOutput=$("#commandOutput");
  async function runCommand(command){
    commandOutput.textContent="Executing "+command+"…";
    document.querySelectorAll("[data-command]").forEach(b=>b.disabled=true);
    try{
      const r=await fetch("/api/admin/command",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({command})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.ok)throw new Error(d.error||"Command failed");
      commandOutput.textContent=JSON.stringify(d,null,2);
    }catch(e){commandOutput.textContent="Execution error: "+String(e.message||e)}
    finally{document.querySelectorAll("[data-command]").forEach(b=>b.disabled=false)}
  }
  document.querySelectorAll("[data-command]").forEach(b=>b.addEventListener("click",()=>runCommand(b.dataset.command)));
  $("#refreshStatus")?.addEventListener("click",status);
  status();
});