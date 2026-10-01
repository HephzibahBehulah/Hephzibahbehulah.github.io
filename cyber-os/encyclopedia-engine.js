(()=>{"use strict";
const E=window.CYBER_ENCYCLOPEDIA||{};
const H=window.CYBER_HUB||{};
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const norm=s=>String(s??"").toLowerCase().trim();
const arr=v=>Array.isArray(v)?v:[];
function cardTitle(x){
 if(Array.isArray(x))return String(x[0]??x[1]??"Record");
 return String(x?.name??x?.title??x?.command??x?.keys??"Record");
}
function cardSummary(x){
 if(Array.isArray(x))return x.slice(1).filter(Boolean).join(" · ");
 return String(x?.summary??x?.purpose??x?.description??"");
}
function allCatalogs(){
 const out=[];
 const add=(type,items)=>arr(items).forEach(x=>out.push({type,name:cardTitle(x),data:x}));
 add("Network tool",H.networkTools);add("Protocol",H.protocols);add("Windows command",H.windowsCommands);
 add("PowerShell",H.powershell);add("Linux command",H.linuxCommands);add("Shortcut",H.shortcuts);
 add("Power trick",H.powerTricks);add("Detection",H.suspicious);add("Hacker / actor",H.hackerTypes);
 add("Security team",H.teams);add("Platform",H.platforms);add("Engineering",H.electronics);add("Formula",H.formulas);
 add("Documentation",H.docs);add("Model",H.models);
 return out;
}
function known(q){
 const n=norm(q); if(!n)return null;
 const exact=[...arr(E.commandProfiles).map(x=>({kind:"command",name:x[0],data:x})),...arr(E.concepts).map(x=>({kind:"concept",name:x.name,data:x})),...arr(E.domains).map(x=>({kind:"domain",name:x[0],data:x})),...arr(E.models).map(x=>({kind:"model",name:x.name,data:x})),...arr(E.frameworks).map(x=>({kind:"framework",name:x.name,data:x})),...arr(E.securityTeams).map(x=>({kind:"team",name:x[0],data:x})),...arr(E.platforms).map(x=>({kind:"platform",name:x[1],data:x})),...arr(E.coreSources).map(x=>({kind:"source",name:x[0],data:x}))];
 const hit=exact.find(x=>norm(x.name)===n||norm(x.name).includes(n)||n.includes(norm(x.name)));
 if(hit)return hit;
 const c=allCatalogs().find(x=>norm(x.name)===n||norm(x.name).includes(n)||n.includes(norm(x.name)));
 if(c)return {kind:"catalog",name:c.name,data:c.data,catalogType:c.type};
 return null;
}
function search(q){
 const n=norm(q); if(!n)return [];
 const out=[];
 const push=(kind,name,data,score)=>out.push({kind,name,data,score});
 arr(E.commandProfiles).forEach(x=>{const h=JSON.stringify(x).toLowerCase();if(h.includes(n))push("command",x[0],x,125);});
 arr(E.concepts).forEach(x=>{const h=JSON.stringify(x).toLowerCase();if(h.includes(n))push("concept",x.name,x,120);});
 arr(E.domains).forEach(x=>{const h=(x[0]+" "+x[1]+" "+x[2]).toLowerCase();if(h.includes(n))push("domain",x[0],x,100);});
 arr(E.models).forEach(x=>{const h=JSON.stringify(x).toLowerCase();if(h.includes(n))push("model",x.name,x,100);});
 arr(E.frameworks).forEach(x=>{const h=JSON.stringify(x).toLowerCase();if(h.includes(n))push("framework",x.name,x,100);});
 arr(E.securityTeams).forEach(x=>{if(JSON.stringify(x).toLowerCase().includes(n))push("team",x[0],x,80);});
 arr(E.platforms).forEach(x=>{if(JSON.stringify(x).toLowerCase().includes(n))push("platform",x[1],x,70);});
 allCatalogs().forEach(x=>{if(JSON.stringify(x.data).toLowerCase().includes(n))push(x.type,x.name,x.data,60);});
 return [...new Map(out.map(x=>[x.kind+"|"+x.name,x])).values()].sort((a,b)=>b.score-a.score).slice(0,30);
}
function section(title,content){
 if(!content||!String(content).trim())return "";
 const body=Array.isArray(content)?content.map(v=>"<span>"+esc(v)+"</span>").join(""):"<p>"+esc(content)+"</p>";
 return "<section><h4>"+esc(title)+"</h4><div class="ency-values">"+body+"</div></section>";
}
function article(hit,related){
 const x=hit.data;
 let title=hit.name,summary="",sections="",source="",url="";
 if(hit.kind==="command"){title=x[0];summary=x[2];sections+=section("PLATFORM",x[1])+section("WHAT IT DOES",x[2])+section("EXAMPLE",x[3])+section("OUTPUT",x[4])+section("CROSS-PLATFORM EQUIVALENTS",x[5]);}
 else if(hit.kind==="concept"){title=x.name;summary=x.summary;sections+=section("LAYERS",x.layers)+section("PORTS / SERVICES",x.ports)+section("RELATED CONCEPTS",x.related)+section("SECURITY NOTES",x.security);source=x.source;url=x.url;}
 else if(hit.kind==="domain"){title=x[0];summary=x[1];sections+=section("WHAT THIS COVERS",x[1])+section("KNOWLEDGE AREA",x[2]);}
 else if(hit.kind==="model"){summary=x.summary;sections+=section("LAYERS",x.layers)+section("EXAMPLES",x.examples);source=x.source;url=x.url;}
 else if(hit.kind==="framework"){summary=x.summary;sections+=section("FUNCTIONS / AREAS",x.functions)+section("HOW TO USE",x.use);source=x.source;url=x.url;}
 else if(hit.kind==="team"){summary=x[1];sections+=section("ROLE",x[1])+section("TYPICAL OUTPUTS / TECHNOLOGY",x[2]);}
 else if(hit.kind==="platform"){summary=x[2];sections+=section("PLATFORM",x[0])+section("SECURITY SURFACE",x[2]);}
 else if(hit.kind==="source"){summary=x[2];source=x[0];url=x[1];sections+=section("SOURCE ROLE",x[2]);}
 else if(hit.kind==="catalog"){summary=cardSummary(x);sections+=section("DETAILS",Array.isArray(x)?x.slice(1):[x.purpose||x.summary,x.syntax,...(x.examples||[]),...(x.security_notes||[])]);}
 const rel=related.filter(r=>r!==hit).slice(0,12);
 const relatedHtml=rel.length?'<section><h4>RELATED KNOWLEDGE</h4><div class="ency-related">'+rel.map(r=>'<button data-ency-query="'+esc(r.name)+'">'+esc(r.name)+'</button>').join("")+'</div></section>':"";
 return '<article class="ency-focus"><div class="ency-head"><span class="tag">'+esc(hit.kind.toUpperCase())+' · HUMAN-READABLE KNOWLEDGE PAGE</span><h2>'+esc(title)+'</h2><p>'+esc(summary)+'</p></div><div class="ency-sections">'+sections+relatedHtml+'</div>'+(url?'<div class="knowledge-links"><a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(source||"SOURCE")+' ↗</a></div>':"")+'</article>';
}
function render(q,targetId="knowledgeResult"){
 const box=document.getElementById(targetId); if(!box)return false;
 const n=norm(q); if(!n)return false;
 const results=search(n); if(!results.length)return false;
 const primary=results[0], related=results.slice(1,16);
 box.innerHTML=article(primary,related);
 box.querySelectorAll("[data-ency-query]").forEach(b=>b.onclick=()=>{const input=document.getElementById("globalSearch");if(input)input.value=b.dataset.encyQuery;render(b.dataset.encyQuery,targetId);box.scrollIntoView({behavior:"smooth",block:"start"});});
 return true;
}
function renderLanding(targetId="knowledgeResult"){
 const box=document.getElementById(targetId);if(!box)return;
 box.innerHTML='<article class="ency-focus"><div class="ency-head"><span class="tag">CYBERSECURITY ENCYCLOPEDIA</span><h2>Search → Understand → Connect → Copy → Practice</h2><p>'+esc(E.mission)+'</p></div><div class="ency-sections">'+section("KNOWLEDGE FLOW",E.flow)+section("MAJOR DOMAINS",E.domains.map(x=>x[0]+" — "+x[1]))+section("SECURITY LIFECYCLE",E.lifecycle.map(x=>x[0]+" — "+x[1]))+'</div></article>';
}
window.CYBER_ENCYCLOPEDIA={...E,search,known,render,renderLanding};
})();