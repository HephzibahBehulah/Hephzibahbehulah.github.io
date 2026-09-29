document.addEventListener("DOMContentLoaded",()=>{
  const $=s=>document.querySelector(s);
  const accessStatus=$("#accessStatus"),identityEmail=$("#identityEmail"),heroAuth=$("#heroAuth"),heroIdentity=$("#heroIdentity");
  const systemState=$("#systemState"),identityState=$("#identityState"),identityDetail=$("#identityDetail");
  const inspectOutput=$("#inspectOutput"),inspectState=$("#inspectState");
  const HISTORY_KEY="adigun.intelligence.history.v1";
  let lastRaw=null;

  const escapeHtml=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  const fmtDate=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?"—":d.toLocaleString(undefined,{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})+" UTC";};
  const readHistory=()=>{try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch{return[]}};
  const writeHistory=h=>{try{localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,30)))}catch{}};

  function injectIntelligenceUI(){
    const section=$("#intelligence"),ops=section?.querySelector(".admin-ops"),out=$("#inspectOutput");
    if(!section||!ops||!out||$("#intelHumanView"))return;
    const checkpoint=document.createElement("button");
    checkpoint.className="os-btn";checkpoint.type="button";checkpoint.id="dailyCheckpoint";checkpoint.textContent="DAILY CHECKPOINT";
    ops.appendChild(checkpoint);

    const actions=document.createElement("div");
    actions.id="intelActions";
    actions.style.cssText="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px";
    actions.innerHTML='<button class="os-btn" id="intelRaw" type="button">VIEW RAW EVIDENCE</button><button class="os-btn" id="intelHistory" type="button">INTELLIGENCE HISTORY</button><button class="os-btn" id="intelAnalyze" type="button">ANALYZE FINDINGS</button><button class="os-btn" id="intelInvestigate" type="button">INVESTIGATE PROBLEM</button><button class="os-btn" id="intelPlan" type="button">CREATE ACTION PLAN</button>';
    out.parentNode.insertBefore(actions,out);

    const human=document.createElement("div");
    human.id="intelHumanView";
    human.style.cssText="display:none;margin-top:12px;font-family:var(--font-mono,monospace);white-space:pre-wrap;line-height:1.55;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(0,0,0,.18)";
    out.parentNode.insertBefore(human,out);

    const raw=document.createElement("pre");
    raw.id="intelRawView";raw.className="admin-inspect-output";raw.style.display="none";raw.style.marginTop="12px";
    out.parentNode.insertBefore(raw,out.nextSibling);

    const history=document.createElement("div");
    history.id="intelHistoryView";history.style.display="none";history.style.marginTop="12px";
    out.parentNode.insertBefore(history,out.nextSibling);

    checkpoint.addEventListener("click",()=>checkpointRun());
    $("#intelRaw").addEventListener("click",()=>{raw.style.display=raw.style.display==="none"?"block":"none";raw.textContent=lastRaw?JSON.stringify(lastRaw,null,2):"No raw evidence is available yet."});
    $("#intelHistory").addEventListener("click",()=>renderHistory());
    $("#intelAnalyze").addEventListener("click",()=>runOperator("Analyze the latest intelligence findings in the Intelligence panel. Explain the evidence in plain human language and distinguish observed facts from interpretation."));
    $("#intelInvestigate").addEventListener("click",()=>runOperator("Investigate the latest intelligence findings. Gather relevant evidence and explain what should be checked next."));
    $("#intelPlan").addEventListener("click",()=>runOperator("Create an approval-gated action plan from the latest intelligence findings. Do not execute production mutations."));
  }

  async function status(){
    const send=$("#adminSend");
    if(send)send.disabled=false;
    try{
      const r=await fetch("/api/admin/status",{credentials:"same-origin",cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.authenticated){
        accessStatus.textContent="● DENIED";accessStatus.className="denied";systemState.textContent="BLOCKED";identityState.textContent="NOT AUTHENTICATED";identityDetail.textContent=d.error||"Cloudflare Access authentication is required.";heroAuth.textContent="ACCESS DENIED";heroIdentity.textContent=d.error||"Sign in through Cloudflare Access.";return;
      }
      accessStatus.textContent="● AUTHENTICATED";accessStatus.className="ok";identityEmail.textContent=d.identity?.email||"verified";systemState.textContent="ONLINE";identityState.textContent="AUTHORIZED";identityDetail.textContent=d.identity?.email||"Cloudflare Access user";heroAuth.textContent="CLOUDFLARE ACCESS";heroIdentity.textContent=d.identity?.email||"ADIGUN Control administrator";
    }catch{systemState.textContent="UNAVAILABLE";identityState.textContent="UNKNOWN";identityDetail.textContent="Authentication status could not be refreshed. The Private Operator remains available and will report request errors.";}
  }

  function humanize(d,target){
    const lines=["SYSTEM INTELLIGENCE","────────────────────────────────"];
    const checks=Array.isArray(d?.checks)?d.checks:[];
    const add=(name,status,detail)=>lines.push(`${name.padEnd(14)} ${String(status||"UNKNOWN").toUpperCase()}${detail?"   "+detail:""}`);
    if(checks.length){
      const site=checks.find(x=>x.name==="website");
      const dns=checks.find(x=>x.name==="dns");
      const gh=checks.find(x=>x.name==="github");
      const cf=checks.find(x=>x.name==="cloudflare-edge");
      if(site)add("Website",site.status,site.httpStatus?`HTTP ${site.httpStatus}`:"");
      if(dns)add("DNS",dns.status,dns.result?.answers?`${dns.result.answers.length} A records`:"");
      if(gh)add("GitHub",gh.status,gh.repository||"");
      if(cf)add("Cloudflare",cf.status,"");
      const h=site?.securityHeaders||checks.find(x=>x.name==="command:http-headers")?.result?.headers||{};
      const missing=["strictTransportSecurity","contentSecurityPolicy","xContentTypeOptions","permissionsPolicy","crossOriginOpenerPolicy","crossOriginResourcePolicy"].filter(k=>h[k]==null);
      add("Security",missing.length?"NEEDS REVIEW":"HEALTHY",`${missing.length} headers missing`);
      lines.push(`Last check    ${fmtDate(d.checkedAt||d.observedAt||Date.now())}`);
      lines.push("","FINDINGS","");
      if(site?.httpStatus===522)lines.push("[HIGH] Website returned HTTP 522","The Cloudflare edge responded, but the origin connection timed out.","");
      if(missing.includes("strictTransportSecurity"))lines.push("[MEDIUM] HSTS not detected","Strict-Transport-Security was not present in the observed response.","");
      if(missing.includes("contentSecurityPolicy"))lines.push("[MEDIUM] CSP not detected","Content-Security-Policy was not present in the observed response.","");
      if(dns?.status==="healthy")lines.push("[GOOD] DNS responding","Cloudflare DNS returned the observed address records.","");
      if(cf?.status==="observed")lines.push("[INFO] Cloudflare edge detected","Edge presence was confirmed from live response headers.","");
      if(gh?.status==="unavailable")lines.push("[INFO] GitHub unavailable","The inspection endpoint could not retrieve the private repository metadata.","");
      lines.push("","VIEW RAW EVIDENCE is available below for the complete machine-readable record.");
    }else if(d?.target&&d?.result){
      lines.push(`Target        ${d.target}`,`Status        ${d.result?.ok===false?"DEGRADED":"OBSERVED"}`);
      if(d.result?.httpStatus)lines.push(`HTTP          ${d.result.httpStatus}`);
      if(Array.isArray(d.result?.data))lines.push(`Records       ${d.result.data.length}`);
      lines.push(`Last check    ${fmtDate(Date.now())}`);
    }else{
      lines.push(`Target        ${target||"inspection"}`,"No structured inspection summary was returned.");
    }
    return lines.join("\n");
  }

  function saveHistory(d,target){
    const h=readHistory();
    const checks=Array.isArray(d?.checks)?d.checks:[];
    const find=n=>checks.find(x=>x.name===n);
    h.unshift({at:d?.checkedAt||new Date().toISOString(),website:find("website")?.status||"—",dns:find("dns")?.status||"—",github:find("github")?.status||"—",security:(find("website")?.securityHeaders?"NEEDS REVIEW":"—"),target:target||"all"});
    writeHistory(h);
  }

  function renderHistory(){
    const box=$("#intelHistoryView");if(!box)return;
    const h=readHistory();
    box.style.display="block";
    box.innerHTML=h.length?`<div style="font-family:var(--font-mono,monospace);white-space:pre-wrap;line-height:1.6;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:8px"><strong>INTELLIGENCE HISTORY</strong>\n\n${h.map(x=>`${fmtDate(x.at)}\nWebsite: ${String(x.website).toUpperCase()}\nDNS: ${String(x.dns).toUpperCase()}\nGitHub: ${String(x.github).toUpperCase()}\nSecurity: ${String(x.security).toUpperCase()}\n`).join("\n")}</div>`:"<div class=\"admin-inspect-output\">No previous intelligence checks have been saved in this browser.</div>";
  }

  async function inspect(target){
    inspectState.textContent="● SCANNING";inspectOutput.textContent="Running "+target+" inspection…";document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=true);
    try{
      const r=await fetch("/api/admin/inspect?target="+encodeURIComponent(target),{credentials:"same-origin",cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"Inspection failed");
      lastRaw=d;
      const human=$("#intelHumanView");if(human){human.style.display="block";human.textContent=humanize(d,target)}
      const raw=$("#intelRawView");if(raw){raw.textContent=JSON.stringify(d,null,2);raw.style.display="none"}
      const hist=$("#intelHistoryView");if(hist)hist.style.display="none";
      saveHistory(d,target);
      inspectOutput.textContent="Human-readable intelligence is shown above. Use VIEW RAW EVIDENCE for the complete record.";
      inspectState.textContent="● COMPLETE";
    }catch(e){inspectOutput.textContent="Inspection error: "+String(e.message||e);inspectState.textContent="● ERROR";}
    finally{document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=false);}
  }

  async function checkpointRun(){
    const b=$("#dailyCheckpoint"),human=$("#intelHumanView");
    if(b)b.disabled=true;
    inspectState.textContent="● CHECKPOINT";
    try{
      const r=await fetch("/api/admin/inspect?target=github-commits",{credentials:"same-origin",cache:"no-store"});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"GitHub checkpoint failed");
      lastRaw=d;
      const commits=Array.isArray(d?.result?.data)?d.result.data:(Array.isArray(d?.data)?d.data:[]);
      const latest=commits[0],previous=commits[1];
      const prior=(()=>{try{return JSON.parse(localStorage.getItem("adigun.daily.checkpoint.v1")||"null")}catch{return null}})();
      const now=new Date().toISOString();
      if(latest)localStorage.setItem("adigun.daily.checkpoint.v1",JSON.stringify({sha:latest.sha,date:now,message:latest.commit?.message||latest.message||""}));
      if(human){human.style.display="block";human.textContent=["DAILY CHECKPOINT","────────────────────────────────",`Date          ${fmtDate(now)}`,`Repository    HephzibahBehulah/HephzibahBehulah.github.io`,`Latest commit ${latest?.sha||"UNAVAILABLE"}`,`Commit        ${(latest?.commit?.message||latest?.message||"Unavailable").split("\n")[0]}`,`Time          ${fmtDate(latest?.commit?.committer?.date||latest?.commit?.author?.date||now)}`,`Previous      ${previous?.sha||"UNAVAILABLE"}`,`Previous msg  ${(previous?.commit?.message||previous?.message||"Unavailable").split("\n")[0]}`,prior?.sha&&latest?.sha&&prior.sha!==latest.sha?"","CHANGE DETECTED: the latest commit differs from the previous saved daily checkpoint.":prior?.sha?"","No new commit since the previous saved daily checkpoint.","","This checkpoint is a read-only record. No repository changes were made."].join("\n")}
      const raw=$("#intelRawView");if(raw){raw.textContent=JSON.stringify(d,null,2);raw.style.display="none"}
      inspectState.textContent="● COMPLETE";
    }catch(e){if(human){human.style.display="block";human.textContent="DAILY CHECKPOINT\n────────────────────────────────\nGitHub checkpoint unavailable.\n\n"+String(e.message||e)}inspectState.textContent="● ERROR"}
    finally{if(b)b.disabled=false;}
  }

  async function runOperator(task){
    const input=$("#adminInput"),send=$("#adminSend");
    if(!input||!send)return;
    const old=input.value;input.value=task;send.click();if(!old)input.value="";
  }

  document.querySelectorAll("[data-inspect]").forEach(b=>b.addEventListener("click",()=>inspect(b.dataset.inspect)));
  $("#refreshStatus")?.addEventListener("click",status);
  injectIntelligenceUI();
  status();
});
