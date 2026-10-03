/* ADIGUN Cyber OS — Networking Academy
   Expanded from the 2026 Introduction to Computer Networks curriculum.
   Human-readable, interactive, source-aware learning content. */
window.CYBER_NETWORK_ACADEMY = {
  title:"Introduction to Computer Networks",
  subtitle:"How data really travels — from your keyboard to an AI in a data centre and back.",
  edition:"2026 Edition",
  mission:"Learn the network by following real data: device → access network → DNS → transport → routing → TLS → application → response.",
  objectives:[
    ["Map the network world","Distinguish PAN, LAN/WLAN, MAN, WAN and the Internet, and identify the devices that make them work."],
    ["Think in layers","Use TCP/IP and OSI as practical maps for locating protocols, devices and failures."],
    ["Know the key services","Explain DHCP, NAT, DNS, HTTP/HTTPS, TCP, UDP, ports, IP, MAC and routing."],
    ["Follow a URL","Narrate what happens after Enter, including DNS, connection setup, encryption, request, routing and rendering."],
    ["Place AI on the network","Understand the network path of a chatbot prompt and use AI as a tutor while verifying technical claims."],
    ["Diagnose real connections","Use ping, traceroute/tracert, ipconfig/ifconfig, nslookup/dig and basic socket tools."]
  ],
  journey:[
    ["10 min","Welcome & objectives","Why networks matter to everyone."],
    ["25 min","Network foundations","Types, devices, TCP/IP and OSI."],
    ["10 min","Name That Layer","Interactive layer game."],
    ["25 min","How data travels","TCP/UDP, ports, IP/MAC, DHCP, NAT, DNS and HTTP."],
    ["10 min","Networks in the AI age","Trace a chatbot prompt across the network."],
    ["30 min","Three hands-on labs","Ping/traceroute, DNS detective and AI-assisted troubleshooting."],
    ["10 min","Recap & mission","Network diagram, short report and AI verification rules."]
  ],
  networkTypes:[
    ["PAN","Personal Area Network","Bluetooth earbuds, smartwatch, phone hotspot and nearby personal devices.","Person"],
    ["LAN / WLAN","Local Area Network","One home, office or school. Ethernet is wired; Wi-Fi is wireless.","Building"],
    ["MAN","Metropolitan Area Network","Connects networks across a city, campus or metropolitan area.","City"],
    ["WAN","Wide Area Network","Connects networks across large geographic areas using fibre, cellular, satellite and other carrier infrastructure.","Country / world"],
    ["Internet","Network of networks","Interconnected networks using common protocols and routing systems.","Global"]
  ],
  devices:[
    ["Router","Connects different networks and forwards packets using routing information.","Layer 3 / routing"],
    ["Switch","Connects devices within a LAN and forwards Ethernet frames using MAC addresses.","Layer 2"],
    ["Access Point","Provides wireless access to a wired network.","Layer 2 / Wi-Fi"],
    ["Modem / ONT","Terminates or translates the provider access technology such as fibre, cable or DSL.","Access edge"],
    ["Firewall","Applies traffic policy to allow, deny, inspect or segment traffic.","Security control"],
    ["Server / cloud workload","Runs websites, APIs, databases, storage and AI services.","Application / cloud"],
    ["Load balancer","Distributes application traffic across multiple backend services.","Application / transport"],
    ["DNS resolver","Answers name-resolution queries, often using cache and upstream DNS servers.","Application"]
  ],
  tcpip:[
    ["4","Application","HTTP/HTTPS, DNS, SMTP, SSH and the application protocols users interact with."],
    ["3","Transport","TCP and UDP provide different end-to-end delivery behaviours; ports identify services."],
    ["2","Internet","IP provides logical addressing and routing; ICMP supports network control and diagnostics."],
    ["1","Network Access","Ethernet, Wi-Fi, fibre, copper, radio and other technologies move frames/bits across a link."]
  ],
  osi:[
    ["7","Application","User-facing network services such as web, email and file transfer."],
    ["6","Presentation","Data representation, encryption and compression concepts. TLS is often discussed here in teaching models, although the practical stack does not map perfectly."],
    ["5","Session","Conversation/session management as a reference concept."],
    ["4","Transport","TCP/UDP and ports."],
    ["3","Network","IP addressing and routing."],
    ["2","Data Link","Ethernet, Wi-Fi, MAC addresses, frames and switches."],
    ["1","Physical","Signals, radio, fibre, copper, connectors and transmission media."]
  ],
  protocols:[
    ["HTTP","80","TCP in traditional HTTP/1.1 and HTTP/2 deployments","Web request/response"],
    ["HTTPS","443","TCP for HTTP/1.1 and HTTP/2; QUIC/UDP for HTTP/3","HTTP protected by TLS"],
    ["DNS","53","UDP and TCP","Name resolution and DNS records"],
    ["SSH","22","TCP","Secure remote administration"],
    ["SMTP submission","587","TCP","Authenticated email submission"],
    ["IMAPS","993","TCP","Email retrieval over TLS"],
    ["RDP","3389","TCP/UDP","Remote desktop service"],
    ["SMB","445","TCP","Windows file/printer sharing"]
  ],
  addressConcepts:[
    ["IPv4","32-bit logical address. Private ranges are commonly used inside networks and NAT can translate them to public addresses.","192.168.1.24"],
    ["IPv6","128-bit logical address designed for a vastly larger address space and modern network operation.","2001:db8::8a2e:370:7334"],
    ["MAC","Link-layer hardware address used for local network delivery. Switches use MAC information to forward frames.","3C:2E:F9:12:AB:07"],
    ["CIDR","Modern prefix notation such as /24. It replaced the old classful A/B/C teaching model for practical addressing.","192.168.1.0/24"],
    ["Public IP","Address visible for Internet routing, normally allocated by an ISP/cloud/provider.","Provider-assigned"],
    ["Private IP","Address used inside a private network and not directly routed across the public Internet.","192.168.x.x / 10.x.x.x"]
  ],
  services:[
    ["DHCP","Automatically provides network configuration such as IP address, subnet mask/prefix, default gateway and DNS servers.","DORA: Discover → Offer → Request → Acknowledge"],
    ["NAT","Translates private addresses/ports to a public address/port mapping. Commonly lets many internal hosts share an Internet connection.","Private → translated public flow"],
    ["DNS","Translates names into records such as A, AAAA, MX, NS, CNAME and TXT. Recursive resolvers may cache answers.","name → record"],
    ["HTTP/HTTPS","Application request/response protocol. HTTPS adds TLS protection for confidentiality, integrity and server authentication.","GET → response"],
    ["ARP / Neighbor Discovery","Helps hosts discover link-layer neighbours for local delivery. IPv4 commonly uses ARP; IPv6 uses Neighbor Discovery.","IP → local link identity"],
    ["ICMP","Control and diagnostic protocol used by IP networks. Echo request/reply powers ping; other messages report network conditions.","ping / diagnostics"],
    ["TLS","Cryptographic protocol used to protect application communications such as HTTPS.","authenticate → negotiate → encrypt"]
  ],
  transport:[
    ["TCP","Connection-oriented transport with sequencing, acknowledgements, retransmission and congestion control. Reliable delivery does not mean zero latency.","SYN → SYN-ACK → ACK"],
    ["UDP","Connectionless datagram transport with low protocol overhead. Applications decide how to handle loss, ordering and reliability.","datagram → application"],
    ["QUIC","Modern encrypted transport built over UDP. HTTP/3 uses QUIC, combining reliable streams, encryption and modern connection behaviour.","HTTP/3 → QUIC → UDP"]
  ],
  packetJourney:[
    ["1","Application creates data","A browser, app or AI client creates a request."],
    ["2","Transport adds delivery context","TCP or UDP handles transport; a source and destination port identify the flow."],
    ["3","IP adds logical addressing","The host selects source/destination IP information and a route toward the destination."],
    ["4","Local network delivers the next hop","Ethernet/Wi-Fi frames carry the packet to the gateway or next device."],
    ["5","Routers forward hop by hop","Each router examines the destination and selects the next hop. The link-layer framing can change at every hop."],
    ["6","Server receives and responds","The destination stack removes headers as data moves upward and the application processes the request."],
    ["7","Response returns","The response is segmented/packetized and routed back. The browser or app reassembles and renders it."]
  ],
  urlJourney:[
    ["01","Setup","DHCP normally supplied an address, prefix, gateway and DNS configuration when the device joined the network."],
    ["02","DNS lookup","The hostname is resolved to one or more IP records. A cached answer may make this step very fast."],
    ["03","Connect & secure","Traditional HTTP/1.1 and HTTP/2 commonly use TCP followed by TLS. HTTP/3 uses QUIC over UDP."],
    ["04","Request","The client sends an HTTP request. NAT may translate the private source address/port on the way out."],
    ["05","Route & respond","Routers forward traffic hop by hop. The server, CDN, load balancer or application returns an HTTP response."],
    ["06","Render","The browser processes HTML, CSS, JavaScript and additional resources, often creating many more network requests."]
  ],
  aiJourney:[
    ["Client","Keyboard → app","Your prompt begins as application data on the device."],
    ["Access network","Wi-Fi/Ethernet → gateway","The device sends frames toward the local gateway."],
    ["Internet path","DNS → routing → provider networks","The destination service is located and packets travel across multiple networks."],
    ["Secure transport","HTTPS or HTTP/3","The application traffic is protected using TLS; HTTP/3 uses QUIC."],
    ["AI edge / service","Gateway → load balancer → service","A provider may route the request through edge infrastructure, gateways and load balancers before the model service."],
    ["GPU / model system","Inference","The service processes the prompt. Internal data-centre networking can be far more complex than the public Internet path."],
    ["Streaming response","Tokens → network → client","The response is sent back incrementally so the interface can display output while generation continues."]
  ],
  security:[
    ["Attack surface","Every exposed service, API, device and management interface is part of the environment defenders must understand."],
    ["Open ports","A listening port is not automatically vulnerable, but unexpected or unnecessary exposure should be investigated and controlled."],
    ["Segmentation","VLANs, routing policy, firewalls and network controls can limit which systems may communicate."],
    ["DNS security","Logging, filtering, DNSSEC where appropriate, and monitoring can help detect manipulation or suspicious resolution patterns."],
    ["TLS","Encryption protects traffic in transit, but certificates, trust, endpoint security and application design still matter."],
    ["IPv6","IPv6 is not simply 'IPv4 with longer addresses'. Dual-stack environments require IPv6-aware routing, firewalling and monitoring."],
    ["Zero Trust","Network location alone should not be treated as proof of trust. Identity, device state and policy matter."]
  ],
  labs:[
    ["Lab 1","Ping & traceroute","ping example.com; tracert example.com (Windows); traceroute example.com (Linux/macOS). Compare latency and hops. Asterisks can mean a hop is not responding to the diagnostic probe, not necessarily that the route is broken.","beginner"],
    ["Lab 2","DNS detective","ipconfig /all or ifconfig/ip addr; nslookup example.com or dig example.com. Inspect A, AAAA, MX and other records. Compare resolver answers.","beginner"],
    ["Lab 3","AI-assisted troubleshooting","Give an AI assistant a non-sensitive traceroute output. Ask for a beginner explanation. Pick two claims and verify them using commands or authoritative documentation.","beginner"],
    ["Lab 4","Port-to-process mapping","Windows: Get-NetTCPConnection / netstat -ano. Linux: ss -tulpn. Identify listeners in your own lab and map ports to services/processes.","intermediate"],
    ["Lab 5","Packet anatomy","Open an authorised training PCAP in Wireshark/TShark. Identify Ethernet, IP, TCP/UDP, DNS and TLS metadata.","intermediate"],
    ["Lab 6","CIDR reasoning","Calculate network, broadcast, prefix, usable range and subnet size for training prefixes. Then connect the result to routing and segmentation.","intermediate"]
  ],
  game:[
    ["Wi-Fi password is wrong","Layer 2","Data Link / access authentication and local connectivity context."],
    ["Cable was unplugged","Layer 1","Physical."],
    ["Hostname was typed incorrectly","Layer 7","Application / name-resolution usage."],
    ["Video call is choppy","Investigate Layer 4 and below","UDP may be involved, but do not diagnose from symptoms alone; check latency, loss, jitter and application telemetry."],
    ["Browser shows a certificate warning","Layer 6 in a simplified OSI teaching model","TLS spans practical stack boundaries, so use OSI as a reasoning aid rather than a strict implementation map."],
    ["A router chooses the wrong next hop","Layer 3","Network / routing."],
    ["Switch forwards a frame to the wrong place","Layer 2","Data Link / MAC forwarding."],
    ["DNS resolves to an unexpected address","Layer 7","Application / DNS, then investigate authoritative data, resolver path and cache."]
  ],
  troubleshooting:[
    ["1. Define the symptom","What exactly fails? One device, one application, one destination, or everything?"],
    ["2. Check the local link","Wi-Fi association, cable, interface state and link information."],
    ["3. Check configuration","IP address, prefix, gateway and DNS settings."],
    ["4. Test by layers","Ping gateway, ping destination where appropriate, resolve DNS, test the service/port, then inspect application behaviour."],
    ["5. Trace the path","Use traceroute/tracert and compare latency/loss patterns without assuming every hop must answer."],
    ["6. Verify the service","Check HTTP status, TLS/certificate behaviour, listening sockets or service logs in systems you control."],
    ["7. Change one thing","Make a controlled change, retest and record the result."],
    ["8. Document evidence","Keep commands, timestamps, observations and verified conclusions."]
  ],
  homework:[
    ["Network diagram","Draw a small office with Internet → router/firewall → switch, computers A/B/C, printer and Wi-Fi smartphone. Label links and identify the likely layer(s)."],
    ["Short report","Write 500–700 words explaining DHCP, NAT, DNS and HTTP/HTTPS: what each does, how they interact and why defenders care."],
    ["AI tutor rule","AI may explain concepts, but verify important claims against at least one non-AI authoritative source and write the final explanation in your own words."],
    ["Evidence habit","Include one claim you verified and the source/command used to verify it. This teaches the difference between explanation and evidence."]
  ],
  moreTopics:[
    ["Switching","MAC tables, Ethernet frames, VLANs, trunks, STP and broadcast domains."],
    ["Routing","Default gateways, static routes, dynamic routing, BGP concepts and route selection."],
    ["Subnetting","CIDR, prefixes, masks, network/broadcast concepts, IPv4 planning and IPv6 prefixes."],
    ["Wireless","802.11 concepts, channels, roaming, WPA2/WPA3 and wireless troubleshooting."],
    ["Internet edge","CDNs, reverse proxies, load balancers, anycast and provider networks."],
    ["Cloud networking","VPC/VNet, subnets, security groups, route tables, gateways and private endpoints."],
    ["Containers","Container networks, bridge networks, service discovery and Kubernetes networking concepts."],
    ["Observability","Latency, throughput, packet loss, jitter, logs, metrics, traces and flow records."],
    ["Network security","Firewalls, IDS/IPS, VPNs, segmentation, NAC, secure DNS and zero trust."],
    ["Modern protocols","HTTP/2, HTTP/3, QUIC, DNS over TLS/HTTPS and IPv6."]
  ]
};

(()=>{
  const N=window.CYBER_NETWORK_ACADEMY;
  const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
  const card=(tag,title,body,extra="")=>'<article class="network-academy-card"><span class="network-tag">'+esc(tag)+'</span><h3>'+esc(title)+'</h3><p>'+esc(body)+'</p>'+extra+'</article>';
  const listCards=(id,arr,mode=0)=>{
    const el=document.getElementById(id); if(!el)return;
    el.innerHTML=arr.map((x,i)=>{
      if(mode===1)return card(x[0],x[1],x[2],'<code>'+esc(x[3]||"")+'</code>');
      if(mode===2)return card(x[0],x[1],x[2]);
      return card(x[0],x[1],x[2]);
    }).join("");
  };
  const render=()=>{
    const root=document.getElementById("network-academy"); if(!root)return;
    document.getElementById("networkAcademyTitle").textContent=N.title;
    document.getElementById("networkAcademySubtitle").textContent=N.subtitle;
    document.getElementById("networkAcademyMission").textContent=N.mission;
    document.getElementById("networkObjectives").innerHTML=N.objectives.map((x,i)=>card(String(i+1).padStart(2,"0"),x[0],x[1])).join("");
    document.getElementById("networkJourney").innerHTML=N.journey.map(x=>'<div class="academy-timeline"><b>'+esc(x[0])+'</b><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></div>').join("");
    listCards("networkTypes",N.networkTypes); listCards("networkDevices",N.devices); listCards("tcpipLayers",N.tcpip); listCards("osiLayers",N.osi);
    listCards("networkProtocols",N.protocols); listCards("networkAddresses",N.addressConcepts); listCards("networkServices",N.services); listCards("networkTransport",N.transport);
    document.getElementById("packetJourney").innerHTML=N.packetJourney.map(x=>'<div class="academy-step"><b>'+esc(x[0])+'</b><div><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></div></div>').join("");
    document.getElementById("urlJourney").innerHTML=N.urlJourney.map(x=>'<div class="academy-step"><b>'+esc(x[0])+'</b><div><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></div></div>').join("");
    document.getElementById("aiJourney").innerHTML=N.aiJourney.map(x=>'<div class="academy-step"><b>'+esc(x[0])+'</b><div><strong>'+esc(x[1])+'</strong><span>'+esc(x[2])+'</span></div></div>').join("");
    listCards("networkSecurity",N.security); listCards("networkMore",N.moreTopics);
    document.getElementById("networkLabs").innerHTML=N.labs.map(x=>card(x[0],x[1],x[2],'<span class="network-level">'+esc(x[3])+'</span>')).join("");
    document.getElementById("networkTroubleshooting").innerHTML=N.troubleshooting.map(x=>'<div class="academy-step"><b>'+esc(x[0])+'</b><div><strong>'+esc(x[1])+'</strong><span>'+esc(x[1])+'</span></div></div>').join("");
    document.getElementById("networkHomework").innerHTML=N.homework.map(x=>card(x[0],x[0],x[1])).join("");
    document.getElementById("networkGame").innerHTML=N.game.map((x,i)=>'<button class="academy-game-q" data-i="'+i+'"><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+'</span></button>').join("");
    document.getElementById("networkGameResult").textContent="Choose a scenario to reveal the reasoning.";
    document.querySelectorAll(".academy-game-q").forEach(btn=>btn.onclick=()=>{const x=N.game[Number(btn.dataset.i)];document.getElementById("networkGameResult").innerHTML="<b>"+esc(x[1])+"</b> · "+esc(x[2]);});
    const search=document.getElementById("networkAcademySearch");
    search.oninput=()=>{
      const q=search.value.toLowerCase().trim();
      document.querySelectorAll("#network-academy .network-academy-card,#network-academy .academy-step").forEach(el=>el.hidden=!!q&&!el.textContent.toLowerCase().includes(q));
    };
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})();