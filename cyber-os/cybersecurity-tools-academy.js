(()=>{"use strict";
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const val=(x,k,f="Not specified")=>x[k]||f;
function render(){
 const root=document.getElementById("cybersecurityToolsAcademyGrid");
 if(!root)return;
 const H=window.CYBER_HUB||{};
 const all=Array.isArray(H.cybersecurityTools)?H.cybersecurityTools:[];
 const input=document.getElementById("cybersecurityToolsAcademySearch");
 const categorySelect=document.getElementById("cybersecurityToolsAcademyCategory");
 const platformSelect=document.getElementById("cybersecurityToolsAcademyPlatform");
 const query=String(input?.value||"").trim().toLowerCase();
 const category=String(categorySelect?.value||"all");
 const platform=String(platformSelect?.value||"all");
 const records=all.filter(x=>{
  const text=JSON.stringify(x).toLowerCase();
  return (!query||text.includes(query))&&
   (category==="all"||x.category===category)&&
   (platform==="all"||(Array.isArray(x.platforms)&&x.platforms.some(p=>p.toLowerCase().includes(platform.toLowerCase()))));
 });
 const count=document.getElementById("cybersecurityToolsAcademyCount");
 if(count)count.textContent=records.length+" MATCHING · "+all.length+" CATALOGUED";
 const groups=new Map();
 records.forEach(x=>{const c=x.category||"Other tools";if(!groups.has(c))groups.set(c,[]);groups.get(c).push(x)});
 root.innerHTML=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,items])=>
  '<section class="tool-category-group"><div class="tool-category-heading"><h3>'+esc(cat)+'</h3><span>'+items.length+' TOOLS</span></div><div class="tool-record-grid">'+items.map(x=>{
   const cmd=val(x,"launchCommand",val(x,"example","See official documentation"));
   const docs=String(x.sourceUrl||x.documentation||"");
   const tags=Array.isArray(x.tags)?x.tags:[];
   return '<article class="cyber-card cybersecurity-tool-card">'+
    '<div class="tool-card-top"><span class="tag">'+esc(x.subcategory||cat)+'</span><span class="tool-level">'+esc(val(x,"difficulty","All levels"))+'</span></div>'+
    '<h4>'+esc(x.name||"Security tool")+'</h4><p>'+esc(x.description||x.purpose||x.summary||"Purpose not supplied.")+'</p>'+
    '<div class="tool-field"><span>PURPOSE</span><p>'+esc(val(x,"purpose","See the project documentation for intended use."))+'</p></div>'+
    '<div class="tool-field"><span>PLATFORMS</span><div class="chips">'+(Array.isArray(x.platforms)?x.platforms:[]).map(p=>'<span>'+esc(p)+'</span>').join("")+'</div></div>'+
    '<div class="tool-field"><span>INSTALLATION / SETUP</span><p>'+esc(val(x,"install","Use the official installation guide; package names vary by OS and release."))+'</p></div>'+
    '<div class="tool-field"><span>LAUNCH / QUICK REFERENCE</span><code class="tool-command">'+esc(cmd)+'</code>'+
    (x.example&&x.example!==cmd?'<p class="tool-example"><b>Example / note:</b> '+esc(x.example)+'</p>':"")+'</div>'+
    '<div class="tool-field"><span>SAFE USE</span><p>'+esc(val(x,"safeUse","Use only in an authorised environment."))+'</p></div>'+
    '<div class="tool-meta"><span>Licence: '+esc(val(x,"license","Check official terms"))+'</span>'+(tags.length?'<span>'+tags.map(esc).join(" · ")+'</span>':"")+'</div>'+
    (docs.startsWith("https://")||docs.startsWith("http://")?'<a class="os-btn tool-doc-link" href="'+esc(docs)+'" target="_blank" rel="noopener noreferrer">OFFICIAL DOCUMENTATION ↗</a>':"")+
   '</article>';
  }).join("")+'</div></section>'
 ).join("")||'<div class="detail-panel">No tools match these filters. Clear the search or select “All categories” and “All platforms”.</div>';
}
function boot(){
 ["cybersecurityToolsAcademySearch","cybersecurityToolsAcademyCategory","cybersecurityToolsAcademyPlatform"].forEach(id=>{
  const el=document.getElementById(id);if(el&&!el.dataset.bound){el.dataset.bound="1";el.addEventListener("input",render);el.addEventListener("change",render)}
 });
 render();
}
document.addEventListener("DOMContentLoaded",boot);
document.addEventListener("cyber:catalogs-loaded",boot);
window.addEventListener("load",boot);
})();
