(()=>{"use strict";
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const val=(x,k,f="Not specified")=>x[k]||f;
const norm=s=>String(s??"").toLowerCase().replace(/[^a-z0-9]+/g,"");
const aliases={
 "nmap":["network mapper","port scanner"],
 "burpsuite":["burp suite","burp","burpsuite community","burpsuite professional"],
 "metasploit":["metaploits","metaploit","metaspoit","msfconsole","metasploit framework"],
 "owaspzap":["zap","zaproxy","owasp zap"],
 "wireshark":["wire shark"],
 "sqlmap":["sql map"],
 "kali linux":["kali"]
};
const guides={
 nmap:{title:"Nmap · WSL / Linux",install:"Ubuntu, Debian or Kali: sudo apt update && sudo apt install -y nmap",launch:"nmap --version",example:"nmap -sV <your-authorised-lab-host>",note:"Replace the placeholder only with a host inside your written test scope."},
 metasploit:{title:"Metasploit Framework · WSL / Linux",install:"Kali Linux: sudo apt update && sudo apt install -y metasploit-framework",launch:"msfconsole",example:"msfconsole -q",note:"The package is primarily available from Kali repositories; do not assume it exists in standard Ubuntu repositories. Use an isolated lab for exercises."},
 burpsuite:{title:"Burp Suite · WSL / Linux",install:"Kali Linux: sudo apt update && sudo apt install -y burpsuite. Ubuntu/other Linux: download the Linux installer from PortSwigger's official website.",launch:"burpsuite",example:"burpsuite",note:"Burp Suite is a graphical application. WSL needs WSLg or another working Linux GUI/display. If the command is not found, launch the installed application from its desktop menu or use the official installer path."},
 wireshark:{title:"Wireshark · WSL / Linux",install:"Ubuntu/Debian/Kali: sudo apt update && sudo apt install -y wireshark",launch:"wireshark",example:"wireshark",note:"A GUI/display is required. Packet capture permissions vary by distribution; capture only traffic you are authorised to monitor."},
 owaspzap:{title:"OWASP ZAP · WSL / Linux",install:"Use the official ZAP Linux installer/package instructions; package availability varies by distribution.",launch:"zaproxy",example:"zaproxy",note:"ZAP is graphical by default. WSL needs WSLg or another working display. Start with passive analysis and use only authorised targets."},
 sqlmap:{title:"sqlmap · WSL / Linux",install:"Ubuntu/Debian/Kali: sudo apt update && sudo apt install -y sqlmap",launch:"sqlmap --help",example:"sqlmap -u 'https://your-authorised-lab.example/item?id=1' --batch --risk=1 --level=1",note:"Use a deliberately vulnerable lab or an explicitly authorised application. Do not test public targets without permission."}
};
const quick=[
 ["Recon","subfinder -h"],["Asset map","amass -h"],["HTTP probe","httpx -h"],["Network scan","nmap -h"],
 ["Template scanner","nuclei -h"],["Web proxy","burpsuite"],["ZAP","zaproxy"],["SQL testing help","sqlmap --help"],
 ["Metasploit","msfconsole"],["AD assessment help","nxc --help"],["Reverse engineering","ghidraRun"],
 ["Binary analysis","r2 -h"],["Password audit help","john --help"],["Hashcat help","hashcat --help"],
 ["Forensics","autopsy"],["Memory forensics","vol -h"],["Container scan","trivy --help"],
 ["Kubernetes audit","kube-bench --help"],["Network defense","suricata -V"],["Endpoint hunting","osqueryi --help"]
];
function initFilters(all){
 const select=document.getElementById("cybersecurityToolsAcademyCategory");
 const nav=document.getElementById("cybersecurityToolsAcademyCategoryNav");
 const categories=[...new Set(all.map(x=>x.category||"Other tools"))].sort((a,b)=>a.localeCompare(b));
 if(select&&all.length&&!select.dataset.populated){
  select.innerHTML='<option value="all">All categories ('+all.length+' tools)</option>'+categories.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  select.dataset.populated="1";
 }
 if(nav&&all.length&&!nav.dataset.populated){
  nav.innerHTML='<button type="button" data-category="all">All categories</button>'+categories.map(c=>'<button type="button" data-category="'+esc(c)+'">'+esc(c)+'</button>').join("");
  nav.dataset.populated="1";
  nav.addEventListener("click",e=>{const b=e.target.closest("button[data-category]");if(!b)return;const f=document.getElementById("cybersecurityToolsAcademyCategory");if(f){f.value=b.dataset.category;render()}});
 }
 const quickRoot=document.getElementById("cyberOsQuickLaunch");
 if(quickRoot&&!quickRoot.dataset.populated){
  quickRoot.innerHTML=quick.map(([label,cmd])=>'<button type="button" data-command="'+esc(cmd)+'" title="Copy command reference">'+esc(label)+'</button>').join("");
  quickRoot.dataset.populated="1";
  quickRoot.addEventListener("click",async e=>{
   const b=e.target.closest("button[data-command]");if(!b)return;
   const command=b.dataset.command;
   try{await navigator.clipboard.writeText(command);const old=quick.find(x=>x[1]===command)?.[0]||command;b.textContent="COPIED: "+command;setTimeout(()=>b.textContent=old,1400)}
   catch{window.prompt("Copy this command reference. It will not be executed by Cyber-OS:",command)}
  });
 }
}
function searchScore(tool,query){
 const q=norm(query);if(!q)return 1;
 const name=norm(tool.name),sub=norm(tool.subcategory),category=norm(tool.category);
 const known=(aliases[name]||[]).map(norm);
 if(name===q||known.includes(q))return 100;
 if(name.startsWith(q)||known.some(a=>a.startsWith(q)))return 80;
 const all=norm([tool.name,tool.category,tool.subcategory,tool.description,tool.purpose,tool.install,tool.launchCommand,tool.example,...(tool.tags||[]),...(tool.platforms||[])].join(" "));
 if(all.includes(q))return 50;
 if(sub.includes(q)||category.includes(q))return 40;
 // Catch small misspellings of tool names without matching unrelated descriptions.
 if(q.length>=5&&q.length<=18){
  const d=levenshtein(q,name);
  if(d<=2||known.some(a=>levenshtein(q,a)<=2))return 30-Math.min(d,...known.map(a=>levenshtein(q,a)));
 }
 return 0;
}
function levenshtein(a,b){
 const row=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let prev=row[0];row[0]=i;
  for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}
 }
 return row[b.length];
}
function guideFor(tool){
 const name=norm(tool.name);
 for(const key of Object.keys(guides))if(name===key||name.includes(key))return guides[key];
 const raw=String(tool.launchCommand||tool.example||"").trim();
 const command=raw.split(/[\s(]/)[0];
 const safeCommand=/^[a-zA-Z0-9._+-]+$/.test(command)?command:"";
 return {title:"WSL / Linux quick start",install:tool.install||"Follow the official installation instructions linked on this tool card.",launch:raw||"Open the tool using its installed application or documented command.",example:safeCommand?safeCommand+" --help":"Check the official documentation for a safe first-run command.",note:"Open your WSL distribution or Linux terminal first. If the command is not found, the tool may not be installed or may not be on PATH. GUI tools also require a working desktop/display."};
}
function jumpToFirstResult(){
 const root=document.getElementById("cybersecurityToolsAcademyGrid");
 const cards=[...(root?.querySelectorAll(".cybersecurity-tool-card")||[])];
 const card=cards.sort((a,b)=>Number(b.dataset.searchScore||0)-Number(a.dataset.searchScore||0))[0];
 if(card){card.scrollIntoView({behavior:"smooth",block:"start"});card.setAttribute("tabindex","-1");card.focus({preventScroll:true});}
 else root?.scrollIntoView({behavior:"smooth",block:"start"});
}
function render(){
 const root=document.getElementById("cybersecurityToolsAcademyGrid");if(!root)return;
 const H=window.CYBER_HUB||{},all=Array.isArray(H.cybersecurityTools)?H.cybersecurityTools:[];
 initFilters(all);
 const input=document.getElementById("cybersecurityToolsAcademySearch");
 const categorySelect=document.getElementById("cybersecurityToolsAcademyCategory");
 const platformSelect=document.getElementById("cybersecurityToolsAcademyPlatform");
 const query=String(input?.value||"").trim(),category=String(categorySelect?.value||"all"),platform=String(platformSelect?.value||"all");
 const records=all.map(x=>({...x,_score:searchScore(x,query)})).filter(x=>
  (!query||x._score>0)&&(category==="all"||x.category===category)&&
  (platform==="all"||(Array.isArray(x.platforms)&&x.platforms.some(p=>p.toLowerCase().includes(platform.toLowerCase())))||
   (platform==="WSL"&&Array.isArray(x.platforms)&&x.platforms.some(p=>["linux","windows"].includes(p.toLowerCase()))))
 ).sort((a,b)=>b._score-a._score||String(a.name).localeCompare(String(b.name)));
 const count=document.getElementById("cybersecurityToolsAcademyCount");
 if(count)count.textContent=records.length+" MATCHING · "+all.length+" CATALOGUED";
 const groups=new Map();
 records.forEach(x=>{const c=x.category||"Other tools";if(!groups.has(c))groups.set(c,[]);groups.get(c).push(x)});
 root.innerHTML=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,items])=>
  '<section class="tool-category-group"><div class="tool-category-heading"><h3>'+esc(cat)+'</h3><span>'+items.length+' TOOLS</span></div><div class="tool-record-grid">'+items.map(x=>{
   const cmd=val(x,"launchCommand",val(x,"example","See official documentation")),docs=String(x.sourceUrl||x.documentation||""),tags=Array.isArray(x.tags)?x.tags:[];
   const id="tool-"+norm(x.name);
   const g=guideFor(x);
   return '<article id="'+esc(id)+'" class="cyber-card cybersecurity-tool-card" data-search-score="'+esc(x._score||0)+'" data-tool-name="'+esc(x.name||"")+'">'+
    '<div class="tool-card-top"><span class="tag">'+esc(x.subcategory||cat)+'</span><span class="tool-level">'+esc(val(x,"difficulty","All levels"))+'</span></div>'+
    '<h4>'+esc(x.name||"Security tool")+'</h4><p>'+esc(x.description||x.purpose||x.summary||"Purpose not supplied.")+'</p>'+
    '<div class="tool-field"><span>PURPOSE</span><p>'+esc(val(x,"purpose","See the project documentation for intended use."))+'</p></div>'+
    '<div class="tool-field"><span>PLATFORMS</span><div class="chips">'+(Array.isArray(x.platforms)?x.platforms:[]).map(p=>'<span>'+esc(p)+'</span>').join("")+'</div></div>'+
    '<div class="tool-field"><span>INSTALLATION / SETUP</span><p>'+esc(val(x,"install","Use the official installation guide; package names vary by OS and release."))+'</p></div>'+
    '<div class="tool-field"><span>LAUNCH / QUICK REFERENCE</span><code class="tool-command">'+esc(cmd)+'</code>'+(x.example&&x.example!==cmd?'<p class="tool-example"><b>Example / note:</b> '+esc(x.example)+'</p>':"")+'</div>'+
    '<div class="tool-field tool-environment-guide"><span>'+esc(g.title.toUpperCase())+'</span><p><b>Install:</b> '+esc(g.install)+'</p><code class="tool-command">'+esc(g.launch)+'</code><p class="tool-example"><b>Example:</b> '+esc(g.example)+'</p><p class="academy-note">'+esc(g.note)+'</p></div>'+
    '<div class="tool-field"><span>SAFE USE</span><p>'+esc(val(x,"safeUse","Use only in an authorised environment."))+'</p></div>'+
    '<div class="tool-meta"><span>Licence: '+esc(val(x,"license","Check official terms"))+'</span>'+(tags.length?'<span>'+tags.map(esc).join(" · ")+'</span>':"")+'</div>'+
    (docs.startsWith("https://")||docs.startsWith("http://")?'<a class="os-btn tool-doc-link" href="'+esc(docs)+'" target="_blank" rel="noopener noreferrer">OFFICIAL DOCUMENTATION ↗</a>':"")+
   '</article>';
  }).join("")+'</div></section>'
 ).join("")||'<div class="detail-panel">No tools match this search or filter. Try a shorter name such as “burp”, “metasploit”, or “nmap”, or clear the filters.</div>';
}
function runSearchAndJump(){
 const academy=document.getElementById("cybersecurity-tools-academy");
 const input=document.getElementById("cybersecurityToolsAcademySearch");
 if(!input)return;
 const global=document.getElementById("globalSearch");
 if(global&&document.activeElement===global)input.value=global.value;
 render();
 academy?.scrollIntoView({behavior:"smooth",block:"start"});
 setTimeout(jumpToFirstResult,180);
}
function boot(){
 ["cybersecurityToolsAcademySearch","cybersecurityToolsAcademyCategory","cybersecurityToolsAcademyPlatform"].forEach(id=>{
  const el=document.getElementById(id);if(el&&!el.dataset.bound){el.dataset.bound="1";el.addEventListener("input",render);el.addEventListener("change",render);if(id==="cybersecurityToolsAcademySearch")el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runSearchAndJump()}});}
 });
 const global=document.getElementById("globalSearch"),academyInput=document.getElementById("cybersecurityToolsAcademySearch");
 if(global&&academyInput&&!global.dataset.academyBound){
  global.dataset.academyBound="1";global.placeholder="Search tools: Burp Suite, Metasploit, Nmap…";
  global.setAttribute("aria-label","Search Cybersecurity Tools Academy");
  global.addEventListener("input",()=>{academyInput.value=global.value;render();if(global.value.trim())document.getElementById("cybersecurity-tools-academy")?.scrollIntoView({behavior:"smooth",block:"start"});});
  global.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runSearchAndJump()}});
 }
 render();
}
document.addEventListener("DOMContentLoaded",boot);
document.addEventListener("cyber:catalogs-loaded",boot);
window.addEventListener("load",boot);
})();