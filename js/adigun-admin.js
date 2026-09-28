document.addEventListener("DOMContentLoaded",()=>{
  const $=s=>document.querySelector(s);
  const accessStatus=$("#accessStatus"),identityEmail=$("#identityEmail"),heroAuth=$("#heroAuth"),heroIdentity=$("#heroIdentity");
  const systemState=$("#systemState"),identityState=$("#identityState"),identityDetail=$("#identityDetail");
  const messages=$("#adminMessages"),input=$("#adminInput"),send=$("#adminSend"),fileInput=$("#adminAttachmentInput"),attach=$("#adminAttach"),chips=$("#adminAttachmentChips");
  const inspectOutput=$("#inspectOutput"),inspectState=$("#inspectState");
  const terminalState=$("#terminalState"),terminalMeta=$("#terminalMeta"),terminalHost=$("#adigunTerminal"),terminalCommand=$("#terminalCommand"),terminalRun=$("#terminalRun"),terminalClear=$("#terminalClear");
  async function runSandboxCommand(command){
    const q=String(command||"").trim();
    if(!q)return;
    terminalRun.disabled=true;
    terminalState.textContent="● EXECUTING";
    terminalMeta.textContent="Sending the command to ADIGUN Control. Recon commands are read-only and fixed to the authorized site; sandbox commands remain allow-listed.";
    terminalHost.textContent+="\n\n$ "+q+"\n";
    try{
      const r=await fetch("/api/admin/sandbox",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({command:q})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.ok)throw new Error(d.error||"Sandbox execution failed");
      const stdout=String(d.result?.stdout||"");
      const stderr=String(d.result?.stderr||"");
      terminalHost.textContent+=stdout+(stderr?"\n[stderr]\n"+stderr:"");
      terminalHost.textContent+="\n[exit "+String(d.result?.exitCode??"—")+"]\n";
      terminalHost.scrollTop=terminalHost.scrollHeight;
      const helpView=formatHelp(d.result);\n      commandOutput.textContent=helpView||JSON.stringify(d,null,2);
      terminalState.textContent="● COMPLETE";
      terminalMeta.textContent="Live Linux execution completed. Evidence ID: "+String(d.evidence?.evidenceId||"—");
    }catch(e){
      terminalHost.textContent+="\nERROR: "+String(e.message||e)+"\n";
      terminalState.textContent="● ERROR";
      terminalMeta.textContent=String(e.message||e);
    }finally{terminalRun.disabled=false;terminalCommand.focus()}
  }
  terminalRun?.addEventListener("click",()=>runSandboxCommand(terminalCommand.value));

  function formatHelp(data){
    if(!data||data.type!=="help") return null;
    const lines=["ADIGUN CONTROL TERMINAL","══════════════════════════════════════════════════════════════",""];
    if(data.error){lines.push("HELP ERROR","  "+String(data.error),"","Try: help | help all | help <category> | help <command>");return lines.join("\n");}
    if(data.commandRegistry){
      lines.push("COMMAND REGISTRY","│");
      const tree=data.commandRegistry;
      const order=["system","reconnaissance","web","osint","network","security","github","cloudflare","utilities"];
      order.forEach((key,idx)=>{const items=Array.isArray(tree[key])?tree[key]:[];lines.push((idx===order.length-1?"└── ":"├── ")+key);items.forEach((name,j)=>lines.push((j===items.length-1?"    └── ":"    ├── ")+name));});
      lines.push("","RECONNAISSANCE CATALOG","  "+String(data.count||0)+" generated reconnaissance commands","  Variants: "+String(Array.isArray(data.variants)?data.variants.length:0)+" per base command","","USAGE");
      (data.usage||[]).forEach(x=>lines.push("  "+x));
      lines.push("","Type help <category> or help <command> for details.");
      return lines.join("\n");
    }
    if(data.command){
      lines.push(String(data.categoryLabel||data.category||"COMMAND").toUpperCase(),"","  "+String(data.command));
      if(data.baseCommand)lines.push("  base: "+String(data.baseCommand));
      lines.push("  "+String(data.description||"No description available."),"");
      if(data.aliases?.length){lines.push("ALIASES");data.aliases.forEach(x=>lines.push("  "+x));lines.push("");}
      if(data.target)lines.push("TARGET","  "+data.target);
      if(data.readOnly!==undefined)lines.push("  read-only: "+(data.readOnly?"yes":"no"));
      lines.push("","USAGE");(data.usage||[]).forEach(x=>lines.push("  "+x));return lines.join("\n");
    }
    if(data.category==="sandbox"){lines.push("ISOLATED LINUX","");(data.commands||[]).forEach(x=>lines.push("  "+x.command+"  "+x.description));lines.push("","Use help <command> for a specific command.");return lines.join("\n");}
    if(data.categories){lines.push("CATEGORY: "+String(data.category||"overview").toUpperCase());Object.entries(data.categories).forEach(([k,c])=>{lines.push("",String(c.label||k).toUpperCase()+" ("+String(c.count||0)+")");(c.commands||[]).forEach(x=>lines.push("  "+x.command+"  "+x.description));});return lines.join("\n");}
    return JSON.stringify(data,null,2);
  }

  async function loadReconCommandCatalog(){
    const list=document.querySelector("#terminalCommands");if(!list)return;
    try{
      const r=await fetch("/api/admin/commands",{credentials:"same-origin",cache:"no-store"}),d=await r.json().catch(()=>({}));
      if(!r.ok||!Array.isArray(d.commands))return;
      const commands=["help","commands","help all","help linux","recon","full-recon",...(Array.isArray(d.sandbox)?d.sandbox:[]),...d.commands];
      list.innerHTML="";const seen=new Set();
      for(const command of commands){if(seen.has(command))continue;seen.add(command);const option=document.createElement("option");option.value=command;list.appendChild(option);}
      terminalMeta.textContent=String(d.count||d.commands.length)+" reconnaissance command names loaded. Type help for the command registry.";
    }catch{}
  }
  loadReconCommandCatalog();
  terminalCommand?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runSandboxCommand(terminalCommand.value)}});
  terminalClear?.addEventListener("click",()=>{terminalHost.textContent="ADIGUN EXECUTION NODE\nstatus: waiting\nruntime: isolated Cloudflare Sandbox\nnetwork: deny-by-default\nauthentication: local operator mode\n";commandOutput.textContent="No execution evidence yet.";terminalState.textContent="READY";terminalMeta.textContent="Recon commands are read-only and target-locked. Sandbox commands are allow-listed. Every execution returns an evidence ID.";});

  const history=[]; let files=[];
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
      accessStatus.textContent="● AUTHENTICATED";accessStatus.className="ok";identityEmail.textContent=d.identity?.email||"verified";systemState.textContent="ONLINE";identityState.textContent="AUTHORIZED";identityDetail.textContent=d.identity?.email||"Local operator";heroAuth.textContent="LOCAL OPERATOR";heroIdentity.textContent=d.identity?.email||"ADIGUN Control operator";send.disabled=false;
    }catch{systemState.textContent="UNAVAILABLE";identityState.textContent="UNKNOWN";send.disabled=true}
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