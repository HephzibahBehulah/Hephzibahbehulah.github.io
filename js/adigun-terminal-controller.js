/* ADIGUN terminal controller. Loaded after the admin shell so the terminal has one authoritative input path. */
document.addEventListener("DOMContentLoaded",()=>{
  const input=document.querySelector("#terminalCommand"),host=document.querySelector("#adigunTerminal"),run=document.querySelector("#terminalRun"),meta=document.querySelector("#terminalMeta"),state=document.querySelector("#terminalState");
  if(!input||!host)return;
  const session=(()=>{try{return localStorage.getItem("hb-admin-session")||crypto.randomUUID()}catch{return String(Date.now())}})();
  try{localStorage.setItem("hb-admin-session",session)}catch{}
  const aliases={
    domain:"site-summary", "site health":"site-health", "site status":"site-health", "site summary":"site-summary", "site assets":"site-assets", "site links":"site-links",
    dns:"dns-a", headers:"http-headers", security:"security-headers", tls:"security-hsts", cf:"edge", "edge-status":"edge", github:"github-repo", gh:"github-repo",
    "deploy-status":"github-runs", "repository-status":"github-repo", "repo-status":"github-repo", net:"dns-a"
  };
  function line(text,kind="output"){const e=document.createElement("div");e.className="admin-terminal-line "+kind;e.textContent=String(text??"");host.appendChild(e);host.scrollTop=host.scrollHeight;return e}
  function prompt(q){line("adigun@control:~$ "+q,"prompt")}
  function argsFor(q){return q.trim().split(/\s+/).slice(1)}
  function mapServer(q){const s=q.trim().toLowerCase();if(aliases[s])return aliases[s];if(s.startsWith("help ")||s==="help"||s==="commands")return null;return s}
  function renderServer(d){
    if(d?.type==="help")return window.AdigunCommandEngine?.help?.()||JSON.stringify(d,null,2);
    if(d?.result&&typeof d.result==="object"){
      const r=d.result;
      const rows=[];
      if(d.command)rows.push("COMMAND: "+d.command);
      if(d.baseCommand)rows.push("BASE: "+d.baseCommand);
      if(d.label)rows.push("DESCRIPTION: "+d.label);
      if(d.target)rows.push("TARGET: "+d.target);
      if(d.evidence?.evidenceId)rows.push("EVIDENCE: "+d.evidence.evidenceId);
      rows.push("");rows.push(JSON.stringify(r,null,2));
      return rows.join("\n");
    }
    return JSON.stringify(d,null,2);
  }
  async function execute(raw){
    const q=String(raw||"").trim();if(!q)return;
    prompt(q);state&&(state.textContent="● EXECUTING");run&&(run.disabled=true);input.disabled=true;meta&&(meta.textContent="Resolving command…");
    try{
      const pieces=q.match(/(?:[^\s"]+|"[^"]*")+/g)||[];const command=pieces.shift()?.toLowerCase()||"";const a=pieces.map(x=>x.replace(/^"|"$/g,""));
      if(command==="clear"){host.innerHTML="";state&&(state.textContent="READY");meta&&(meta.textContent="Terminal cleared.");return}
      if(command==="history"){const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");line(h.length?h.map((x,i)=>String(i+1).padStart(3," ")+"  "+x).join("\n"):"No command history.");return}
      if(command==="exit"){line("ADIGUN Control remains open. Use the browser navigation to leave the control center.","system");return}
      const local=window.AdigunCommandEngine?.local;
      const localCommands=new Set(["help","commands","list","man","which","status","version","config","selftest","mean","median","mode","range","sum","min","max","percent","calculate","ohm","power","energy","resistor","voltage","current","frequency","wavelength","convert","encode","decode","base64","hash","uuid","timestamp","regex","text","format","json","cidr","ip","url","urlinfo","website","site","security","github","cloudflare","osint","admin","users","sessions","access","permissions","audit","logs","settings","activity","quiz","game","lesson","explain"]);
      if(local&&localCommands.has(command)){
        const result=await local(command,a);line(await Promise.resolve(result),"output");return;
      }
      const serverCommand=mapServer(q);
      if(!serverCommand)throw Error("Unknown command. Type HELP to see the registry.");
      meta&&(meta.textContent="Executing authorised server command…");
      const r=await fetch("/api/admin/sandbox",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({command:serverCommand})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.ok)throw Error(d.error||"Command failed");
      line(renderServer(d),"output");
      if(d.evidence?.evidenceId)meta&&(meta.textContent="Evidence ID: "+d.evidence.evidenceId);else meta&&(meta.textContent="Command completed.");
    }catch(e){line("ERROR: "+String(e.message||e),"error");meta&&(meta.textContent=String(e.message||e))}
    finally{try{const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");h.push(q);localStorage.setItem("adigun-command-history",JSON.stringify(h.slice(-100)))}catch{};run&&(run.disabled=false);input.disabled=false;state&&(state.textContent="● COMPLETE");input.value="";input.focus()}
  }
  document.addEventListener("keydown",e=>{if(document.activeElement===input&&e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();execute(input.value)}},true);
  document.addEventListener("click",e=>{const b=e.target.closest?.("[data-terminal-command]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();input.value=b.dataset.terminalCommand||"";execute(input.value)},true);
  run?.addEventListener("click",e=>{e.preventDefault();execute(input.value)},true);
  const list=document.querySelector("#terminalCommands");if(list&&window.AdigunCommandEngine){list.innerHTML="";for(const c of Object.keys(window.AdigunCommandEngine.registry)){const o=document.createElement("option");o.value=c;list.appendChild(o)}meta&&(meta.textContent=Object.keys(window.AdigunCommandEngine.registry).length+" commands loaded. Type HELP for the command registry.")}
});
