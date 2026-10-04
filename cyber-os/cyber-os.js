(()=>{"use strict";const D=window.CYBER_DATA||{};const $=id=>document.getElementById(id);const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));function card(title,tag,body){return '<article class="cyber-card"><span class="tag">'+esc(tag)+'</span><h3>'+esc(title)+'</h3>'+body+'</article>'}
function knowledgeHub(){const H=window.CYBER_HUB||{},targets=H.targets||{};const label=(k,n)=>{const a=H[k]||[];return Array.isArray(a)?a.length:n||0};const catalogs=H.catalogs||[];$("hubCatalogs").innerHTML=catalogs.map(c=>card(c[0],"TARGET "+c[2].toLocaleString(),'<p>'+esc(c[3])+'</p><p><b>Loaded now:</b> '+label(c[1])+' · <b>Target:</b> '+c[2].toLocaleString()+'</p>')).join("");$("hubModels").innerHTML=(H.models||[]).map(m=>'<article class="detail-panel"><h3>'+esc(m.name)+'</h3><div class="function-list">'+(m.layers||[]).map(x=>'<span><b>'+esc(x[0])+'</b> '+esc(x[1])+'</span>').join("")+'</div><p>'+(m.layers||[]).map(x=>'<b>'+esc(x[1])+':</b> '+esc(x[2])+' · '+esc(x[3])).join("<br>")+'</p><a href="'+esc(m.source)+'" target="_blank" rel="noopener">REFERENCE ↗</a></article>').join("");const render=()=>{const q=($("hubSearch").value||"").trim().toLowerCase(),f=$("hubFilter").value,sets=f==="all"?Object.entries({networkTools:H.networkTools,protocols:H.protocols,windowsCommands:H.windowsCommands,linuxCommands:H.linuxCommands,shortcuts:H.shortcuts,powerTricks:H.powerTricks,suspicious:H.suspicious,hackerTypes:H.hackerTypes,teams:H.teams,platforms:H.platforms,electronics:H.electronics}):[[f,H[f]]];let out=[];sets.forEach(([type,a])=>(a||[]).forEach(x=>{const text=JSON.stringify(x).toLowerCase();if(!q||text.includes(q)){let title=Array.isArray(x)?x[0]:x;let body=Array.isArray(x)?x.slice(1).map((v,i)=>'<p><b>'+["Detail","Purpose","Reference","Notes"][i]+':</b> '+esc(v)+'</p>').join(""):'<pre>'+esc(x)+'</pre>';out.push(card(title,type.toUpperCase(),body))}}));$("hubResults").innerHTML=out.slice(0,300).join("")||'<div class="detail-panel">No matching knowledge found.</div>';};$("hubSearch").oninput=render;$("hubFilter").onchange=render;render()} function stats(){const g=[["NETWORK",D.network?.length],["COMMANDS",D.commands?.length],["SHORTCUTS",D.shortcuts?.length],["FRAMEWORKS",D.frameworks?.length],["FORMULAS",D.formulas?.length],["GAMES",D.games?.length],["LABS",D.labs?.length],["GLOSSARY",D.glossary?.length]];$("stats").innerHTML=g.map(x=>'<div><b>'+x[1]+'</b><span>'+x[0]+'</span></div>').join("")}
function network(){const q=($("networkSearch").value||"").toLowerCase(),f=$("networkFilter").value;const a=(D.network||[]).filter(x=>(f==="all"||(f==="protocol"&&x.name)||(f==="port"&&x.port!=="—")||(f==="layer"&&x.osi))&&(!q||JSON.stringify(x).toLowerCase().includes(q)));$("networkGrid").innerHTML=a.map(x=>card(x.name,"NETWORK",'<p><b>Port:</b> '+esc(x.port)+' · <b>Transport:</b> '+esc(x.transport)+'</p><p><b>OSI:</b> '+esc(x.osi)+' · <b>TCP/IP:</b> '+esc(x.tcpip)+'</p><p><b>Security:</b> '+esc(x.security)+'</p><div class="chips">'+x.tags.map(t=>'<span>'+esc(t)+'</span>').join("")+'</div>')).join("")}
function commands(){const q=($("commandSearch").value||"").toLowerCase(),p=$("commandPlatform").value;const a=(D.commands||[]).filter(x=>(p==="all"||x.platform===p)&&(!q||JSON.stringify(x).toLowerCase().includes(q)));$("commandGrid").innerHTML=a.map(x=>card(x.name,"COMMAND · "+x.platform,'<pre>'+esc(x.example)+'</pre><p>'+esc(x.purpose)+'</p><p><b>Security use:</b> '+esc(x.security)+'</p>')).join("")}
function shortcuts(){const q=($("shortcutSearch").value||"").toLowerCase(),p=$("shortcutPlatform").value;const a=(D.shortcuts||[]).filter(x=>(p==="all"||x.platform===p)&&(!q||JSON.stringify(x).toLowerCase().includes(q)));$("shortcutGrid").innerHTML=a.map(x=>card(x.keys,"SHORTCUT · "+x.platform,'<p>'+esc(x.purpose)+'</p><p><b>Cyber use:</b> '+esc(x.use)+'</p>')).join("")}
function frameworks(){const w=$("frameworkWheel");w.innerHTML=(D.frameworks||[]).map((x,i)=>'<button class="framework-btn '+(i===0?"active":"")+'" data-i="'+i+'">'+esc(x.name)+'</button>').join("");const show=i=>{const x=D.frameworks[i];$("frameworkDetail").innerHTML='<h3>'+esc(x.name)+'</h3><p>'+esc(x.summary)+'</p><div class="function-list">'+x.functions.map(f=>'<span>'+esc(f)+'</span>').join("")+'</div><p>'+esc(x.details)+'</p><a href="'+esc(x.source)+'" target="_blank" rel="noopener">OFFICIAL SOURCE ↗</a>'};w.querySelectorAll("button").forEach(b=>b.onclick=()=>{w.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");show(+b.dataset.i)});show(0)}
function osint(){ $("osintFlow").innerHTML=(D.osintFlow||[]).map(x=>'<div class="flow-card"><i>'+x[0]+'</i><b>'+esc(x[1])+'</b><span>'+esc(x[2])+'</span></div>').join("");$("osintSources").innerHTML=(D.osintSources||[]).map(x=>card(x[0],"OSINT",'<p>'+esc(x[1])+'</p><a href="'+esc(x[2])+'" target="_blank" rel="noopener">OPEN SOURCE ↗</a>')).join("")}
function detection(){ $("detectionGrid").innerHTML=(D.detection||[]).map(x=>card(x[0],"DEFENSIVE",'<p><b>Path:</b> '+esc(x[1])+'</p><p>'+esc(x[2])+'</p>')).join("");$("lifecycle").innerHTML=["Watch","Collect","Detect","Respond","Recover","Learn"].map((x,i)=>'<span><b>0'+(i+1)+'</b>'+x+'</span>').join("")}
function teams(){ $("teamGrid").innerHTML=(D.teams||[]).map(x=>card(x[0],"ROLE · "+x[1],'<p>'+esc(x[2])+'</p><p><b>Typical data/tools:</b> '+esc(x[3])+'</p>')).join("")}
function formulas(){const s=$("formulaSelect");s.innerHTML=(D.formulas||[]).map(x=>'<option value="'+x.id+'">'+esc(x.name)+' — '+esc(x.formula)+'</option>').join("");const inputs=()=>{const f=D.formulas.find(x=>x.id===s.value);$("formulaInputs").innerHTML=(f.vars||[]).map(v=>'<label>'+esc(v[0])+' · '+esc(v[1])+' ('+esc(v[2])+')<input inputmode="decimal" data-var="'+esc(v[0])+'"></label>').join("")};s.onchange=inputs;inputs();$("calculateFormula").onclick=()=>{const f=D.formulas.find(x=>x.id===s.value),v={};$("formulaInputs").querySelectorAll("input").forEach(i=>{if(i.value.trim())v[i.dataset.var]=Number(i.value)});const r=f.calc(v);$("formulaResult").textContent=r.error||Object.entries(r).map(x=>x[0]+" = "+Number(x[1].toFixed(8))).join("\n")};$("formulaGrid").innerHTML=D.formulas.map(x=>card(x.name,"FORMULA",'<p><b>'+esc(x.formula)+'</b></p><p>Variables: '+x.vars.map(v=>esc(v[0])+" "+esc(v[1])).join(", ")+'</p>')).join("")}
let gi=0;function game(){const g=D.games[gi%D.games.length];$("gameArea").innerHTML='<div class="game-card"><span class="tag">SCENARIO '+(gi+1)+'</span><h2>'+esc(g.title)+'</h2><p>'+esc(g.question)+'</p><div class="game-options">'+g.options.map((o,i)=>'<button data-i="'+i+'">'+esc(o)+'</button>').join("")+'</div><div id="gameFeedback"></div><button class="os-btn" id="nextGame">NEXT SCENARIO →</button></div>';$("gameArea").querySelectorAll(".game-options button").forEach(b=>b.onclick=()=>{$("gameFeedback").className=+b.dataset.i===g.answer?"good":"bad";$("gameFeedback").textContent=(+b.dataset.i===g.answer?"CORRECT. ":"NOT YET. ")+g.explain});$("nextGame").onclick=()=>{gi++;game()}}
function labs(){$("labGrid").innerHTML=(D.labs||[]).map(x=>card(x[0],"LAB · "+x[2],'<p>'+esc(x[1])+'</p><p><b>How:</b> '+esc(x[3])+'</p>')).join("")}
function glossary(){const q=($("glossarySearch").value||"").toLowerCase();const a=(D.glossary||[]).filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));$("glossaryGrid").innerHTML=a.map(x=>card(x[0],"TERM · "+x[3],'<p><b>'+esc(x[1])+'</b></p><p>'+esc(x[2])+'</p>')).join("")}
function graph(){const g=window.CYBER_GRAPH||{};$("graphView").innerHTML='<div class="graph-lines">'+(g.nodes||[]).map(x=>'<span>'+esc(x[0])+' <b>→</b> '+esc(x[1])+'</span>').join("")+'</div>';$("sourceRegistry").innerHTML=(window.CYBER_SOURCES||[]).map(x=>card(x[0],"SOURCE · "+x[2],'<p>Source-backed reference for Cyber OS records.</p><a href="'+esc(x[1])+'" target="_blank" rel="noopener">OPEN SOURCE ↗</a>')).join("")}function learning(){$("learningPath").innerHTML=(D.learning||[]).map(x=>'<article><span>'+x[0]+'</span><div><h3>'+esc(x[1])+'</h3><p>'+esc(x[2])+'</p></div><a href="#'+esc(x[3])+'">OPEN →</a></article>').join("")}
function search(){const q=($("globalSearch").value||"").trim().toLowerCase();if(!q){$("searchMeta").textContent="READY";return}const map={network:"networking",command:"commands",shortcut:"shortcuts",framework:"frameworks",formula:"formulas",glossary:"glossary",team:"teams"};let hits=[];Object.entries({network:D.network,command:D.commands,shortcut:D.shortcuts,framework:D.frameworks,formula:D.formulas,glossary:D.glossary,team:D.teams}).forEach(([k,a])=>(a||[]).forEach(x=>{if(JSON.stringify(x).toLowerCase().includes(q))hits.push(k)}));const types=[...new Set(hits)];$("searchMeta").textContent=hits.length+" matches across "+types.length+" domains";if(types[0])location.hash=map[types[0]]}
document.addEventListener("DOMContentLoaded",()=>{stats();knowledgeHub();network();commands();shortcuts();frameworks();osint();detection();teams();formulas();game();labs();glossary();learning();$("networkSearch").oninput=network;$("networkFilter").onchange=network;$("commandSearch").oninput=commands;$("commandPlatform").onchange=commands;$("shortcutSearch").oninput=shortcuts;$("shortcutPlatform").onchange=shortcuts;$("glossarySearch").oninput=glossary;$("globalSearch").onkeydown=e=>{if(e.key==="Enter")search()}})})();

/* CYBER OS NAV/PAGE SYNCHRONIZER */
document.addEventListener("DOMContentLoaded",()=>{
  const content=document.querySelector(".cyber-os .os-content");
  const nav=document.getElementById("cyberNav");
  if(!content||!nav)return;

  /*
   * One canonical physical page order.
   * The sidebar is the public navigation contract, while these support
   * sections are deliberately placed beside the feature they support.
   * Nothing is allowed to appear after PUBLIC AI except the site footer.
   */
  const pageOrder=[
    "dashboard",
    "stats",
    "knowledge-hub",
    "scale",
    "networking",
    "network-academy",
    "recon-overview",
    "recon-workflow",
    "recon-toolkit",
    "recon-queries",
    "recon-evidence",
    "recon-learning",
    "commands",
    "shortcuts",
    "frameworks",
    "osint",
    "detection",
    "teams",
    "formulas",
    "simulation",
    "games",
    "subnet",
    "labs",
    "glossary",
    "graph",
    "learning",
    "terminal",
    "operator",
    "ai-agent"
  ];

  const byId=new Map();
  for(const el of [...content.children]){
    if(!el.id)continue;
    if(!byId.has(el.id))byId.set(el.id,el);
    else el.remove();
  }

  const used=new Set();
  for(const id of pageOrder){
    const el=byId.get(id);
    if(el){
      content.appendChild(el);
      used.add(id);
    }
  }

  /*
   * Preserve any future top-level support block, but keep it BEFORE the
   * terminal/AI tail so PUBLIC AI remains the final navigational section.
   */
  const leftovers=[...content.children].filter(el=>
    el.tagName!=="FOOTER" &&
    el.id &&
    !used.has(el.id)
  );
  const terminal=byId.get("terminal");
  leftovers.forEach(el=>{
    if(terminal)content.insertBefore(el,terminal);
    else content.appendChild(el);
  });

  const footer=[...content.children].find(el=>el.tagName==="FOOTER");
  if(footer)content.appendChild(footer);

  content.classList.add("cyber-nav-synchronized");
});
