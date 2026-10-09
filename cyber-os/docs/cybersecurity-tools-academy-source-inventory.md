# Cybersecurity Tools Academy: Source Inventory

Status: extracted inventory, not yet a fully verified operational catalogue.
Source basis: the supplied 1,260-line reference and the accompanying extraction notes.
Purpose: preserve the supplied scope and guide catalogue normalisation. Names in this inventory are not claims that every project is maintained, safe to install, available on every OS, or suitable for production use.

## Catalogue rules

- Keep one canonical record per tool. Link the same record from multiple categories rather than duplicating it.
- Separate tools from commands, modules, packages, wordlists, vulnerabilities, learning platforms, and installation scripts.
- For every published tool record, verify the official project URL, current status, supported operating systems, installation method, launch method, dependencies, and version-sensitive commands.
- Label platform-specific requirements, including WSL hardware limitations and GUI/display dependencies.
- Prefer official package managers and official project documentation. Do not make a remote one-line installer the default.
- Teach with sample data, owned assets, or isolated authorised labs. Never imply that arbitrary public targets are acceptable.
- Keep the browser terminal a simulator. It must not execute commands on the visitor's host.

## 1. Reconnaissance and OSINT

WHOIS, dig, nslookup, host, dnsrecon, dnsenum, Fierce, Dmitry, Subfinder, Amass, crt.sh, theHarvester, httpx, WhatWeb, SpiderFoot, Red Hawk, ping, traceroute, curl, Sublist3r.

Purpose: discover public information about domains, websites, infrastructure, and an organisation's potential attack surface.

## 2. Network Scanning and Enumeration

Nmap, Unicornscan, Masscan, Netdiscover, fping, nbtscan, enum4linux, smbclient.

Nmap examples in the source include TCP and UDP scanning, service detection, OS detection, host discovery, and NSE usage. Treat these as different workflows for one canonical tool, not separate tools.

## 3. Web Reconnaissance and Fuzzing

Gobuster, ffuf, Dirb, Dirsearch, Wfuzz, WhatWeb, WPScan, Skipfish, Wapiti, httpx.

Distinguish content discovery and technology fingerprinting from vulnerability testing. Cross-listed tools should retain a single canonical record.

## 4. Vulnerability Assessment

Nmap NSE, Nikto, WPScan, OpenVAS / Greenbone Vulnerability Management, Nessus, Nuclei, Trivy, Lynis.

Review individual checks for current functionality and label the authorised environment required for each example.

## 5. Exploitation and Web Application Security

Metasploit Framework, SQLmap, jSQL Injection, NoSQLMap, XSStrike, Dalfox, BeEF, SSRFmap, Gopherus, LFISuite, jwt_tool, XXER, Commix, Burp Suite, OWASP ZAP, Interactsh, Caido.

Related concepts: SQL injection, cross-site scripting, server-side request forgery, XML external entity attacks, and local file inclusion. Each lesson should explain the concept, provide a safe lab exercise and expected output, and show remediation guidance. Potentially destructive checks must not be framed as suitable for arbitrary websites.

## 6. Password Security and Authentication Testing

John the Ripper, Hashcat, Hydra, Medusa, Ncrack, Crunch, Patator, Aircrack-ng.

Separate offline password auditing from online authentication attempts. Use supplied lab hashes or accounts the learner is authorised to test.

## 7. Wireless Security

Aircrack-ng, airmon-ng, airodump-ng, aireplay-ng, Wifite2, Airgeddon, Wifiphisher, EAPHammer, Wifipumpkin3, Fluxion, Reaver, Bully, hcxdumptool, Wash, Kismet.

Installation does not guarantee hardware compatibility. Explain adapter support, drivers, permissions, and that WSL generally lacks direct access to all wireless features needed by these tools.

## 8. Malware Analysis

file, sha256sum, strings, Binwalk, radare2, objdump, readelf, PEframe, capa, ssdeep, ExifTool, strace, ltrace, inotifywait, tcpdump, Wireshark, Cuckoo Sandbox, YARA, ClamAV.

Covers static and dynamic analysis, file identification, metadata, signatures, and behavioural investigation. Dynamic malware analysis requires a properly isolated environment.

## 9. Digital Forensics

dcfldd, ddrescue, Sleuth Kit, fls, icat, mmls, fsstat, TestDisk, PhotoRec, Foremost, Scalpel, Autopsy, Volatility, bulk_extractor.

Teach evidence preservation, hashing, disk images, recovery, memory analysis, and audit trails. Clearly distinguish read-only image analysis from commands that operate directly on physical disks.

## 10. Network Traffic Analysis and Interception

tcpdump, Wireshark, TShark, ngrep, BetterCAP, Responder, Scapy, dsniff, Snort, arpspoof, Ettercap, mitmproxy, p0f, hping3.

Distinguish defensive monitoring from interception or traffic manipulation. Keep spoofing and interception exercises inside isolated labs or explicitly authorised networks.

## 11. Reverse Engineering

GDB, GEF, pwndbg, radare2, ROPgadget, Ropper, one_gadget, Ghidra, pwntools.

Use intentionally vulnerable programs, supplied binaries, and capture-the-flag exercises for debugger, disassembly, and binary-analysis practice.

## 12. Steganography

steghide, zsteg, stegseek, Snow, OpenStego, Binwalk, Foremost, ExifTool.

Distinguish hiding data from detecting or extracting it. Use supplied sample files for practice.

## Additional categories

### Social engineering awareness
Social-Engineer Toolkit (SET), Gophish, Evilginx2.

### Active Directory security
BloodHound, CrackMapExec.

### Active Directory authentication and relay research
Impacket ntlmrelayx, PetitPotam, SpoolSample, Coercer, Responder.

### Privilege escalation assessment
PEASS-ng, LinPEAS, WinPEAS, PowerUp.

### Post-exploitation tooling
Netcat, Weevely.

### Cryptography and hashing
OpenSSL, GPG, Hashcat, John the Ripper.

### Cloud security
ScoutSuite, Pacu.

### Container security
Docker Bench for Security, Trivy.

### Kubernetes security
kube-bench.

### Defensive endpoint security
ClamAV, rkhunter, chkrootkit.

### System hardening
Lynis, Fail2ban.

### Network intrusion detection
Suricata, Snort.

### File integrity monitoring
AIDE.

### Web proxies
Burp Suite, OWASP ZAP, mitmproxy, Caido.

### Wordlists and payload resources
SecLists, PayloadsAllTheThings, FuzzDB.

These entries overlap with the main categories. Cross-link canonical records rather than duplicating them.

## Installation and platform guidance

Create distinct guidance for Kali Linux, Ubuntu/Debian, WSL, and macOS. Validate every command against the stated operating system and installation method. Record whether each entry is a console application, CLI utility, GUI application, web interface, programming library, service/daemon, or platform-specific utility.

The source includes core prerequisites such as whois, dnsutils, nmap, curl, jq, git, and Python package-management tools.

### Third-party toolkit installers

Do not make a one-line remote installer the default action. Explain how to inspect its source, verify provenance, understand system changes and privileges, and choose a controlled installation method. Make full installation optional.

### WSL and terminal troubleshooting

Separate lessons should cover reloading a shell, reloading shell configuration, shutting down WSL, restarting a named distribution, checking installed tools and PATH, troubleshooting missing commands, and checking Docker status.

## Learning resources

Hack The Box, TryHackMe, VulnHub, OverTheWire, PortSwigger Web Security Academy.

Connect each resource to the relevant topic and tool. Verify the official resource URL before publication.

## Suggested canonical record fields

- name
- canonicalId
- category and optional cross-listed categories
- purpose in plain English
- professional use case
- supported platforms
- installation guidance by platform
- launch method
- safe example and expected output
- output interpretation
- common errors and troubleshooting
- dependencies and hardware limitations
- safe-use note
- official source URL
- version/status verification date
- relevant learning path or lab
- review status

## Verification backlog

1. Normalise names and identify duplicate records.
2. Separate executable tools from shell commands, modules, packages, wordlists, vulnerabilities, and learning platforms.
3. Verify official source URLs and maintenance status.
4. Check installation instructions and commands per platform.
5. Confirm the catalogue count from unique canonical records rather than command examples.
6. Connect the verified records to search, category filters, learning games, terminal guidance, and the admin interface.
7. Validate rendering and responsive behaviour in the deployed admin Cyber OS before claiming production completion.

This inventory preserves the supplied scope. It is an extraction checkpoint, not a substitute for per-tool technical verification.
