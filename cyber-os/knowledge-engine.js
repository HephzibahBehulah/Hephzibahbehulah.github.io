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
  ...rows("documentation",H.docs),\n  ...rows("engineering formula",H.formulas),
  ...rows("model",H.models)
 ];
 return sets.filter(x=>JSON.stringify(x.value).toLowerCase().includes(q)).slice(0,40);
}
const TOPICS={
tcp:{definition:"Transmission Control Protocol provides reliable, ordered, connection-oriented byte-stream delivery.",layers:["TCP/IP Transport","OSI Layer 4"],ports:["22 SSH","25 SMTP","80 HTTP","443 HTTPS","445 SMB","3389 RDP"],protocols:["HTTP","HTTPS","SSH","SMTP","IMAP","FTP","SMB","RDP","LDAP","BGP"],flags:["SYN","ACK","FIN","RST","PSH","URG","ECE","CWR"],states:["CLOSED","LISTEN","SYN-SENT","SYN-RECEIVED","ESTABLISHED","FIN-WAIT-1","FIN-WAIT-2","CLOSE-WAIT","LAST-ACK","TIME-WAIT"],commands:["ss -antp","netstat -ano","tcpdump -nn 'tcp'","tshark -Y 'tcp'","Get-NetTCPConnection"],analysis:["TCP three-way handshake","sequence and acknowledgment numbers","retransmissions","resets","window size","TCP stream reconstruction"],risks:["unexpected listeners","exposed management services","cleartext protocols","abnormal connection bursts"],detection:["baseline listeners","correlate PID/process with sockets","review IDS/firewall telemetry","investigate repeated SYN attempts"],tools:["Wireshark","TShark","tcpdump","Nmap","ss","Zeek","Suricata"],labs:["Capture a TCP handshake in an authorised lab","Map a listening port to its owning process","Compare normal and reset-heavy TCP traffic"],games:["Identify TCP flags","Map a TCP port to its application","Choose the correct layer"],docs:["https://www.rfc-editor.org/rfc/rfc9293"]},
443:{definition:"Port 443 is conventionally associated with HTTPS. HTTP/3 uses QUIC over UDP, so a port number alone does not prove the application.",layers:["TCP/IP Transport: TCP for conventional HTTPS","OSI Layer 4: TCP","OSI Layer 7: HTTP"],ports:["443/TCP HTTPS","443/UDP may be used by QUIC/HTTP/3"],protocols:["HTTPS","HTTP/2","HTTP/3","TLS","QUIC"],flags:["TCP SYN/ACK/FIN/RST for TCP transport"],states:["TCP connection states for TCP-based HTTPS","QUIC uses its own connection model over UDP"],commands:["curl -I https://example.com","curl -v https://example.com","openssl s_client -connect example.com:443","ss -antp | grep ':443'","netstat -ano | findstr ':443'"],analysis:["TCP handshake and TLS handshake","certificate chain","SNI","ALPN","HTTP request/response"],risks:["expired or misconfigured certificates","unexpected exposed web service","weak TLS configuration"],detection:["inspect TLS metadata","validate certificate chain and expiry","monitor unexpected listeners on 443","use packet metadata with web logs"],tools:["Wireshark","OpenSSL","curl","Nmap","SSL Labs"],labs:["Inspect a certificate in a controlled test service","Capture and identify a TLS handshake","Compare HTTP and HTTPS metadata"],games:["Map 443 to HTTPS/TLS","Identify transport versus application layers"],docs:["https://www.rfc-editor.org/rfc/rfc9110","https://www.rfc-editor.org/rfc/rfc9000"]},
wireshark:{definition:"Wireshark is a network protocol analyzer used to inspect packet captures and live traffic where authorised.",layers:["Decodes protocols across multiple networking layers"],ports:["Filter by tcp.port, udp.port and protocol-specific fields"],protocols:["Ethernet","ARP","IPv4","IPv6","TCP","UDP","DNS","HTTP","TLS","DHCP"],flags:["tcp.flags.syn","tcp.flags.ack","tcp.flags.fin","tcp.flags.reset"],states:["Follow TCP Stream","TCP analysis fields","Expert Information"],commands:["wireshark","tshark -D","tshark -Y 'tcp'","tshark -Y 'tcp.port==443'"],analysis:["pcap/pcapng","display filters","protocol tree","packet bytes","stream reconstruction"],risks:["misinterpreting encrypted payloads","capturing sensitive data without authorisation"],detection:["filter relevant traffic","correlate timestamps with host logs","compare endpoints and ports","preserve capture provenance"],tools:["Wireshark","TShark","tcpdump","Zeek","Suricata"],labs:["Open a provided training PCAP","Filter for TCP handshakes","Follow an authorised TCP stream","Identify DNS and TLS metadata"],games:["Write a display filter for TCP port 443","Identify the transport protocol","Find the SYN packet"],docs:["https://www.wireshark.org/docs/"]}}
function direct(q){return REL.filter(x=>x.key===q||x.title.toLowerCase()===q||x.title.toLowerCase().includes(q)||q.includes(x.key)).slice(0,4)}
function render(q){
 const box=document.getElementById("knowledgeResult"); if(!box)return;
 if(!q){box.innerHTML='<div class="detail-panel"><h3>Connected knowledge search</h3><p>Try TCP, 443, Wireshark, HTTPS, DNS, OSI, TCP/IP, PowerShell or NIST CSF 2.0.</p></div>';return;}
 const directHits=direct(q),hits=catalogHits(q);
 let html="";
 directHits.forEach(x=>{const t=TOPICS[x.key]||TOPICS[x.title.toLowerCase()];html+='<article class="knowledge-focus"><div><span class="tag">CONNECTED CONCEPT</span><h2>'+esc(x.title)+'</h2><p>'+esc(x.summary)+'</p><div class="chips">'+x.related.map(r=>'<button data-query="'+esc(r)+'">'+esc(r)+'</button>').join("")+'</div>'+(t?'<div class="topic-sections">'+["definition","layers","ports","protocols","flags","states","commands","analysis","risks","detection","tools","labs","games"].filter(k=>t[k]).map(k=>'<section><h4>'+esc(k.toUpperCase())+'</h4><p>'+t[k].map(v=>'<span>'+esc(v)+'</span>').join("")+'</p></section>').join("")+'</div>':'')+'<div class="knowledge-links">'+x.docs.map(u=>'<a href="'+esc(u)+'" target="_blank" rel="noopener">DOCUMENTATION ↗</a>').join(" ")+'</div></div></article>';});
if(hits.length) html+='<div class="knowledge-subgrid">'+hits.map(x=>'<article class="cyber-card"><span class="tag">'+esc(x.domain.toUpperCase())+'</span><h3>'+esc(Array.isArray(x.value)?x.value[0]:x.value.name||x.value.title||"Record")+'</h3><p>'+esc(Array.isArray(x.value)?x.value.slice(1).join(" · "):x.value.summary||"")+'</p></article>').join("")+'</div>';
 if(!html)html='<div class="detail-panel"><h3>No direct match yet</h3><p>Search the knowledge hub for a broader term, or add a source-backed record to the data catalog.</p></div>';
 box.innerHTML=html;
 box.querySelectorAll("[data-query]").forEach(b=>b.onclick=()=>{const q=b.dataset.query;document.getElementById("globalSearch").value=q;render(q.toLowerCase());document.getElementById("knowledge-hub").scrollIntoView({behavior:"smooth"});});
}
async function loadIana(){try{const r=await fetch("data/ports/iana-service-names.json",{cache:"no-store"});if(r.ok){const pack=await r.json();if(Array.isArray(pack.records))H.protocols=[...(H.protocols||[]),...pack.records.map(x=>[x.name,x.port,x.transport.toUpperCase(),"IANA",x.summary])];}}catch(e){} try{const r=await fetch("data/formulas/core-engineering.json",{cache:"no-store"});if(r.ok){const pack=await r.json();if(Array.isArray(pack.records))H.formulas=pack.records;}}catch(e){} }\ndocument.addEventListener("DOMContentLoaded",async()=>{
 const s=document.getElementById("globalSearch"),box=document.getElementById("knowledgeResult");
 if(!s||!box)return;
 s.addEventListener("input",()=>{const q=s.value.trim().toLowerCase();render(q);});\n loadIana().then(()=>render(s.value.trim().toLowerCase()));
 s.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();render(s.value.trim().toLowerCase());document.getElementById("knowledgeResult").scrollIntoView({behavior:"smooth"});}});
 render("");
});
})();