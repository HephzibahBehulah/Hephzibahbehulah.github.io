/* ADIGUN terminal controller. One authoritative input path. UI is intentionally untouched. */
document.addEventListener("DOMContentLoaded",()=>{
  const input=document.querySelector("#terminalCommand"),host=document.querySelector("#adigunTerminal"),run=document.querySelector("#terminalRun"),meta=document.querySelector("#terminalMeta"),state=document.querySelector("#terminalState");
  if(!input||!host)return;
  const session=(()=>{try{return localStorage.getItem("hb-admin-session")||(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2))}catch{return String(Date.now())}})();
  try{localStorage.setItem("hb-admin-session",session)}catch{}

  const aliases={
    domain:"site-summary","site health":"site-health","site status":"site-health","site summary":"site-summary","site assets":"site-assets","site links":"site-links",
    dns:"dns-a",headers:"http-headers",security:"security-headers",tls:"security-hsts",cf:"edge","edge-status":"edge",github:"github-repo",gh:"github-repo",
    "deploy-status":"github-runs","repository-status":"github-repo","repo-status":"github-repo",net:"dns-a"
  };
  const fallbackFamilies={
    SYSTEM:["help","commands","list","man","which","status","version","config","history","clear","selftest","health","reload"],
    WEBSITE:["site","pages","routes","sitemap","robots","links","metadata","assets","broken-links","redirects","cache","deploy-status","site-health","site-summary"],
    ADMINISTRATION:["admin","users","sessions","access","permissions","audit","logs","settings","activity"],
    RECONNAISSANCE:["recon","domain","dns","whois","ip","asn","subnet","reverse-dns","certificates","ports","technologies"],
    WEB:["url","headers","links","endpoints","redirects","forms","scripts","metadata","emails","robots","sitemap"],
    SECURITY:["security","tls","headers","csp","hsts","exposure","reputation","vulnerabilities","dependencies","secrets","security-report"],
    CLOUDFLARE:["cf","zones","dns","workers","deployments","cache","firewall","access","analytics","edge-status"],
    GITHUB:["github","repo","branches","commits","files","issues","prs","actions","workflows","releases","tags","languages","contributors"],
    DATA:["mean","median","mode","range","sum","min","max","percent","calculate","json","csv","table"],
    ENGINEERING:["ohm","power","energy","resistor","voltage","current","frequency","wavelength","convert"],
    OSINT:["osint","username","company","domain","people","social","urlinfo","reputation"],
    NETWORK:["ping","resolve","traceroute","latency","ip","cidr","subnet","ports"],
    ANALYSIS:["analyze","compare","diff","summarize","correlate","timeline","report","export"],
    LEARNING:["quiz","answer","score","game","lesson","explain"],
    UTILITIES:["encode","decode","base64","hash","uuid","timestamp","regex","text","format"]
  };

  function line(text,kind="output"){const e=document.createElement("div");e.className="admin-terminal-line "+kind;e.textContent=String(text??"");host.appendChild(e);host.scrollTop=host.scrollHeight;return e}
  function prompt(q){line("adigun@control:~$ "+q,"prompt")}
  function parse(q){const pieces=String(q||"").trim().match(/(?:[^\s"]+|"[^"]*")+/g)||[];const command=(pieces.shift()||"").toLowerCase();return{command,args:pieces.map(x=>x.replace(/^"|"$/g,""))}}
  function mapServer(q){const s=q.trim().toLowerCase();if(aliases[s])return aliases[s];if(s==="help"||s==="commands"||s.startsWith("help "))return null;return s}

  function registry(){return window.AdigunCommandEngine?.registry&&typeof window.AdigunCommandEngine.registry==="object"?window.AdigunCommandEngine.registry:null}
  function helpText(topic=""){
    const reg=registry();const t=String(topic||"").trim().toLowerCase();
    if(reg){
      const keys=Object.keys(reg);
      if(t&&t!=="all"){
        const exact=keys.find(k=>k.toLowerCase()===t);
        if(exact){const v=reg[exact]||{};return ["ADIGUN CONTROL TERMINAL","",exact.toUpperCase(),"  "+String(v.description||v.help||v.usage||"Command available."),v.usage?"  USAGE: "+v.usage:"",v.example?"  EXAMPLE: "+v.example:""].filter(Boolean).join("\n")}
        const fam=Object.entries(reg).filter(([k,v])=>String(v?.family||v?.category||"").toLowerCase()===t);
        if(fam.length)return "ADIGUN CONTROL TERMINAL / "+t.toUpperCase()+"\n\n"+fam.map(([k,v])=>"  "+k.padEnd(20," ")+String(v?.description||v?.help||"")).join("\n");
      }
      return "ADIGUN CONTROL TERMINAL\n\nType HELP <COMMAND> for a manual entry.\nType HELP <FAMILY> for a family.\nType HELP ALL for the complete registry.\n\nCOMMANDS\n"+keys.map(k=>"  "+k).join("\n");
    }
    if(t&&t!=="all"){
      const family=Object.entries(fallbackFamilies).find(([k,v])=>k.toLowerCase()===t||v.includes(t));
      if(family&&family[0].toLowerCase()===t)return "ADIGUN CONTROL TERMINAL / "+family[0]+"\n\n"+family[1].map(x=>"  "+x).join("\n");
    }
    return "ADIGUN CONTROL TERMINAL\n\nHELP <FAMILY> · HELP <COMMAND> · HELP ALL\n\n"+Object.entries(fallbackFamilies).map(([k,v])=>"["+k+"]\n  "+v.join("  ")).join("\n\n")+"\n\nSafety: production mutations are approval-gated; arbitrary production shell execution is disabled.";
  }
  function listText(){
    const reg=registry();
    if(reg){
      const groups={};for(const [k,v] of Object.entries(reg)){const f=String(v?.family||v?.category||"OTHER").toUpperCase();(groups[f]||(groups[f]=[])).push(k)}
      return "ADIGUN CONTROL TERMINAL / COMMAND REGISTRY\n\n"+Object.entries(groups).map(([f,ks])=>"["+f+"]\n  "+ks.sort().join("  ")).join("\n\n")+"\n\nType HELP <FAMILY> or HELP <COMMAND> for details.";
    }
    return "ADIGUN CONTROL TERMINAL / COMMAND REGISTRY\n\n"+Object.entries(fallbackFamilies).map(([f,ks])=>"["+f+"]\n  "+ks.join("  ")).join("\n\n")+"\n\nType HELP <FAMILY> or HELP <COMMAND> for details.";
  }
  function renderServer(d){
    if(d?.type==="help")return helpText();
    if(d?.result&&typeof d.result==="object"){
      const r=d.result,rows=[];if(d.command)rows.push("COMMAND: "+d.command);if(d.baseCommand)rows.push("BASE: "+d.baseCommand);if(d.label)rows.push("DESCRIPTION: "+d.label);if(d.target)rows.push("TARGET: "+d.target);if(d.evidence?.evidenceId)rows.push("EVIDENCE: "+d.evidence.evidenceId);rows.push("");rows.push(JSON.stringify(r,null,2));return rows.join("\n");
    }
    return JSON.stringify(d,null,2);
  }

  async function execute(raw){
    const q=String(raw||"").trim();if(!q)return;
    prompt(q);state&&(state.textContent="● EXECUTING");run&&(run.disabled=true);input.disabled=true;meta&&(meta.textContent="Resolving command…");
    try{
      const {command,args}=parse(q);
      if(command==="clear"){host.innerHTML="";state&&(state.textContent="● READY");meta&&(meta.textContent="Terminal cleared.");return}
      if(command==="help"||command==="commands"){line(helpText(args.join(" ")),"output");return}
      if(command==="list"){line(listText(),"output");return}
      if(command==="history"){const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");line(h.length?h.map((x,i)=>String(i+1).padStart(3," ")+"  "+x).join("\n"):"No command history.");return}
      if(command==="exit"){line("ADIGUN Control remains open. Use browser navigation to leave the control center.","system");return}
      const local=window.AdigunCommandEngine?.local;
      const localCommands=new Set(["man","which","status","version","config","selftest","health","reload","mean","median","mode","range","sum","min","max","percent","calculate","ohm","power","energy","resistor","voltage","current","frequency","wavelength","convert","encode","decode","base64","hash","uuid","timestamp","regex","text","format","json","cidr","ip","url","urlinfo","website","site","security","github","cloudflare","osint","admin","users","sessions","access","permissions","audit","logs","settings","activity","quiz","game","lesson","explain"]);
      if(local&&localCommands.has(command)){line(await Promise.resolve(local(command,args)),"output");return}
      const serverCommand=mapServer(q);if(!serverCommand)throw Error("Unknown command. Type HELP to see the registry.");
      meta&&(meta.textContent="Executing authorised server command…");
      const r=await fetch("/api/admin/sandbox",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({command:serverCommand,args})});
      const rawResponse=await r.text();let d={};try{d=rawResponse?JSON.parse(rawResponse):{}}catch{throw Error("Server returned invalid JSON (HTTP "+r.status+").")}
      if(!r.ok||!d.ok)throw Error(d.error||"Command failed (HTTP "+r.status+")");
      line(renderServer(d),"output");meta&&(meta.textContent=d.evidence?.evidenceId?"Evidence ID: "+d.evidence.evidenceId:"Command completed.");
    }catch(e){line("ERROR: "+String(e.message||e),"error");meta&&(meta.textContent=String(e.message||e))}
    finally{try{const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");h.push(q);localStorage.setItem("adigun-command-history",JSON.stringify(h.slice(-100)))}catch{}run&&(run.disabled=false);input.disabled=false;state&&(state.textContent="● COMPLETE");input.value="";input.focus()}
  }

  input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();execute(input.value)}},true);
  document.addEventListener("click",e=>{const b=e.target.closest?.("[data-terminal-command]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();input.value=b.dataset.terminalCommand||"";execute(input.value)},true);
  run?.addEventListener("click",e=>{e.preventDefault();execute(input.value)},true);
  const list=document.querySelector("#terminalCommands");if(list&&registry()){list.innerHTML="";for(const c of Object.keys(registry())){const o=document.createElement("option");o.value=c;list.appendChild(o)}meta&&(meta.textContent=Object.keys(registry()).length+" commands loaded. Type HELP for the command registry.")}
  if(state)state.textContent="● READY";
});