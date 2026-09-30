(()=>{"use strict";
const H=window.CYBER_HUB||{},D=window.CYBER_DATA||{};
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const rows=(name,a)=>Array.isArray(a)?a.map(x=>({domain:name,value:x})):[];

/* Canonical relationships make common lookups useful even when a catalog record is brief. */
const REL=[
 {key:"tcp",title:"TCP",summary:"Transmission Control Protocol: a connection-oriented transport protocol.",related:["TCP/IP Transport Layer","OSI Layer 4","ports","TCP flags","TCP states","packet analysis","Wireshark","ss","tcpdump","Nmap"],docs:["https://www.rfc-editor.org/rfc/rfc9293"]},
 {key:"443",title:"443",summary:"The conventional HTTPS service port; HTTPS commonly uses TCP with TLS, while HTTP/3 uses QUIC over UDP.",related:["HTTPS","TCP","TLS","certificates","web servers","OSI Layer 4","OSI Layer 7","packet analysis","Wireshark","OpenSSL","curl"],docs:["https://www.rfc-editor.org/rfc/rfc9110","https://www.rfc-editor.org/rfc/rfc9000"]},
 {key:"wireshark",title:"Wireshark",summary:"A packet-analysis application used to capture or inspect network traffic in authorised environments.",related:["packet analysis","protocols","TCP","UDP","display filters","pcap","network layers","incident response"],docs:["https://www.wireshark.org/docs/"]},
 {key:"https",title:"HTTPS",summary:"HTTP protected by TLS for confidentiality, integrity and authenticated server communication.",related:["443","HTTP","TCP","TLS","certificates","web servers","OSI Layer 7"],docs:["https://www.rfc-editor.org/rfc/rfc9110"]},
 {key:"osi",title:"OSI Model",summary:"Seven-layer reference model used to reason about network functions and protocols.",related:["TCP/IP Model","Layer 1","Layer 2","Layer 3","Layer 4","Layer 5","Layer 6","Layer 7"],docs:["https://www.iso.org/standard/14256.html"]},
 {key:"tcp/ip",title:"TCP/IP Model",summary:"Four-layer Internet networking model covering application, transport, internet and network-access functions.",related:["TCP","IP","OSI Model","HTTP","DNS","Ethernet"],docs:["https://pingmynetwork.com/network/ccna-200-301/what-is-tcp-ip-model-in-networking"]},
 {key:"dns",title:"DNS",summary:"The Domain Name System maps names to network information and uses UDP and TCP depending on the operation.",related:["53","UDP","TCP","records","dig","nslookup","DNS security"],docs:["https://www.rfc-editor.org/rfc/rfc1034"]},
 {key:"powershell",title:"PowerShell",summary:"Windows automation and administration shell with security investigation capabilities.",related:["Windows","processes","services","event logs","scheduled tasks","Get-WinEvent","Get-NetTCPConnection"],docs:["https://learn.microsoft.com/powershell/"]},
 {key:"nist csf",title:"NIST CSF 2.0",summary:"A cybersecurity risk-management framework organized around Govern, Identify, Protect, Detect, Respond and Recover.",related:["Govern","Identify","Protect","Detect","Respond","Recover","risk management"],docs:["https://www.nist.gov/cyberframework"]}
];

function catalogHits(q){
 const sets=[
  ...rows("network tool",H.networkTools),
  ...rows("port/protocol",H.protocols),
  ...rows("Windows command",H.windowsCommands),
  ...rows("Linux command",H.linuxCommands),
  ...rows("shortcut",H.shortcuts),
  ...rows("power trick",H.powerTricks),
  ...rows("detection",H.suspicious),
  ...rows("hacker type",H.hackerTypes),
  ...rows("security team",H.teams),
  ...rows("platform",H.platforms),
  ...rows("electronics",H.electronics),
  ...rows("documentation",H.docs),
  ...rows("model",H.models)
 ];
 return sets.filter(x=>JSON.stringify(x.value).toLowerCase().includes(q)).slice(0,40);
}
function direct(q){return REL.filter(x=>x.key===q||x.title.toLowerCase()===q||x.title.toLowerCase().includes(q)||q.includes(x.key)).slice(0,4)}
function render(q){
 const box=document.getElementById("knowledgeResult"); if(!box)return;
 if(!q){box.innerHTML='<div class="detail-panel"><h3>Connected knowledge search</h3><p>Try TCP, 443, Wireshark, HTTPS, DNS, OSI, TCP/IP, PowerShell or NIST CSF 2.0.</p></div>';return;}
 const directHits=direct(q),hits=catalogHits(q);
 let html="";
 directHits.forEach(x=>{html+='<article class="knowledge-focus"><div><span class="tag">CONNECTED CONCEPT</span><h2>'+esc(x.title)+'</h2><p>'+esc(x.summary)+'</p><div class="chips">'+x.related.map(r=>'<button data-query="'+esc(r)+'">'+esc(r)+'</button>').join("")+'</div><div class="knowledge-links">'+x.docs.map(u=>'<a href="'+esc(u)+'" target="_blank" rel="noopener">DOCUMENTATION ↗</a>').join(" ")+'</div></div></article>';});
 if(hits.length) html+='<div class="knowledge-subgrid">'+hits.map(x=>'<article class="cyber-card"><span class="tag">'+esc(x.domain.toUpperCase())+'</span><h3>'+esc(Array.isArray(x.value)?x.value[0]:x.value.name||x.value.title||"Record")+'</h3><p>'+esc(Array.isArray(x.value)?x.value.slice(1).join(" · "):x.value.summary||"")+'</p></article>').join("")+'</div>';
 if(!html)html='<div class="detail-panel"><h3>No direct match yet</h3><p>Search the knowledge hub for a broader term, or add a source-backed record to the data catalog.</p></div>';
 box.innerHTML=html;
 box.querySelectorAll("[data-query]").forEach(b=>b.onclick=()=>{const q=b.dataset.query;document.getElementById("globalSearch").value=q;render(q.toLowerCase());document.getElementById("knowledge-hub").scrollIntoView({behavior:"smooth"});});
}
async function loadIana(){try{const r=await fetch("data/ports/iana-service-names.json",{cache:"no-store"});if(!r.ok)return;const pack=await r.json();if(Array.isArray(pack.records)){H.protocols=[...(H.protocols||[]),...pack.records.map(x=>[x.name,x.port,x.transport.toUpperCase(),"IANA",x.summary])];}}catch(e){}}\ndocument.addEventListener("DOMContentLoaded",async()=>{
 const s=document.getElementById("globalSearch"),box=document.getElementById("knowledgeResult");
 if(!s||!box)return;
 s.addEventListener("input",()=>{const q=s.value.trim().toLowerCase();render(q);});\n loadIana().then(()=>render(s.value.trim().toLowerCase()));
 s.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();render(s.value.trim().toLowerCase());document.getElementById("knowledgeResult").scrollIntoView({behavior:"smooth"});}});
 render("");
});
})();