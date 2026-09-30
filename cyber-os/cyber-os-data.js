window.CYBER_DATA={
network:[
{id:"https",name:"HTTPS",port:"443",transport:"TCP",osi:"L7",tcpip:"Application",security:"TLS and certificate validation",tags:["web","tls"]},
{id:"dns",name:"DNS",port:"53",transport:"UDP/TCP",osi:"L7",tcpip:"Application",security:"DNS logging and filtering",tags:["names"]},
{id:"ssh",name:"SSH",port:"22",transport:"TCP",osi:"L7",tcpip:"Application",security:"Key authentication and login monitoring",tags:["remote"]},
{id:"smb",name:"SMB",port:"445",transport:"TCP",osi:"L7",tcpip:"Application",security:"SMB signing and segmentation",tags:["windows"]},
{id:"rdp",name:"RDP",port:"3389",transport:"TCP/UDP",osi:"L7",tcpip:"Application",security:"MFA and network restrictions",tags:["remote"]},
{id:"tcp",name:"TCP",port:"variable",transport:"TCP",osi:"L4",tcpip:"Transport",security:"State tracking and SYN anomaly detection",tags:["segment"]},
{id:"udp",name:"UDP",port:"variable",transport:"UDP",osi:"L4",tcpip:"Transport",security:"Rate controls and amplification monitoring",tags:["datagram"]},
{id:"ipv4",name:"IPv4",port:"—",transport:"—",osi:"L3",tcpip:"Internet",security:"ACLs and anti-spoofing",tags:["packet"]},
{id:"ethernet",name:"Ethernet",port:"—",transport:"—",osi:"L2",tcpip:"Link",security:"VLAN and switch controls",tags:["frame"]}
],
commands:[
{id:"whoami",platform:"Windows",name:"whoami /all",purpose:"Display identity and privilege context.",security:"Account investigation.",example:"whoami /all"},
{id:"ipconfig",platform:"Windows",name:"ipconfig /all",purpose:"Display interface, DNS and DHCP details.",security:"Network triage.",example:"ipconfig /all"},
{id:"netstat",platform:"Windows",name:"netstat -ano",purpose:"Show connections, listeners and PIDs.",security:"Network investigation.",example:"netstat -ano"},
{id:"tasklist",platform:"Windows",name:"tasklist /svc",purpose:"List processes and services.",security:"Process triage.",example:"tasklist /svc"},
{id:"getprocess",platform:"PowerShell",name:"Get-Process",purpose:"List running processes.",security:"Process investigation.",example:"Get-Process"},
{id:"getnettcp",platform:"PowerShell",name:"Get-NetTCPConnection",purpose:"Inspect TCP connections.",security:"Network-process investigation.",example:"Get-NetTCPConnection -State Listen"},
{id:"id",platform:"Linux",name:"id",purpose:"Show user and group identity.",security:"Privilege context.",example:"id"},
{id:"ss",platform:"Linux",name:"ss -tulpn",purpose:"Show listening sockets and processes.",security:"Network listener triage.",example:"ss -tulpn"},
{id:"ps",platform:"Linux",name:"ps auxf",purpose:"Show process tree.",security:"Process investigation.",example:"ps auxf"},
{id:"journalctl",platform:"Linux",name:"journalctl -p warning..alert",purpose:"Review high-priority journal events.",security:"Rapid log triage.",example:"journalctl -p warning..alert"}
],
shortcuts:[
{id:"winh",platform:"Windows",keys:"Win + H",purpose:"Open voice typing.",use:"Hands-free note capture."},
{id:"winr",platform:"Windows",keys:"Win + R",purpose:"Open Run.",use:"Launch diagnostics quickly."},
{id:"taskmgr",platform:"Windows",keys:"Ctrl + Shift + Esc",purpose:"Open Task Manager.",use:"Process triage."},
{id:"history",platform:"Linux",keys:"Ctrl + R",purpose:"Reverse-search shell history.",use:"Find previous commands."},
{id:"interrupt",platform:"Linux",keys:"Ctrl + C",purpose:"Interrupt foreground command.",use:"Stop a command safely."},
{id:"devtools",platform:"Browser",keys:"F12",purpose:"Open developer tools.",use:"Inspect web behavior."},
{id:"palette",platform:"VS Code",keys:"Ctrl + Shift + P",purpose:"Command Palette.",use:"Find editor commands."}
],
frameworks:[
{id:"nist",name:"NIST CSF 2.0",type:"Cybersecurity Framework",source:"https://www.nist.gov/cyberframework",summary:"Outcome-oriented cybersecurity risk management.",functions:["Govern","Identify","Protect","Detect","Respond","Recover"],details:"The six Functions organize high-level cybersecurity outcomes. The Core expands into Categories and Subcategories."},
{id:"attack",name:"MITRE ATT&CK",type:"Adversary knowledge base",source:"https://attack.mitre.org/",summary:"Adversary tactics and techniques.",functions:["Reconnaissance","Initial Access","Execution","Persistence","Discovery","Lateral Movement","Collection","Command and Control","Impact"],details:"Use ATT&CK to describe observed or simulated behavior and support threat-informed defense."},
{id:"owasp",name:"OWASP",type:"Application security",source:"https://owasp.org/",summary:"Application security projects and guidance.",functions:["Secure design","Verification","Testing","Risk reduction"],details:"Use OWASP guidance as a structured application-security reference."},
{id:"cis",name:"CIS Controls",type:"Security controls",source:"https://www.cisecurity.org/controls",summary:"Prioritized safeguards.",functions:["Inventory","Protection","Access","Monitoring","Recovery"],details:"Map safeguards to systems, owners, evidence and outcomes."}
],
osintFlow:[["01","Scope","Define authorised objective and boundary."],["02","Collect","Gather public data while minimizing unnecessary personal information."],["03","Validate","Check source quality, timestamp and provenance."],["04","Correlate","Connect entities without treating inference as fact."],["05","Analyze","Explain evidence and unknowns."],["06","Document","Preserve source, query, time and confidence."]],
osintSources:[["Certificate Transparency","Certificate names and issuance history.","https://crt.sh/"],["RIPEstat","IP and ASN context.","https://stat.ripe.net/"],["urlscan.io","Public web scan observations.","https://urlscan.io/"],["Internet Archive","Historical public web content.","https://web.archive.org/"],["GitHub","Public code and metadata.","https://github.com/"]],
detection:[["Unexpected listener","ss/netstat → process → service","Validate whether the service is expected."],["Suspicious process","process → parent → path → signer","Correlate ancestry, path, user and time."],["Authentication anomaly","security log → account → source","Compare time, source and normal behavior."],["Persistence","task/service → binary","Verify owner, path and change history."]],
teams:[["SOC","Defensive operations","Monitor, triage, investigate and coordinate response.","SIEM, EDR, network telemetry"],["DFIR","Forensics and response","Preserve evidence and reconstruct events.","Forensic tools and timelines"],["Red Team","Authorised simulation","Test defenses under agreed rules.","Emulation tools"],["Blue Team","Defensive operations","Prevent, detect and improve controls.","SIEM, EDR, IAM"],["Purple Team","Cross-team validation","Improve detections using simulations.","ATT&CK"],["GRC","Governance","Translate obligations and risk into evidence.","Control frameworks"],["Threat Intelligence","Threat context","Validate and contextualize threat information.","CTI platforms"],["Security Engineering","Durable controls","Design and automate security controls.","IAM, cloud, network"]],
formulas:[
{id:"ohm",name:"Ohm's Law",formula:"V = I × R",vars:[["V","Voltage","V"],["I","Current","A"],["R","Resistance","Ω"]],calc:function(v){if(v.V&&v.I)return{R:v.V/v.I};if(v.I&&v.R)return{V:v.I*v.R};if(v.V&&v.R)return{I:v.V/v.R};return{error:"Enter any two values."}}},
{id:"power",name:"Electrical Power",formula:"P = V × I",vars:[["P","Power","W"],["V","Voltage","V"],["I","Current","A"]],calc:function(v){if(v.V&&v.I)return{P:v.V*v.I};if(v.P&&v.V)return{I:v.P/v.V};if(v.P&&v.I)return{V:v.P/v.I};return{error:"Enter any two values."}}},
{id:"energy",name:"Electrical Energy",formula:"E = P × t",vars:[["E","Energy","Wh"],["P","Power","W"],["t","Time","h"]],calc:function(v){if(v.P&&v.t)return{E:v.P*v.t};if(v.E&&v.P)return{t:v.E/v.P};return{error:"Enter two compatible values."}}}
],
games:[
{id:"packet",title:"From Packet to Incident",question:"Which simplified sequence represents HTTPS through a network?",options:["Application → TCP → IP → Ethernet","TCP → HTTP → power","DNS → SMTP → RDP"],answer:0,explain:"Application data is carried by transport, network and link layers."},
{id:"soc",title:"SOC First Decision",question:"A new listener appears on a host. What comes first?",options:["Delete it","Validate service, owner, path and expected change","Publish the IP"],answer:1,explain:"Start with evidence and context."}
],
labs:[["Subnet Lab","Calculate network, broadcast, usable range and mask from CIDR.","Networking","Use the existing terminal cidr command in an authorised lab."],["Port-to-Protocol Lab","Trace port → transport → protocol → OSI/TCP-IP → control.","Networking","Search 443, 53, 22 or 445."],["Windows Triage Lab","Identity → process → network → service → logs.","Defensive endpoint","Use read-only command cards."],["Linux Triage Lab","Identity → process → socket → service → journal.","Defensive endpoint","Use id, ps, ss and journalctl."]],
glossary:[["ARP","Address Resolution Protocol","Maps IPv4 addresses to link-layer addresses.","Networking"],["CIDR","Classless Inter-Domain Routing","Notation for an IP prefix such as 192.168.1.0/24.","Networking"],["IOC","Indicator of Compromise","Observable evidence that may indicate security-relevant activity.","Detection"],["EDR","Endpoint Detection and Response","Endpoint telemetry, detection and response.","Security"],["SIEM","Security Information and Event Management","Collects, correlates and analyzes security events.","SOC"],["MFA","Multi-Factor Authentication","Authentication using more than one independent factor.","Identity"],["OSINT","Open-Source Intelligence","Analysis of publicly available information for a defined purpose.","Intelligence"]],
learning:[["01","Networking Foundations","Frames, packets, segments, Ethernet, IP, TCP/UDP, DNS and subnetting.","networking"],["02","Systems & Commands","Windows, PowerShell, Linux, processes, services and logs.","commands"],["03","Security Foundations","Identity, endpoint, network, application, data and cloud.","frameworks"],["04","Detection & Response","Telemetry, alerts, triage, investigation and recovery.","detection"],["05","Framework Thinking","NIST CSF 2.0, MITRE ATT&CK, OWASP and CIS.","frameworks"],["06","Practical Simulation","SOC cases, network reasoning and response scenarios.","games"]]
};