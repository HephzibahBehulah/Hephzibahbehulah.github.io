window.CYBER_ENCYCLOPEDIA={
version:"2026.10",
mission:"A source-aware cybersecurity encyclopedia connecting concepts, layers, protocols, ports, commands, tools, frameworks, teams, detection, labs and engineering.",
flow:["DISCOVER","UNDERSTAND","CONNECT","COPY","PRACTICE","DETECT / DEFEND","GO DEEPER"],
domains:[
["Cybersecurity Fundamentals","CIA triad, authentication, authorization, risk, assets, vulnerabilities, threats, controls, logging and security architecture.","fundamentals"],
["Ethical Hacking","Reconnaissance, enumeration, vulnerability assessment, web security, network testing, privilege concepts and reporting in authorized environments.","ethical-hacking"],
["Networking","OSI, TCP/IP, Ethernet, IP addressing, routing, switching, DNS, DHCP, TCP, UDP, VPNs and network troubleshooting.","networking"],
["Ports & Protocols","Service ports, transport protocols, application protocols, protocol behavior, common exposure and defensive monitoring.","protocols"],
["Security Tools","Packet analysis, scanners, IDS/IPS, endpoint tools, forensic tools, OSINT platforms, cloud tools and lab tooling.","tools"],
["Windows Security","CMD, PowerShell, services, processes, registry, event logs, networking, scheduled tasks, identity and endpoint triage.","windows"],
["Linux Security","Shell, processes, systemd, sockets, logs, filesystems, permissions, cron, capabilities, networking and investigation.","linux"],
["Web Security","HTTP, TLS, sessions, authentication, access control, injection, XSS, CSRF, SSRF, API security and secure development.","web"],
["Cloud Security","AWS, Azure, Google Cloud, IAM, network controls, logging, secrets, workloads, containers and cloud incident response.","cloud"],
["Digital Forensics & DFIR","Evidence preservation, acquisition, timelines, host artifacts, network evidence, triage, containment and recovery.","dfir"],
["SOC & Detection","Telemetry, SIEM, EDR, IDS, alerts, triage, correlation, hunting, incident response and lessons learned.","soc"],
["Threat Intelligence","Actors, campaigns, indicators, TTPs, ATT&CK mapping, provenance, confidence and intelligence lifecycle.","threat-intelligence"],
["OSINT","Scope, collect, validate, correlate, analyze and document public information with provenance and authorization boundaries.","osint"],
["Frameworks & Standards","NIST CSF 2.0, MITRE ATT&CK, OWASP, CIS Controls, IETF RFCs, CVE and other security references.","frameworks"],
["Malware & Reverse Engineering","Static analysis, dynamic analysis, hashes, indicators, sandboxing, memory and defensive malware research.","malware"],
["Identity & Access","Accounts, groups, MFA, IAM, Active Directory, Entra ID, RBAC, least privilege and identity telemetry.","identity"],
["Engineering & Electronics","Electrical formulas, electronics, signals, PLCs, industrial systems, measurement and engineering calculations.","engineering"],
["Cyber Labs & Practice","Packet Tracer, PortSwigger labs, CTFs, isolated VMs, PCAP analysis and controlled security exercises.","labs"]
],
concepts:[
{name:"TCP",summary:"Transmission Control Protocol provides reliable, ordered, connection-oriented byte-stream delivery.",layers:["OSI Layer 4","TCP/IP Transport"],ports:["22 SSH","25 SMTP","80 HTTP","443 HTTPS","445 SMB","3389 RDP"],related:["UDP","IP","ports","sockets","TCP flags","Wireshark","ss","tcpdump","Nmap"],security:"Unexpected listeners, repeated connection attempts, exposed management services and abnormal connection patterns are useful investigation signals.",source:"IETF RFC 9293",url:"https://www.rfc-editor.org/rfc/rfc9293"},
{name:"UDP",summary:"User Datagram Protocol provides connectionless datagram transport with minimal transport-layer overhead.",layers:["OSI Layer 4","TCP/IP Transport"],ports:["53 DNS","67/68 DHCP","123 NTP","161 SNMP","500 IKE","4500 IPsec NAT-T"],related:["TCP","IP","QUIC","DNS","DHCP"],security:"Review unexpected UDP listeners, amplification exposure and unusual high-volume flows.",source:"IETF RFC 768",url:"https://www.rfc-editor.org/rfc/rfc768"},
{name:"DNS",summary:"The Domain Name System translates names into network information through a distributed hierarchy of zones and records.",layers:["OSI Layer 7","TCP/IP Application"],ports:["53/UDP","53/TCP"],related:["A","AAAA","CNAME","MX","TXT","DNSSEC","DoH","DoT","dig","nslookup"],security:"Investigate unusual domains, unexpected resolvers, high query volume and suspicious record changes.",source:"IETF RFC 1034",url:"https://www.rfc-editor.org/rfc/rfc1034"},
{name:"HTTPS",summary:"HTTP protected with TLS. Conventional HTTPS commonly uses TCP port 443; HTTP/3 uses QUIC over UDP.",layers:["OSI Layer 7","OSI Layer 4","TCP/IP Application / Transport"],ports:["443/TCP","443/UDP for QUIC/HTTP/3"],related:["HTTP","TLS","certificates","SNI","ALPN","QUIC","curl","OpenSSL","Wireshark"],security:"Review certificate validity, TLS configuration, exposed services and unexpected web listeners.",source:"IETF RFC 9110",url:"https://www.rfc-editor.org/rfc/rfc9110"},
{name:"Nmap",summary:"A network discovery and security-auditing tool used to identify hosts, ports and service information in authorized environments.",layers:["Network discovery across multiple layers"],ports:["TCP and UDP scanning can identify exposed services"],related:["port scanning","service detection","NSE","Ncat","network inventory"],security:"Scan only systems and networks for which you have authorization; treat results as evidence requiring validation.",source:"Nmap Documentation",url:"https://nmap.org/docs.html"},
{name:"Wireshark",summary:"A network protocol analyzer for inspecting packet captures and live traffic in authorized environments.",layers:["Decodes protocols across networking layers"],ports:["Use display filters such as tcp.port==443 or udp.port==53"],related:["pcap","TShark","TCP","UDP","DNS","TLS","display filters"],security:"Packet captures may contain credentials, tokens and personal data; protect them and collect only with authorization.",source:"Wireshark Documentation",url:"https://www.wireshark.org/docs/"},
{name:"PowerShell",summary:"A Windows automation and administration shell with extensive system, identity, networking and event-investigation capabilities.",layers:["Endpoint administration and security operations"],ports:["Can query host networking rather than representing a network protocol"],related:["Get-Process","Get-Service","Get-WinEvent","Get-NetTCPConnection","Get-ScheduledTask","Microsoft Defender"],security:"Use read-only inspection commands for triage and preserve evidence before making changes during an investigation.",source:"Microsoft Learn",url:"https://learn.microsoft.com/powershell/"},
{name:"Ethical Hacking",summary:"Authorized security testing intended to identify weaknesses, validate controls and improve defenses within an agreed scope.",layers:["Network","Endpoint","Web","Cloud","Identity","Application"],ports:["Depends on the authorized test scope"],related:["reconnaissance","enumeration","vulnerability assessment","exploitation","privilege validation","reporting","rules of engagement"],security:"Authorization, scope, rules of engagement, safety controls and evidence handling define the boundary of legitimate testing.",source:"NIST / CISA / OWASP security guidance",url:"https://www.nist.gov/cyberframework"}
],models:[
{name:"OSI Model",summary:"Seven-layer reference model for reasoning about network functions and where protocols and devices operate.",layers:["7 Application","6 Presentation","5 Session","4 Transport","3 Network","2 Data Link","1 Physical"],examples:["HTTP, DNS, SSH","TLS and data representation","session management","TCP, UDP, SCTP","IPv4, IPv6, ICMP","Ethernet, Wi-Fi, VLAN, ARP","copper, fiber, radio"],source:"ISO",url:"https://www.iso.org/standard/14256.html"},
{name:"TCP/IP Model",summary:"Internet networking model commonly expressed as Application, Transport, Internet and Network Access.",layers:["Application","Transport","Internet","Network Access"],examples:["HTTP, DNS, SSH, SMTP","TCP, UDP, SCTP","IPv4, IPv6, ICMP","Ethernet, Wi-Fi, ARP"],source:"IETF / networking references",url:"https://www.rfc-editor.org/"},
{name:"OSI ↔ TCP/IP Mapping",summary:"A practical mapping between the seven-layer OSI reference model and the four-layer TCP/IP model.",layers:["OSI 7-5 → TCP/IP Application","OSI 4 → TCP/IP Transport","OSI 3 → TCP/IP Internet","OSI 2-1 → TCP/IP Network Access"],examples:["HTTP/DNS/TLS","TCP/UDP","IP/ICMP","Ethernet/Wi-Fi"],source:"Networking reference",url:"https://pingmynetwork.com/network/ccna-200-301/what-is-tcp-ip-model-in-networking"}
],
frameworks:[
{name:"NIST CSF 2.0",summary:"Outcome-oriented guidance for managing cybersecurity risk.",functions:["Govern","Identify","Protect","Detect","Respond","Recover"],use:"Use the Functions, Categories, Subcategories, Profiles and Tiers to describe outcomes and organize risk-management work.",source:"NIST",url:"https://www.nist.gov/cyberframework"},
{name:"MITRE ATT&CK",summary:"A knowledge base for adversary tactics and techniques used to describe observed or simulated behavior.",functions:["Reconnaissance","Resource Development","Initial Access","Execution","Persistence","Privilege Escalation","Defense Evasion","Credential Access","Discovery","Lateral Movement","Collection","Command and Control","Exfiltration","Impact"],use:"Map observed behavior to techniques, then use the mapping to support detection, threat hunting and defensive engineering.",source:"MITRE",url:"https://attack.mitre.org/"},
{name:"OWASP",summary:"Application-security projects, testing guidance and secure-development references.",functions:["Secure design","Threat modeling","Verification","Testing","Remediation"],use:"Use OWASP projects such as the Cheat Sheet Series and ASVS as application-security reference material.",source:"OWASP",url:"https://owasp.org/"},
{name:"CIS Controls",summary:"Prioritized safeguards for improving organizational security.",functions:["Inventory","Protection","Access","Configuration","Monitoring","Recovery"],use:"Map safeguards to assets, owners, evidence and measurable outcomes.",source:"Center for Internet Security",url:"https://www.cisecurity.org/controls"}
],
"lifecycle":[
["Watch","Observe systems, users, network traffic and security telemetry."],
["Collect","Preserve relevant logs, events, timestamps, hashes and context."],
["Detect","Identify deviations, suspicious patterns or known indicators."],
["Respond","Validate the alert, contain where authorized, investigate and coordinate."],
["Recover","Restore trusted operation, validate controls and monitor for recurrence."],
["Learn","Document root causes, evidence, gaps, improvements and lessons learned."]
],
"securityTeams":[
["SOC","Monitors, triages and investigates security telemetry and alerts.","SIEM, EDR, IDS, case management"],
["DFIR","Preserves evidence and reconstructs security events.","Forensics, timelines, memory and disk analysis"],
["Red Team","Performs authorized adversary simulation against agreed objectives.","Emulation, attack-path testing, reporting"],
["Blue Team","Builds and operates defensive controls.","Detection, hardening, response, monitoring"],
["Purple Team","Connects authorized attack simulation with defensive validation.","ATT&CK mapping, detection engineering"],
["GRC","Manages governance, risk, compliance and evidence.","Policies, risk registers, controls, audits"],
["Threat Intelligence","Produces contextual intelligence about threats and campaigns.","OSINT, CTI platforms, ATT&CK, indicators"],
["Security Engineering","Designs, deploys and automates durable security controls.","IAM, network, cloud, endpoint and automation"],
["AppSec","Improves software security throughout the development lifecycle.","Code review, SAST/DAST, threat modeling"],
["IAM","Manages identity lifecycle, authentication and authorization.","Directory, MFA, RBAC, PAM"]
],
"platforms":[
["Endpoint","Windows","Processes, services, registry, files, PowerShell and event logs."],
["Endpoint","Linux","Processes, systemd, files, permissions, sockets and journal."],
["Network","Routers and switches","Routing, switching, VLANs, ACLs, control-plane protocols and telemetry."],
["Network","Firewalls","Policy enforcement, segmentation, NAT and security logging."],
["Application","Web and APIs","HTTP, TLS, sessions, authentication, authorization and input handling."],
["Identity","Active Directory / Entra ID","Users, groups, authentication, authorization and identity telemetry."],
["Cloud","AWS / Azure / Google Cloud","IAM, networks, workloads, storage, secrets and audit telemetry."],
["Container","Docker / Kubernetes","Images, containers, orchestration, RBAC, network policy and runtime controls."],
["Industrial","OT / ICS","PLCs, HMIs, sensors, actuators and industrial network protocols."],
["Source","GitHub","Code, issues, workflows, releases and repository security."]
],
"sourceTiers":[
["Primary standards / official","NIST, IETF RFC Editor, ISO, Microsoft Learn, Linux kernel/man-pages, vendor/project documentation.","Use for authoritative definitions and implementation details."],
["Trusted security organizations","CISA, MITRE, OWASP, CIS, FIRST.","Use for guidance, threat knowledge and security practices."],
["Official training / labs","Cisco Networking Academy, PortSwigger Web Security Academy, Kali Linux, Security Onion.","Use for structured learning and practical exercises."],
["Secondary references","Educational sites and community documentation.","Use for explanations, then verify important claims against primary sources."]
],
"coreSources":[
["NIST CSF 2.0","https://www.nist.gov/cyberframework","Cybersecurity risk framework"],
["MITRE ATT&CK","https://attack.mitre.org/","Adversary tactics and techniques"],
["OWASP Cheat Sheet Series","https://cheatsheetseries.owasp.org/","Application-security guidance"],
["CISA","https://www.cisa.gov/","Cybersecurity guidance and incident-response resources"],
["IETF RFC Editor","https://www.rfc-editor.org/","Internet protocol standards"],
["Microsoft Learn","https://learn.microsoft.com/","Windows and PowerShell documentation"],
["Linux Kernel Documentation","https://docs.kernel.org/","Kernel and system documentation"],
["Linux man-pages","https://man7.org/linux/man-pages/","Linux command reference"],
["Kali Linux","https://www.kali.org/docs/","Security distribution documentation and tools"],
["Wireshark","https://www.wireshark.org/docs/","Packet-analysis documentation"],
["Nmap","https://nmap.org/docs.html","Network discovery and security-auditing documentation"],
["Security Onion","https://docs.securityonion.net/","Network and host visibility platform"],
["Cisco Packet Tracer","https://www.netacad.com/courses/packet-tracer","Network simulation and learning"],
["PortSwigger Web Security Academy","https://portswigger.net/web-security","Web-security training and labs"],
["CVE","https://www.cve.org/","Public vulnerability identifiers"],
["CIS Controls","https://www.cisecurity.org/controls","Prioritized security safeguards"],
["OSINT Framework","https://osintframework.com/","OSINT resource map"],
["Docker Security","https://docs.docker.com/engine/security/","Container security documentation"],
["Kubernetes Security","https://kubernetes.io/docs/concepts/security/","Cluster and workload security"]
]
};