/* ADIGUN terminal controller v2 */
document.addEventListener("DOMContentLoaded",()=>{
  const input=document.querySelector("#terminalCommand"),host=document.querySelector("#adigunTerminal"),run=document.querySelector("#terminalRun"),meta=document.querySelector("#terminalMeta"),state=document.querySelector("#terminalState");
  if(!input||!host)return;
  const session=(()=>{try{return localStorage.getItem("hb-admin-session")||crypto.randomUUID()}catch{return String(Date.now())}})();
  try{localStorage.setItem("hb-admin-session",session)}catch{}
  const aliases={domain:"site-summary","site health":"site-health","site status":"site-health","site summary":"site-summary","site assets":"site-assets","site links":"site-links",dns:"dns-a",headers:"http-headers",security:"security-headers",tls:"security-hsts",cf:"edge","edge-status":"edge",github:"github-repo",gh:"github-repo","deploy-status":"github-runs","repository-status":"github-repo","repo-status":"github-repo",net:"dns-a"};
  const grouped=new Set(["site","security","github","cloudflare","osint","admin","users","sessions","access","permissions","audit","logs","settings","activity"]);
  const line=(text,kind="output")=>{const e=document.createElement("div");e.className="admin-terminal-line "+kind;e.textContent=String(text??"");host.appendChild(e);host.scrollTop=host.scrollHeight;return e};
  const serverName=q=>{const s=q.trim().toLowerCase();return aliases[s]||((s.startsWith("help ")||s==="help"||s==="commands")?null:s)};
  const render=d=>{if(d?.result&&typeof d.result==="object"){const p=[];if(d.command)p.push("COMMAND: "+d.command);if(d.baseCommand)p.push("BASE: "+d.baseCommand);if(d.label)p.push("DESCRIPTION: "+d.label);if(d.target)p.push("TARGET: "+d.target);if(d.evidence?.evidenceId)p.push("EVIDENCE: "+d.evidence.evidenceId);return p.concat(["",JSON.stringify(d.result,null,2)]).join("\n")}return JSON.stringify(d,null,2)};
  async function execute(raw){
    const q=String(raw||"").trim();if(!q)return;line("adigun@control:~$ "+q,"prompt");state&&(state.textContent="● EXECUTING");run&&(run.disabled=true);input.disabled=true;
    try{
      const pieces=q.match(/(?:[^\s"]+|"[^"]*")+/g)||[],command=(pieces.shift()||"").toLowerCase(),args=pieces.map(x=>x.replace(/^"|"$/g,""));
      if(command==="clear"){host.innerHTML="";state&&(state.textContent="READY");meta&&(meta.textContent="Terminal cleared.");return}
      if(command==="history"){const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");line(h.length?h.map((x,i)=>String(i+1).padStart(3," ")+"  "+x).join("\n"):"No command history.");return}
      if(command==="exit"){line("ADIGUN Control remains open. Use browser navigation to leave the control center.","system");return}
      const local=window.AdigunCommandEngine?.local;
      const localCommands=new Set(["help","commands","list","man","which","status","version","config","selftest","mean","median","mode","range","sum","min","max","percent","calculate","ohm","power","energy","resistor","voltage","current","frequency","wavelength","convert","encode","decode","base64","hash","uuid","timestamp","regex","text","format","json","cidr","ip","url","urlinfo","website","quiz","game","lesson","explain"]);
      if(local&&localCommands.has(command)&&!(grouped.has(command)&&args.length)){meta&&(meta.textContent="Browser command engine");line(await Promise.resolve(local(command,args)),"output");return}
      const serverCommand=serverName(q);if(!serverCommand)throw Error("Unknown command. Type HELP to see the registry.");
      meta&&(meta.textContent="Executing authorised server command…");
      const r=await fetch("/api/admin/sandbox",{method:"POST",headers:{"content-type":"application/json","x-hb-session":session},credentials:"same-origin",cache:"no-store",body:JSON.stringify({command:serverCommand})});
      const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw Error(d.error||"Command failed");line(render(d),"output");meta&&(meta.textContent=d.evidence?.evidenceId?"Evidence ID: "+d.evidence.evidenceId:"Command completed.");
    }catch(e){line("ERROR: "+String(e.message||e),"error");meta&&(meta.textContent=String(e.message||e))}
    finally{try{const h=JSON.parse(localStorage.getItem("adigun-command-history")||"[]");h.push(q);localStorage.setItem("adigun-command-history",JSON.stringify(h.slice(-100)))}catch{};run&&(run.disabled=false);input.disabled=false;state&&(state.textContent="● COMPLETE");input.value="";input.focus()}
  }
  document.addEventListener("keydown",e=>{if(document.activeElement===input&&e.key==="Enter"){e.preventDefault();e.stopImmediatePropagation();execute(input.value)}},true);
  document.addEventListener("click",e=>{const b=e.target.closest?.("[data-terminal-command]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();input.value=b.dataset.terminalCommand||"";execute(input.value)},true);
  run?.addEventListener("click",e=>{e.preventDefault();execute(input.value)},true);
  const list=document.querySelector("#terminalCommands");if(list&&window.AdigunCommandEngine){list.innerHTML="";for(const c of Object.keys(window.AdigunCommandEngine.registry)){const o=document.createElement("option");o.value=c;list.appendChild(o)}meta&&(meta.textContent=Object.keys(window.AdigunCommandEngine.registry).length+" commands loaded. Type HELP for the command registry.")}
});
