/* ADIGUN terminal controller v3 — single authoritative terminal dispatcher. */
document.addEventListener("DOMContentLoaded",()=>{
  const input=document.querySelector("#terminalCommand"),host=document.querySelector("#adigunTerminal"),run=document.querySelector("#terminalRun"),meta=document.querySelector("#terminalMeta"),state=document.querySelector("#terminalState"),clear=document.querySelector("#terminalClear");
  if(!input||!host)return;

  const session=(()=>{try{return localStorage.getItem("hb-admin-session")||crypto.randomUUID()}catch{return String(Date.now())}})();
  try{localStorage.setItem("hb-admin-session",session)}catch{}

  const aliases={
    "site health":"site-health","site status":"site-health","site summary":"site-summary",
    "site assets":"site-assets","site links":"site-links","site headers":"http-headers",
    dns:"dns-a","dns-lookup":"dns-a","security":"security-headers",
    tls:"security-hsts",csp:"security-csp",hsts:"security-hsts",
    referrer:"security-referrer",permissions:"security-permissions",
    "content-type":"security-content-type",frame:"security-frame",
    "cross-origin":"security-cross-origin",cf:"edge","edge-status":"edge",
    github:"github-repo",gh:"github-repo","deploy-status":"github-runs",
    "repository-status":"github-repo","repo-status":"github-repo"
  };

  const localCommands=new Set(["help","commands","list","man","which","status","version","config","history","clear","selftest","health","reload",
    "mean","median","mode","range","sum","min","max","percent","calculate","ohm","power","energy","resistor","voltage","current","frequency","wavelength","convert",
    "encode","decode","base64","hash","uuid","timestamp","regex","text","format","json","cidr","ip","url","urlinfo"]);

  let serverCommands=new Set();
  const line=(text,kind="output")=>{const e=document.createElement("div");e.className="admin-terminal-line "+kind;e.textContent=String(text??"");host.appendChild(e);host.scrollTop=host.scrollHeight;return e};
  const remember=q=>{try{const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");h.push(q);localStorage.setItem("adigun-command-history",JSON.stringify(h.slice(-200)))}catch{}};
  const parse=q=>{const m=String(q||"").trim().match(/(?:[^\s"]+|"[^"]*")+/g)||[];const command=(m.shift()||"").toLowerCase();return {command,args:m.map(x=>x.replace(/^"|"$/g,"").replace(/^<(.+)>$/,"$1"))}};
  const local=()=>window.AdigunCommandEngine?.local;

  function renderServer(d){
    if(!d)return "";
    if(d.type==="help"){
      const lines=["ADIGUN CONTROL TERMINAL","══════════════════════════════════════════════════════════════",""];
      if(d.error)return lines.concat(["HELP ERROR","  "+d.error,"","Try: HELP | HELP ALL | HELP <CATEGORY> | HELP <COMMAND>"]).join("\n");
      if(d.commandRegistry){
        lines.push("TARGET: "+String(d.target||"authorized site"),"RECONNAISSANCE COMMANDS: "+String(d.count||0),"VARIANTS PER BASE: "+String(d.variants?.length||0),"");
        for(const [family,items] of Object.entries(d.commandRegistry)){lines.push("["+family.toUpperCase()+"]");for(const x of (Array.isArray(items)?items:[]))lines.push("  "+x);lines.push("")}
        lines.push("HELP <category> for the full category. HELP <command> for command details. HELP ALL for the complete catalog.");
        return lines.join("\n");
      }
      if(d.category==="sandbox"){lines.push("ISOLATED LINUX");(d.commands||[]).forEach(x=>lines.push("  "+x.command+"  "+x.description));return lines.join("\n")}
      if(d.command){lines.push((d.categoryLabel||d.category||"COMMAND").toUpperCase(),"","  "+d.command);if(d.baseCommand)lines.push("  base: "+d.baseCommand);lines.push("  "+(d.description||"No description available."));if(d.aliases?.length){lines.push("","ALIASES",...d.aliases.map(x=>"  "+x))}if(d.target)lines.push("","TARGET","  "+d.target);lines.push("","READ-ONLY: "+(d.readOnly===false?"NO":"YES"),"","USAGE",...(d.usage||[]).map(x=>"  "+x));return lines.join("\n")}
    }
    if(d.ok&&d.result!==undefined){
      const p=[];if(d.command)p.push("COMMAND: "+d.command);if(d.baseCommand)p.push("BASE: "+d.baseCommand);if(d.label)p.push("DESCRIPTION: "+d.label);if(d.target)p.push("TARGET: "+d.target);if(d.evidence?.evidenceId)p.push("EVIDENCE: "+d.evidence.evidenceId);p.push("",typeof d.result==="string"?d.result:JSON.stringify(d.result,null,2));return p.join("\n");
    }
    if(d.result?.stdout||d.result?.stderr){return String(d.result.stdout||"")+(d.result.stderr?"\n[stderr]\n"+d.result.stderr:"")}
    return JSON.stringify(d,null,2);
  }

  async function loadCatalog(){
    try{
      const r=await fetch("/api/admin/commands",{credentials:"same-origin",cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(r.ok&&Array.isArray(d.commands)){
        serverCommands=new Set(d.commands.map(String));
        const list=document.querySelector("#terminalCommands");
        if(list){
          const all=[...new Set(["help","help all","help linux","commands","recon","full-recon",...(d.sandbox||[]),...d.commands])];
          list.innerHTML=all.map(c=>"<option value=\""+String(c).replace(/"/g,"&quot;")+"\"></option>").join("");
        }
        if(meta)meta.textContent=String(d.count||d.commands.length)+" reconnaissance command names loaded. Type HELP to begin.";
      }
    }catch{if(meta)meta.textContent="Browser command engine ready. Server catalog unavailable until authenticated."}
  }

  async function execute(raw){
    const q=String(raw||"").trim();if(!q)return;
    const {command,args}=parse(q);
    line("adigun@control:~$ "+q,"prompt");
    state&&(state.textContent="● EXECUTING");run&&(run.disabled=true);input.disabled=true;
    try{
      if(command==="clear"){host.innerHTML="";state&&(state.textContent="READY");meta&&(meta.textContent="Terminal cleared.");return}
      if(command==="history"){let h=[];try{h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]")}catch{};line(h.length?h.map((x,i)=>String(i+1).padStart(3," ")+"  "+x).join("\n"):"No command history.");return}
      if(command==="exit"){line("ADIGUN Control remains open. Use browser navigation to leave the control center.","system");return}

      const isHelp=command==="help"||command==="commands"||command==="list";
      const wantsAgent=["investigate","diagnose","agent","ask"].includes(command);

      if(isHelp){
        try{
          const requestedTopic=args.join(" ").trim().toLowerCase();
          const r=await fetch("/api/admin/commands",{credentials:"same-origin",cache:"no-store"});
          const d=await r.json().catch(()=>({}));
          if(r.ok&&d.ok){
            const commands=Array.isArray(d.commands)?d.commands:[];
            if(!requestedTopic||requestedTopic==="all"||command==="list"||requestedTopic==="commands"){
              const shown=[...new Set(commands)].slice(0,1200);
              line("ADIGUN CONTROL COMMAND CATALOG\n"+"═".repeat(62)+"\n"+
                "TARGET: "+String(d.target||"authorized site")+"\n"+
                "COMMANDS: "+String(d.count||commands.length)+"\n\n"+
                shown.map((x,i)=>String(i+1).padStart(4," ")+". "+x).join("\n")+
                "\n\nUse HELP <command> for details.\nUse HELP LINUX for isolated diagnostics.","output");
              meta&&(meta.textContent=String(d.count||commands.length)+" command names loaded.");
              return;
            }
            const category=(d.categories&&d.categories[requestedTopic])||null;
            if(Array.isArray(category)){
              line("HELP / "+requestedTopic.toUpperCase()+"\\n\\n"+category.map(x=>"  "+x).join("\\n"),"output");
              return;
            }
            if(commands.includes(requestedTopic)){
              line("HELP / "+requestedTopic+"\\n\\nServer reconnaissance command.\\nTarget: "+String(d.target||"authorized site")+"\\nRead-only: YES","output");
              return;
            }
          }
        }catch{}
        line("HELP\\n\\nType HELP ALL, HELP <CATEGORY>, HELP <COMMAND>, or LIST.","output");
        return;
      }
      if(wantsAgent){
        const task=command==="ask"||command==="agent"?args.join(" "):q.replace(/^\w+\s*/,"");
        if(!task)throw Error("Usage: investigate <problem>");
        const r=await fetch("/api/admin/agent",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({task})});
        const d=await r.json().catch(()=>({}));if(!r.ok||!d.answer)throw Error(d.error||"Private agent unavailable");
        line(d.answer,"output");
        if(d.plan)line("AGENT PLAN // "+String(d.plan.mode||"unknown").toUpperCase()+"\napproval: "+(d.plan.approvalRequired?"REQUIRED":"not required")+"\n"+(d.plan.actions||[]).map(a=>"- "+(a.title||a.id)+": "+(a.status||"unknown")+" — "+(a.description||"")).join("\n"),"system");
        return;
      }

      const localFn=local();
      const shouldLocal=localFn && localCommands.has(command) && !isHelp;
      if(shouldLocal){
        meta&&(meta.textContent="Browser command engine");
        line(await Promise.resolve(localFn(command,args)),"output");
        return;
      }

      const serverCommand=aliases[q]||aliases[command]||q;
      const r=await fetch("/api/admin/command",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({command:serverCommand})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.ok)throw Error(d.error||"Command failed");
      meta&&(meta.textContent=d.evidence?.evidenceId?"Evidence ID: "+d.evidence.evidenceId:"Command completed.");
      line(renderServer(d),"output");
    }catch(e){line("ERROR: "+String(e.message||e),"error");meta&&(meta.textContent=String(e.message||e))}
    finally{remember(q);run&&(run.disabled=false);input.disabled=false;state&&(state.textContent="● COMPLETE");input.value="";input.focus()}
  }

  document.addEventListener("keydown",e=>{if(document.activeElement===input&&e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();execute(input.value)}},true);
  document.addEventListener("click",e=>{const b=e.target.closest?.("[data-terminal-command]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();input.value=b.dataset.terminalCommand||"";execute(input.value)},true);
  run?.addEventListener("click",e=>{e.preventDefault();execute(input.value)},true);
  clear?.addEventListener("click",e=>{e.preventDefault();host.innerHTML='<div class="admin-terminal-line system">ADIGUN CONTROL ENGINE\nstatus: ready\nruntime: browser command engine + authorised server tools\nproduction mutations: approval-gated\nsecret access: disabled\n\nType HELP to begin.</div>';state&&(state.textContent="READY");meta&&(meta.textContent="Terminal cleared.");input.focus()},true);
  loadCatalog();
});
