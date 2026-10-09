(()=>{"use strict";
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function render(){
 const root=document.getElementById("cybersecurityToolsAcademyGrid");
 if(!root)return;
 const H=window.CYBER_HUB||{};
 const all=Array.isArray(H.cybersecurityTools)?H.cybersecurityTools:[];
 const input=document.getElementById("cybersecurityToolsAcademySearch");
 const query=String(input?.value||"").trim().toLowerCase();
 const records=all.filter(x=>!query||JSON.stringify(x).toLowerCase().includes(query));
 const count=document.getElementById("cybersecurityToolsAcademyCount");
 if(count)count.textContent=all.length?records.length+" OF "+all.length+" TOOLS AVAILABLE": "LOADING TOOL CATALOGUE…";
 root.innerHTML=records.map(x=>'<article class="cyber-card cybersecurity-tool-card"><span class="tag">'+esc(x.category||"SECURITY TOOL")+'</span><h3>'+esc(x.name||"Security tool")+'</h3><p>'+esc(x.purpose||x.summary||"Purpose not supplied.")+'</p><p><b>Safe use:</b> '+esc(x.safeUse||"Use only in authorised environments.")+'</p><div class="chips">'+(Array.isArray(x.platforms)?x.platforms:[]).map(p=>'<span>'+esc(p)+'</span>').join("")+'</div>'+(String(x.sourceUrl||"").startsWith("https://")?'<a class="os-btn" href="'+esc(x.sourceUrl)+'" target="_blank" rel="noopener noreferrer">OFFICIAL DOCUMENTATION ↗</a>':"")+'</article>').join("")||'<div class="detail-panel">No tools match this search. Try a tool name such as Nmap, Wireshark, Burp Suite or Trivy.</div>';
}
function boot(){
 const input=document.getElementById("cybersecurityToolsAcademySearch");
 if(input&&!input.dataset.bound){input.dataset.bound="1";input.addEventListener("input",render);}
 render();
}
document.addEventListener("DOMContentLoaded",boot);
document.addEventListener("cyber:catalogs-loaded",boot);
window.addEventListener("load",boot);
})();