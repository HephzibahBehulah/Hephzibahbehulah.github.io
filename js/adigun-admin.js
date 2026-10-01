document.addEventListener("DOMContentLoaded",()=>{
  const $=s=>document.querySelector(s);
  const accessStatus=$("#accessStatus"),identityEmail=$("#identityEmail"),heroAuth=$("#heroAuth"),heroIdentity=$("#heroIdentity");
  const systemState=$("#systemState"),identityState=$("#identityState"),identityDetail=$("#identityDetail");
  const inspectOutput=$("#inspectOutput"),inspectState=$("#inspectState");
  const HISTORY_KEY="adigun.intelligence.history.v1";
  const CHECKPOINT_KEY="adigun.daily.checkpoint.v2";
  const REPO="HephzibahBehulah/HephzibahBehulah.github.io";
  let lastRaw=null;
  const fmtDate=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?"—":d.toLocaleString(undefined,{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})+" UTC";};
  const readHistory=()=>{try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch{return[]}};
  const writeHistory=h=>{try{localStorage.setItem(HISTORY_KEY,JSON.stringify(h.slice(0,30)))}catch{}};
  const readCheckpoint=()=>{try{return JSON.parse(localStorage.getItem(CHECKPOINT_KEY)||"null")}catch{return null}};
  const writeCheckpoint=v=>{try{localStorage.setItem(CHECKPOINT_KEY,JSON.stringify(v))}catch{}};
  function injectIntelligenceUI(){
    const section=$("#intelligence"),ops=section?.querySelector(".admin-ops"),out=$("#inspectOutput");
    if(!section||!ops||!out||$("#intelHumanView"))return;
    const checkpoint=document.createElement("button");checkpoint.className="os-btn";checkpoint.type="button";checkpoint.id="dailyCheckpoint";checkpoint.textContent="DAILY CHECKPOINT";ops.appendChild(checkpoint);
    const actions=document.createElement("div");actions.id="intelActions";actions.style.cssText="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px";actions.innerHTML='<button class="os-btn" id="intelRaw" type="button">VIEW RAW EVIDENCE</button><button class="os-btn" id="intelHistory" type="button">INTELLIGENCE HISTORY</button><button class="os-btn" id="intelAnalyze" type="button">ANALYZE FINDINGS</button><button class="os-btn" id="intelInvestigate" type="button">INVESTIGATE PROBLEM</button><button class="os-btn" id="intelPlan" type="button">CREATE ACTION PLAN</button>';out.parentNode.insertBefore(actions,out);
    const human=document.createElement("div");human.id="intelHumanView";human.style.cssText="display:none;margin-top:12px;font-family:var(--font-mono,monospace);white-space:pre-wrap;line-height:1.55;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(0,0,0,.18)";out.parentNode.insertBefore(human,out);
    const raw=document.createElement("pre");raw.id="intelRawView";raw.className="admin-inspect-output";raw.style.display="none";raw.style.marginTop="12px";out.parentNode.insertBefore(raw,out.nextSibling);
    const history=document.createElement("div");history.id="intelHistoryView";history.style.display="none";history.style.marginTop="12px";out.parentNode.insertBefore(history,out.nextSibling);
    checkpoint.addEventListener("click",checkpointRun);
    $("#intelRaw").addEventListener("click",()=>{raw.style.display=raw.style.display==="none"?"block":"none";raw.textContent=lastRaw?JSON.stringify(lastRaw,null,2):"No raw evidence is available yet."});
    $("#intelHistory").addEventListener("click",renderHistory);
    $("#intelAnalyze").addEventListener("click",()=>runOperator("Analyze the latest intelligence findings in the Intelligence panel. Explain the evidence in plain human language and distinguish observed facts from interpretation."));
    $("#intelInvestigate").addEventListener("click",()=>runOperator("Investigate the latest intelligence findings. Gather relevant evidence and explain what should be checked next."));
    $("#intelPlan").addEventListener("click",()=>runOperator("Create an approval-gated action plan from the latest intelligence findings. Do not execute production mutations."));
  }
  async function status(){
    const send=$("#adminSend");if(send)send.disabled=false;
    try{const r=await fetch("/api/admin/status",{credentials:"same-origin",cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok||!d.authenticated){accessStatus.textContent="● DENIED";accessStatus.className="denied";systemState.textContent="BLOCKED";identityState.textContent="NOT AUTHENTICATED";identityDetail.textContent=d.error||"Cloudflare Access authentication is required.";heroAuth.textContent="ACCESS DENIED";heroIdentity.textContent=d.error||"Sign in through Cloudflare Access.";return;}accessStatus.textContent="● AUTHENTICATED";accessStatus.className="ok";identityEmail.textContent=d.identity?.email||"verified";systemState.textContent="ONLINE";identityState.textContent="AUTHORIZED";identityDetail.textContent=d.identity?.email||"Cloudflare Access user";heroAuth.textContent="CLOUDFLARE ACCESS";heroIdentity.textContent=d.identity?.email||"ADIGUN Control administrator";}catch{systemState.textContent="UNAVAILABLE";identityState.textContent="UNKNOWN";identityDetail.textContent="Authentication status could not be refreshed. The Private Operator remains available and will report request errors.";}}
  function prettyKey(key){
    return String(key||"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]+/g," ").replace(/\\b\\w/g,m=>m.toUpperCase());
  }
  function prettyValue(value, depth=0){
    if(value===null||value===undefined||value==="") return "Not reported";
    if(typeof value==="boolean") return value?"Yes":"No";
    if(typeof value==="number") return String(value);
    if(typeof value==="string") return value;
    if(Array.isArray(value)){
      if(!value.length) return "None";
      if(value.every(v=>["string","number","boolean"].includes(typeof v))) return value.map(String).join(", ");
      return value.slice(0,12).map((v,i)=>`${i+1}. ${prettyValue(v,depth+1)}`).join("\n");
    }
    if(typeof value==="object"){
      if(depth>2) return "[details available in raw evidence]";
      return Object.entries(value).slice(0,30).map(([k,v])=>`${prettyKey(k)}: ${prettyValue(v,depth+1)}`).join("\n");
    }
    return String(value);
  }
  function appendResult(lines,label,result){
    if(!result || typeof result!=="object"){lines.push(String(result??"No result returned."));return;}
    if(result.httpStatus!=null) lines.push("HTTP status   "+String(result.httpStatus)+(result.ok===true?" — successful":result.ok===false?" — non-success":""));
    if(result.finalUrl) lines.push("Final URL     "+String(result.finalUrl));
    if(result.durationMs!=null) lines.push("Response time "+String(result.durationMs)+" ms");
    if(result.title) lines.push("Title         "+String(result.title));
    if(result.headers){
      lines.push("","HEADERS");
      Object.entries(result.headers).slice(0,40).forEach(([k,v])=>lines.push("  "+k+": "+String(v)));
    }
    if(result.checks && !Array.isArray(result.checks)){
      lines.push("","CHECKS");
      Object.entries(result.checks).forEach(([k,v])=>lines.push("  "+prettyKey(k)+": "+prettyValue(v)));
    }
    if(Array.isArray(result.checks)){
      lines.push("","CHECKS");
      result.checks.slice(0,30).forEach((x,i)=>{
        const name=x?.command||x?.name||x?.path||`Check ${i+1}`;
        const state=x?.httpStatus!=null?`HTTP ${x.httpStatus}`:x?.ok===true?"OK":x?.ok===false?"FAILED":"OBSERVED";
        lines.push("  "+name+": "+state);
      });
      if(result.checks.length>30)lines.push("  … "+String(result.checks.length-30)+" more");
    }
    for(const [k,v] of Object.entries(result)){
      if(["httpStatus","ok","finalUrl","durationMs","title","headers","checks"].includes(k))continue;
      if(k==="body"){
        const text=String(v||"");
        lines.push("","CONTENT",text.slice(0,2500)+(text.length>2500?"\n… content truncated":""));
      }else if(k==="data" && v && typeof v==="object"){
        lines.push("","DETAILS");
        if(v.full_name||v.name)lines.push("  Repository: "+String(v.full_name||v.name));
        if(v.description)lines.push("  Description: "+String(v.description));
        if(v.default_branch)lines.push("  Default branch: "+String(v.default_branch));
        if(v.html_url)lines.push("  URL: "+String(v.html_url));
        if(v.language)lines.push("  Primary language: "+String(v.language));
        if(Array.isArray(v))lines.push("  Records: "+String(v.length));
      }else{
        lines.push(prettyKey(k)+"  "+prettyValue(v));
      }
    }
  }
  function humanize(d,target){
    const lines=["SYSTEM INTELLIGENCE","────────────────────────────────"];
    const checks=Array.isArray(d?.checks)?d.checks:[];
    const add=(name,status,detail)=>lines.push(`${String(name).padEnd(14)} ${String(status||"UNKNOWN").toUpperCase()}${detail?"   "+detail:""}`);
    if(checks.length){
      const site=checks.find(x=>x.name==="website"||x.command==="site-health"||x.command==="http-status");
      const dns=checks.find(x=>x.name==="dns"||String(x.command||"").startsWith("dns-"));
      const gh=checks.find(x=>x.name==="github"||x.command==="github-repo");
      const cf=checks.find(x=>x.name==="cloudflare-edge"||x.command==="edge");
      if(site)add("Website",site.status||((site.result?.ok===true)?"HEALTHY":"OBSERVED"),site.httpStatus?`HTTP ${site.httpStatus}`:"");
      if(dns)add("DNS",dns.status||"OBSERVED",dns.result?.answers?`${dns.result.answers.length} records`:"");
      if(gh)add("GitHub",gh.status||"OBSERVED",gh.repository||"");
      if(cf)add("Cloudflare",cf.status||"OBSERVED","");
      lines.push(`Last check    ${fmtDate(d.checkedAt||d.observedAt||Date.now())}`,"","FINDINGS","");
      if(site?.httpStatus===522||site?.result?.httpStatus===522)lines.push("[HIGH] Website returned HTTP 522","The Cloudflare edge responded, but the origin connection timed out.","");
      if(site?.result?.ok===true)lines.push("[GOOD] Website responded successfully","The authorized production homepage returned a successful HTTP response.","");
      if(dns?.status==="healthy"||dns?.result?.answers)lines.push("[GOOD] DNS responded","DNS evidence was returned by the inspection service.","");
      if(cf?.status==="observed"||cf?.result)lines.push("[INFO] Cloudflare edge evidence available","The response included edge-related evidence.","");
      lines.push("","DETAILS");
      checks.slice(0,12).forEach(x=>{
        lines.push("","• "+String(x.name||x.command||"Check").toUpperCase());
        if(x.result)appendResult(lines,x.name||x.command,x.result);
        else if(x.error)lines.push("  Error: "+String(x.error));
      });
    }else if(d?.target&&d?.result){
      lines.push("Target        "+String(d.target));
      appendResult(lines,target,d.result);
      lines.push("","Last check    "+fmtDate(d.checkedAt||d.observedAt||Date.now()));
    }else{
      lines.push("Target        "+String(target||"inspection"),"No structured inspection summary was returned.");
    }
    lines.push("","","VIEW RAW EVIDENCE remains available when the complete machine-readable record is needed.");
    return lines.join("\n");
  }
  function saveHistory(d,target){const h=readHistory(),checks=Array.isArray(d?.checks)?d.checks:[],find=n=>checks.find(x=>x.name===n);h.unshift({at:d?.checkedAt||new Date().toISOString(),website:find("website")?.status||"—",dns:find("dns")?.status||"—",github:find("github")?.status||"—",security:find("website")?.securityHeaders?"NEEDS REVIEW":"—",target:target||"all"});writeHistory(h);}
  function renderHistory(){const box=$("#intelHistoryView");if(!box)return;const h=readHistory();box.style.display="block";box.innerHTML=h.length?`<div style="font-family:var(--font-mono,monospace);white-space:pre-wrap;line-height:1.6;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:8px"><strong>INTELLIGENCE HISTORY</strong>\n\n${h.map(x=>`${fmtDate(x.at)}\nWebsite: ${String(x.website).toUpperCase()}\nDNS: ${String(x.dns).toUpperCase()}\nGitHub: ${String(x.github).toUpperCase()}\nSecurity: ${String(x.security).toUpperCase()}\n`).join("\n")}</div>`:"<div class=\"admin-inspect-output\">No previous intelligence checks have been saved in this browser.</div>";}
  async function inspect(target){inspectState.textContent="● SCANNING";inspectOutput.textContent="Running "+target+" inspection…";document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=true);try{const r=await fetch("/api/admin/inspect?target="+encodeURIComponent(target),{credentials:"same-origin",cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Inspection failed");lastRaw=d;const human=$("#intelHumanView");if(human){human.style.display="block";human.textContent=humanize(d,target)}const raw=$("#intelRawView");if(raw){raw.textContent=JSON.stringify(d,null,2);raw.style.display="none"}const hist=$("#intelHistoryView");if(hist)hist.style.display="none";saveHistory(d,target);inspectOutput.textContent="Human-readable intelligence is shown above. Use VIEW RAW EVIDENCE for the complete record.";inspectState.textContent="● COMPLETE";}catch(e){inspectOutput.textContent="Inspection error: "+String(e.message||e);inspectState.textContent="● ERROR";}finally{document.querySelectorAll("[data-inspect]").forEach(b=>b.disabled=false);}}
  function normalizeCommit(c){return {sha:c?.sha||"",message:String(c?.commit?.message||c?.message||"").split("\n")[0],date:c?.commit?.committer?.date||c?.commit?.author?.date||c?.committer?.date||c?.author?.date||"",url:c?.html_url||c?.url||""};}
  async function fetchLatestCommits(){
    const r=await fetch("/api/admin/inspect?target=github-repo",{credentials:"same-origin",cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d?.error||`GitHub inspection returned HTTP ${r.status}`);
    const source=d?.result||d?.data||d;
    const history=Array.isArray(d?.checks)?d.checks.find(x=>x.name==="github-recent-history"):null;
    if(Array.isArray(history?.commits)&&history.commits.length)return history.commits.slice(0,2).map(normalizeCommit);
    const candidates=Array.isArray(source)?source:(Array.isArray(source?.commits)?source.commits:(Array.isArray(source?.data)?source.data:[]));
    if(candidates.length)return candidates.slice(0,2).map(normalizeCommit);
    const latest=source?.latestCommit||source?.latest||source?.commit;
    const previous=source?.previousCommit||source?.previous;
    if(latest){const out=[normalizeCommit(latest)];if(previous)out.push(normalizeCommit(previous));return out;}
    throw new Error(source?.message||"The server-side GitHub inspection returned no commit history.");
  }
  async function checkpointRun(){const b=$("#dailyCheckpoint"),human=$("#intelHumanView"),raw=$("#intelRawView");if(b)b.disabled=true;inspectState.textContent="● CHECKPOINT";try{const commits=await fetchLatestCommits(),latest=commits[0],previous=commits[1],prior=readCheckpoint(),now=new Date().toISOString();const changed=!!prior?.sha&&prior.sha!==latest.sha,firstRun=!prior?.sha;writeCheckpoint({sha:latest.sha,date:now,message:latest.message});const lines=["DAILY CHECKPOINT","────────────────────────────────",`Date           ${fmtDate(now)}`,`Repository     ${REPO}`,`Latest commit  ${latest.sha||"UNAVAILABLE"}`,`Commit         ${latest.message||"Unavailable"}`,`Commit time    ${fmtDate(latest.date||now)}`,`Previous commit ${previous?.sha||"UNAVAILABLE"}`,`Previous msg   ${previous?.message||"Unavailable"}`,"",firstRun?"BASELINE SAVED: this is the first daily checkpoint on this browser.":changed?"CHANGE DETECTED: a new commit exists since the previous saved checkpoint.":"NO CHANGE: the latest commit matches the previous saved checkpoint.","","This checkpoint is read-only. No repository changes were made."];if(human){human.style.display="block";human.textContent=lines.join("\n")}if(raw){raw.textContent=JSON.stringify({ok:true,repository:REPO,checkedAt:now,latest,previous,previousCheckpoint:prior||null},null,2);raw.style.display="none"}inspectOutput.textContent="Daily checkpoint completed. The latest and previous commits are shown above.";inspectState.textContent="● COMPLETE";}catch(e){if(human){human.style.display="block";human.textContent=["DAILY CHECKPOINT","────────────────────────────────","STATUS        FAILED","","GitHub commit history could not be retrieved.",String(e.message||e),"","No checkpoint was saved. No repository changes were made."].join("\n")}inspectOutput.textContent="Daily checkpoint failed: "+String(e.message||e);inspectState.textContent="● ERROR";}finally{if(b)b.disabled=false;}}
  async function runOperator(task){const input=$("#adminInput"),send=$("#adminSend");if(!input||!send)return;input.value=task;send.click();}
  document.querySelectorAll("[data-inspect]").forEach(b=>b.addEventListener("click",()=>inspect(b.dataset.inspect)));$("#refreshStatus")?.addEventListener("click",status);injectIntelligenceUI();status();
});
