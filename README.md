# HEPHZIBAH BEHULAH — Intelligence · Engineering · Security

A browser-first technical learning, engineering and security platform by **Hephzibah Behulah**.

This project is designed as a working technical workspace rather than a conventional static portfolio. It brings together engineering calculations, data learning, cybersecurity study, OSINT research, technical resources, projects, interactive tools, quizzes and a browser-native command terminal.

**Core loop:** LEARN → BUILD → TEST → SECURE

**Technical path:** ELECTRICITY → SIGNAL → DATA → NETWORK → SECURITY

---

## 1. Platform overview

The site is a static, client-side application hosted on GitHub Pages. Most interaction runs directly in the browser using HTML, CSS and JavaScript.

The platform contains:

- personal technical identity and portfolio
- interactive Intelligence Tree
- searchable Resource Matrix
- Ebook Vault
- engineering Toolbench
- large indexed Mega Tools catalogue
- Engineering / Elektroniker Lab
- Knowledge Library
- Bible study and quiz system
- selected public projects
- five-part Technical Workbench
- HB Terminal command interface
- passive-first Recon Hub
- dedicated Engineering Library
- responsive layouts, motion and reduced-motion support

---

## 2. Main navigation

The canonical homepage is **index.html**.

| Area | Purpose |
|---|---|
| Overview | Identity, technical direction and working method |
| Intelligence Tree | Visual map of the technical domains |
| Resource Matrix | Searchable technical resources |
| Ebook Vault | Technical ebook/source archive |
| Toolbench | Engineering formulas and compact tools |
| Mega Tools | Searchable indexed toolbox |
| Engineering | Local engineering calculators |
| Knowledge | Searchable technical document catalogue |
| Bible Quiz | Scripture study and quiz interface |
| Projects | Public repositories and Technical Workbench |
| Terminal | Command-driven interface for the wider platform |

Dedicated workspaces:

- **recon-hub.html** — passive OSINT and attack-surface research

The former standalone Pentest Lab experience has been consolidated into the main Terminal.

---

## 3. Identity and design language

The shared identity is:

**HEPHZIBAH BEHULAH**

**Engineering → Intelligence → Security**

**LEARN · BUILD · TEST · SECURE**

The homepage presents the working method:

**observe → research → build → test → document**

The public interface is designed to feel like a technical workstation while remaining readable, responsive and practical.

---

## 4. Intelligence Tree

Implemented by **js/intelligence-map.js**.

Root:

- HB / CORE

Branches:

- ENGINEERING
- WEB / CODE
- DATA ANALYTICS
- CYBERSECURITY
- OSINT
- AI SECURITY
- LEARNING LAB

Representative leaves include:

- Electronics
- Automation / OT
- Web Building
- Git / GitHub
- Water Pump ML
- Loan Analysis
- Security Notes
- Terminal
- Public Sources
- Verification
- Prompt Injection
- Responsible AI
- Resource Matrix
- Labs / Practice

The tree supports node inspection, visual connections, drag/pan, zoom and reset.

Legacy tree data remains in **js/tree-data-home.js** for compatibility.

---

## 5. Resource Matrix

The Resource Matrix is a searchable technical resource interface.

Primary data source:

**data/source-library.json**

The current data-driven index contains approximately:

- **70 technical ebook/source entries**
- **1,088 indexed toolbox modules**

Features:

- text search
- category filtering
- reset
- source/resource opening
- structured resource presentation

The application uses metadata and source links instead of copying large external source collections into the repository.

---

## 6. Ebook Vault

The Ebook Vault provides a searchable view of the technical ebook archive.

It connects users to the public **Hacking-Security-Ebooks** source repository.

The vault is an index and learning entry point. It does not duplicate hundreds of megabytes of external PDF content inside this project.

---

## 7. Toolbench

The Toolbench provides compact engineering reference material.

The equation deck includes:

| Formula | Meaning |
|---|---|
| V = I × R | Ohm's Law |
| P = V × I | Electrical power |
| E = P × t | Energy |
| I = Q / t | Current |
| Vout = Vin × R2 / (R1 + R2) | Voltage divider |
| Rt = R1 + R2 + … | Series resistance |
| f = 1 / T | Frequency |
| η = Pout / Pin × 100% | Efficiency |

The existing micro-tools are browser-local and remain separate from the Terminal engine.

---

## 8. Mega Tools

Mega Tools is the large indexed toolbox rendered by **js/mega-tools.js**.

It provides:

- tool search
- category filtering
- indexed discovery
- matching tool opening
- source-index refresh
- integration with the wider site

The catalogue is data-driven through **data/source-library.json**, making it scalable without manually maintaining more than a thousand tool cards.

---

## 9. Engineering / Elektroniker Lab

Engineering calculators are now part of the unified Mega Tools workspace rather than a separate page.

The engineering runtime is maintained through **js/engineering-calculators-local.js** and **js/engineering-library.js** and is indexed by **js/mega-tools.js**.

The unified workspace covers practical calculations across:

- electrical engineering
- HVAC
- plumbing
- construction
- mechanical engineering
- electronics
- networking-related calculations

Calculations execute locally in the browser where supported, with formulas, units and validation exposed through the Mega Tools interface.

## 10. Knowledge Library

The Knowledge Library is a searchable technical document catalogue.

It supports:

- document search
- domain filtering
- engineering references
- electronics material
- cybersecurity material
- OT/industrial material
- networking material
- study navigation

The catalogue is intended to take the learner from a topic to the underlying technical material.

---

## 11. Bible Quiz

The Bible section combines external reading with a local browser quiz.

The main quiz engine is part of **js/intelligence-core.js**.

Structured quiz banks include:

- Bible
- Elektroniker
- Engineering
- Biology
- Geography
- General Knowledge
- Leben in Deutschland
- Driving
- Politics

The quiz supports:

- next question
- answer selection
- answer reveal
- score
- streak
- category selection
- locally generated variants

The Bible section links to the external Gen Z Bible rather than copying its paraphrase text into the repository.

---

## 12. Projects

The current project workspace highlights public repositories including:

- Water Pump Status Prediction ML
- Loan Approval Analysis
- Cybersecurity Study Notes
- Prompt Injection Learning Journal
- TryHackMe GUI
- Power BI Samples

Project compatibility data is retained in **js/projects-data.js**.

---

## 13. HB Technical Workbench

The Technical Workbench sits beside the selected project repositories.

It connects:

**ELECTRICITY → SIGNAL → DATA → NETWORK → SECURITY**

The five machines are:

### Signal Decoder

Works with:

- binary
- hexadecimal
- decimal
- ASCII
- IP/CIDR representations

### Color / LED Lab

Supports:

- HEX colour parsing
- RGB/RGBA
- HSL/luminance information
- contrast information
- palette information
- LED PWM reference
- LED resistor calculation

Core LED relationship:

**R = (Supply − LED Vf) / Current**

### Protocol Inspector

Reference coverage includes:

- HTTP / HTTPS
- DNS
- DHCP
- SSH
- FTP
- SMTP
- IMAP
- POP3
- ICMP
- ARP
- TLS
- NTP
- SNMP
- MQTT

### Engineering Signal Lab

Signal types:

- sine
- square
- triangle
- sawtooth

Parameters:

- frequency
- amplitude
- phase

Outputs:

- period
- frequency
- peak
- RMS
- peak-to-peak

### Technical Challenge

A procedural challenge engine spans:

- decoder
- colour / LED
- protocol
- signal lab
- engineering
- networking
- cybersecurity
- data analytics
- OSINT
- AI security
- learning

It supports approximately **1,000,000 generated variants**.

Implementation:

**js/technical-workbench.js**

---

# 14. HB Terminal

The Terminal is the site's command-driven learning layer.

Implementation:

**js/terminal.js**

Current version:

**HB TERMINAL 1.1**

It is a browser-native JavaScript command engine, not a Linux shell and not a remote command server.

## System commands

- HELP
- LIST / LS
- MAN
- WHICH
- STATUS / IS
- VERSION
- ABOUT / WHOAMI
- TREE
- HISTORY
- CLEAR / CLS
- EXIT / QUIT / Q
- OPEN TERMINAL
- PWD
- CD
- CHDIR
- ECHO
- DATE
- NAV
- FOCUS
- IA

## Engineering commands

- OHM
- POWER
- ENERGY
- RESISTOR
- LED
- COLOR
- FREQUENCY
- RMS
- EFFICIENCY
- VOLTAGE
- CURRENT
- IMPEDANCE
- DIVIDER
- VOLTAGE-DIVIDER
- SERIES-RESISTANCE
- PARALLEL-RESISTANCE
- POWER-FACTOR
- THREE-PHASE
- MOTOR-TORQUE
- VOLTAGE-DROP

## Data commands

- MEAN
- MEDIAN
- MODE
- RANGE
- VARIANCE
- STD
- ZSCORE
- PRECISION
- RECALL
- F1

## Security commands

- BASE64
- ENCODE
- DECODE
- HASH
- SHA256
- JWT
- CSRF
- XSS
- SQLI
- MFA
- PASSWORD

## Networking commands

- IP
- CIDR
- SUBNET
- PORTS
- PROTOCOL
- TCP
- UDP
- ICMP
- ARP
- HTTP
- HTTPS
- DNS
- DNSLOOKUP
- NSLOOKUP
- ROUTE
- MAC
- PING
- TRACEROUTE
- NMAP
- NAP

## OSINT commands

- URLINFO
- URL
- HEADERS
- ROBOTS
- SITEMAP
- CRT
- WHOIS

## Learning commands

- QUIZ START
- QUIZ NEXT
- ANSWER A|B|C|D
- QUIZ SCORE
- QUIZ RESET
- GAME START
- GAME SCORE
- GAME RESET
- GAME HELP
- RULES
- CHECK
- SELFTEST
- EXPLAIN
- GLOSSARY
- LEARN
- TOOLS
- TOOL
- PROJECT
- REPO

---

## 15. Terminal HELP memory system

The HELP command is intentionally designed as a future memory aid.

Use:

**HELP**

for the quick command map.

Use:

- **HELP ENGINEERING**
- **HELP NETWORK**
- **HELP SECURITY**
- **HELP DATA**
- **HELP OSINT**
- **HELP LEARNING**
- **HELP SYSTEM**

for focused command lists.

Use:

**MAN POWER**

or another command name for a short manual.

Use:

**LIST**

when the command itself is forgotten.

Use:

**SELFTEST**

to check important command families.

The Terminal also accepts normal numbers and angle-bracket notation for numerical commands, for example:

**POWER 24 5**

and:

**POWER <24> <5>**

---

## 16. Terminal quiz and game

The Terminal contains a separate browser-local learning game layer.

### Quiz

Typical flow:

1. QUIZ START
2. read the question
3. ANSWER A/B/C/D
4. QUIZ NEXT
5. QUIZ SCORE

Supported Terminal quiz areas currently include:

- Engineering
- Networking
- Security
- Data
- OSINT
- Learning

### Game

Start with:

**GAME START**

The mixed game tracks:

- score
- streak
- level

Controls:

- GAME HELP
- GAME SCORE
- GAME RESET

The game requires no server or account.

---

## 17. Terminal navigation

The Terminal can move through the rest of the website.

Examples:

- NAV TREE
- NAV RESOURCES
- NAV EBOOKS
- NAV TOOLBENCH
- NAV MEGA-TOOLS
- NAV ENGINEERING
- NAV KNOWLEDGE
- NAV PROJECTS

This makes the Terminal a command layer over the wider learning platform.

---

## 18. Terminal limitations

Because the application runs on GitHub Pages as a browser application, it cannot:

- execute arbitrary Linux commands
- execute PowerShell or CMD
- launch programs on the user's computer
- access the real filesystem
- become a remote shell
- run native Nmap
- perform unrestricted port scanning
- bypass browser security
- automatically attack remote systems
- provide unrestricted server-side penetration testing

NMAP / NAP are therefore learning and explanation modes.

PWD, CD and CHDIR use a simulated virtual directory tree maintained by the Terminal.

External web access can also be restricted by browser CORS and the policies of the destination website.

---

# 19. Recon Hub

**recon-hub.html**

The Recon Hub is a passive-first OSINT and attack-surface research workspace.

Its approach emphasises:

- lawful public-source research
- verification
- evidence
- passive discovery
- privacy awareness
- authorised testing

The hub maps research resources covering areas such as:

- certificate transparency
- DNS
- WHOIS
- URL analysis
- URL scanning
- internet asset discovery
- security intelligence

Main implementation:

- **js/recon-hub.js**
- **css/recon-hub.css**
- **js/hb-hub-motion.js**

---

# 21. Visual system

Main styling:

**css/osint-redesign.css**

Brand styling:

**css/hb-brand.css**

The interface includes:

- dark technical workstation styling
- responsive layouts
- animated panels
- pointer-following ambient effects
- domain-aware visual states
- hover depth
- navigation motion
- animated tree nodes
- button/card motion
- route transitions
- terminal motion
- footer/social interaction
- custom cursor treatment
- mobile refinements
- reduced-motion support

Motion is used to reinforce hierarchy and interaction rather than replace useful content.

---

# 22. JavaScript architecture

### osint-redesign.js

Handles the main visual/interface layer:

- branding
- footer
- navigation
- theme interactions
- pointer effects
- custom cursor
- panel reveal
- active navigation
- command palette
- domain visual states
- route transitions
- reduced-motion behaviour

### intelligence-core.js

Handles core data-driven application functions:

- Resource Matrix
- Ebook Vault
- Mega Tools integration
- Engineering rendering
- Knowledge Library
- Bible quiz
- search/filter behaviour
- quiz state

### intelligence-map.js

Interactive Intelligence Tree.

### technical-workbench.js

Five-machine Technical Workbench.

### mega-tools.js

Indexed toolbox rendering and interaction.

### terminal.js

Command parser, terminal output, calculations, security learning, networking helpers, OSINT helpers, quiz/game and site navigation.

### engineering-library.js

Engineering calculator registry/runtime used by Mega Tools. The former standalone Engineering Library page has been retired after consolidation.

### recon-hub.js

Recon Hub research-tool mapping and interaction.

### hb-hub-motion.js

Shared motion behaviour for dedicated workspaces.

### projects-data.js

Project data and compatibility renderer.

### tree-data-home.js

Legacy/compatible tree data.

---

# 23. Data architecture

The major data source is:

**data/source-library.json**

The application follows:

**DATA → RENDERER → INTERACTION**

rather than hard-coding every resource into the page.

This is important because the resource/tool catalogue is large and needs to remain maintainable.

---

# 24. Branding assets

Primary logo:

**assets/hb-logo.svg**

Shared brand rules:

**css/hb-brand.css**

Public identity:

**HEPHZIBAH BEHULAH**

**Engineering → Intelligence → Security**

**LEARN · BUILD · TEST · SECURE**

The footer exposes public channels for GitHub, LinkedIn, X, Facebook, GitBook and the technical blog.

---

# 25. Responsive design

The platform is designed for:

- desktop
- tablet
- mobile

Large grids collapse at smaller widths. The Technical Workbench, equation deck, resource cards and Terminal controls adapt to available screen space.

Reduced-motion preferences are respected by the motion layer.

---

# 26. Browser-first architecture

Advantages:

- no backend required for core tools
- simple GitHub Pages deployment
- local calculations
- transparent client-side behaviour
- easy public access
- modular JavaScript

Trade-offs:

- no native operating-system shell
- no server-side scanning engine
- browser CORS restrictions
- no private application database
- limited persistence unless browser storage is used
- external sources may change or block embedding

---

# 27. Security and ethics

Security-related features are designed for:

- lawful use
- authorised environments
- privacy awareness
- passive-first research
- evidence-driven investigation
- responsible disclosure
- safe browser demonstrations

The public static application deliberately does not expose arbitrary server-side command execution.

---

# 28. Repository structure

    FirstWebsite/
    ├── index.html
    ├── recon-hub.html
    ├── css/
    │   ├── osint-redesign.css
    │   ├── hb-brand.css
    │   └── recon-hub.css
    ├── js/
    │   ├── osint-redesign.js
    │   ├── intelligence-core.js
    │   ├── intelligence-map.js
    │   ├── terminal.js
    │   ├── technical-workbench.js
    │   ├── mega-tools.js
    │   ├── engineering-library.js
    │   ├── recon-hub.js
    │   ├── hb-hub-motion.js
    │   ├── projects-data.js
    │   └── tree-data-home.js
    ├── data/
    │   └── source-library.json
    ├── assets/
    │   └── hb-logo.svg
    └── README.md

Additional legacy assets may exist for compatibility.

---

# 29. Main application load order

The main page loads the client modules in this order:

1. osint-redesign.js
2. terminal.js
3. technical-workbench.js
4. intelligence-map.js
5. mega-tools.js
6. intelligence-core.js

The modules communicate through the DOM, browser state and shared data/functions.

The architecture is intentionally modular so individual working systems can be improved without rebuilding the entire application.

---

# 30. Development principle

**Show the work, not the scaffolding.**

The public interface should expose useful technical capability without filling the experience with unnecessary implementation commentary.

The website is both:

- a public technical portfolio
- a personal learning environment

The Terminal, Workbench, Intelligence Tree, calculators, resources and quizzes are therefore parts of one connected system.

---

# 31. The learning model

The platform is organised around a simple technical progression:

**Electricity produces signals.**

**Signals become data.**

**Data moves through networks.**

**Networks create systems.**

**Systems create security problems.**

**Security requires understanding the whole system.**

This is why engineering, networking, data analytics, OSINT and cybersecurity live together in the same platform.

---

## Author

**Hephzibah Behulah**

Engineering · Intelligence · Security

GitHub: **HephzibahBehulah**

© 2026 Hephzibah Behulah
## HB Terminal 2.0 Expansion

The original terminal command engine remains intact. A separate expansion layer adds a data-driven technical command registry without replacing the existing commands.

### Expanded capability families

- Engineering and electronics: capacitors, reactance, impedance, power systems, motors, signals, filters, ADC/DAC, PWM, PLC, PID and unit conversion.
- Networking: IPv4/IPv6 concepts, subnetting, masks, host counts, TCP, UDP, DNS, DHCP, ARP, ICMP, MTU, MSS and protocol reference.
- Web and API: HTTP methods/status, headers, cookies, CORS, CSP, JSON, DOM, JavaScript, REST and Fetch concepts.
- Security and cryptography: XSS, SQL injection, CSRF, SSRF, XXE, IDOR, authentication, authorization, JWT, hashing, salts, HMAC, AES, RSA, ECC and password-security concepts.
- OSINT and forensics: domains, URLs, DNS records, certificate transparency, robots, sitemaps, archives, ASN/IP context, IOCs, evidence, timelines, metadata and log analysis.
- Data and ML: descriptive statistics, percentiles, IQR, MAD, correlation, normalization, standardization, classification metrics, regression metrics, ROC/AUC and data-quality concepts.
- Python, Linux and Git learning: language structures, common shell concepts, permissions, processes, Git workflows and GitHub concepts.
- AI security: LLMs, prompts, tokens, context, RAG, embeddings, guardrails, prompt injection, data poisoning and model-security concepts.
- Learning system: explanations, formulas, related-topic discovery, scenarios, checks, profiles, XP, badges, daily missions, graphs and browser-local simulations.

### Generated command routes

The expansion contains 309 structured topics and 2,472 generated topic routes. Each topic can be explored through actions such as EXPLAIN, FORMULA, LEARN, SCENARIO, CHECK, ABOUT, RELATED and QUIZ.

Examples:

- `HELP ENGINEERING`
- `SEARCH capacitor`
- `MAN tcp`
- `FORMULA ohms-law`
- `EXPLAIN prompt-injection`
- `RELATED jwt`
- `CONVERT 1 kW W`
- `CORRELATION 1 2 3 | 2 4 6`
- `MASK 24`
- `GRAPH SINE`
- `SIMULATE RC 1000 0.000001`
- `CASE NEW network investigation`
- `PROFILE`

The expansion is loaded after `terminal.js`, so the existing terminal engine, quiz/game behavior, navigation, calculations and aliases remain the base layer.