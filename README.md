# HEPHZIBAH BEHULAH

## Current integrated release — 20 October 2026

| Workspace | Live address | Access |
| --- | --- | --- |
| Main website | https://hephzibahbehulah.com/ | Public entry and shared member account |
| Engineering | https://engineering.hephzibahbehulah.com/ | Public learning workspace |
| Cybersecurity | https://cyber.hephzibahbehulah.com/ | Public learning workspace |
| Admin control | https://admin.hephzibahbehulah.com/admin | Owner-only Cloudflare Access and MFA |
| Admin tools | https://admin.hephzibahbehulah.com/admin/tools/ | Private |
| Admin Cyber OS | https://admin.hephzibahbehulah.com/admin/cyber-os/ | Private |

### VoltPRo Studio

> VoltPro is in active development. DRC rules and symbol libraries are pending verified standards ingestion and licensed catalog integration. Do not use for final production documentation. Live status and the gap register: https://engineering.hephzibahbehulah.com/status.

- [Simulator](https://engineering.hephzibahbehulah.com/simulator), [Breadboard](https://engineering.hephzibahbehulah.com/breadboard) and [VoltProPLC](https://engineering.hephzibahbehulah.com/voltpro-plc/) use compact studio menus, native editing controls, project libraries, component sidebars, inspectors and results docks.
- [VoltPro ElectCAD](https://engineering.hephzibahbehulah.com/voltPro-ElectCAD/) is integrated from React/TypeScript source in `apps/voltpro-electcad/`; the static build is mounted by the shared engineering Worker. Its optional development API is not exposed publicly.
- Phone layouts use side drawers and grouped commands. Company branding, theme choices, language selector, account controls and external links remain available.
- Each workspace exposes **100,000 editable parameter studies** across ten study families/control templates. These are variations, not 100,000 distinct circuit topologies.
- The Component Bank supplements existing devices with **1,000,000 value configurations across four generic electrical models**: resistor, capacitor, inductor and DC source. These are not one million manufacturer parts. PLC directs electrical configurations to Simulator.
- Studies include explanations and exercises. Loading preserves recovery data; PLC imports validate before modifying native state.
- Decorative heading numbering, the simulator build label and breadboard footer implementation wording are removed from the interface. Useful pin numbers, measurements, project search identifiers and model limitations remain.
- Original pinned downloads are preserved before studio integration; a checksum/size change for an unchanged source commit blocks the build.

Validation: 77 integration/unit tests; syntax checks for 67 original browser scripts; 300,000 project structures; 200,000 DC solves; 200,000 native PLC scans; and positive finite values for all 1,000,000 configurations. Laptop and phone layouts were inspected for all three workspaces. Live checks confirmed circuit loading, expected 6 V divider output from 12 V, PLC study import and Run/Stop. Public routes responded successfully and unauthenticated admin routes retained Cloudflare Access protection.

These checks do not certify physical hardware, every transient response or every possible user drawing. Fresh authenticated admin interaction was not repeated for this release. Existing member inactivity timeout remains five hours; verification-code expiry remains four minutes.

Implementation: [PR #37](https://github.com/HephzibahBehulah/Hephzibahbehulah.github.io/pull/37), [PR #38](https://github.com/HephzibahBehulah/Hephzibahbehulah.github.io/pull/38). Published Worker version: `09289d49-1c09-4c73-b913-49def9dfb8a8`.

### PLC header reference update

The PLC top bar follows the ElectCAD reference: Main Site and company logo, orange lightning brand labelled VoltProPLC, project dropdown, File/Edit/View/Insert/Project/Electrical/Simulation/Reports/Tools/Window/Help menus, grid/snap/zoom/save controls, workspace, language, theme, readiness and account controls. Existing PLC actions remain connected. Narrow screens keep a single horizontally scrollable row. The shared shell header mounts in a hidden slot to avoid duplicate controls while preserving bottom navigation integration.

Validation: PLC TypeScript/production build, 21 engine tests and 27 workspace integration tests passed locally. File dropdown, grid toggle and zoom were checked in a browser. Production deployment remains unverified.

### PLC expanding canvas

The PLC drawing camera fills the canvas and supports native horizontal/vertical scrollbars, wheel/trackpad panning, drag panning, Ctrl+wheel/pinch zoom and existing grid snapping. The labelled worksheet spans 0–10,000 by A–ZZ without an A3 page boundary; the camera stays inside that labelled area so zooming out cannot expose an unlabelled viewport. Numbered and lettered rulers follow camera translation and zoom, with columns 0–10,000 and rows A–ZZ. The complete range is reachable with the scrollbars. Editable title fields and canvas status remain fixed to the canvas viewport, including when panels open or close. Starter projects, all ten library examples and the blank-project action live inside Project (between Insert and Electrical). No startup panel takes space above the canvas. Blank projects reset the camera to the origin. Toolbar layout is unchanged.

Validation: PLC build, 25 engine/canvas geometry tests, 27 workspace integration checks and browser checks for two-axis scrolling, zoom and fixed overlay positions.

### PLC zoom anchoring and duplicate notices

Zoom buttons, Ctrl+wheel and touch pinch scale the drawing around the fixed canvas origin. Ruler labels align with grid lines so 0 and A remain stationary during zoom. Panning and scrolling still move the drawing normally; Fit remains an explicit reframing action. The canvas keeps the RUNNING/STOPPED indicator once, and the bottom bar retains Run/Stop, Single scan, scan count and device/wire counts. The PLC readiness warning appears once in the existing bottom navigation instead of repeating above the canvas. Workspace navigation links are preserved.

Validation: production build, 26 PLC engine/geometry tests, workspace integration checks and browser origin-position measurements. Touch gesture handling shares the tested origin calculation; physical touch-device verification is pending.

### PLC single-row bottom bar

The PLC footer now matches the supplied reference: six workspace links on the left (PLC highlighted), a single Stopped/Running indicator with separate Start and Stop buttons, and one readiness notice on the right. The outer duplicate navigation row is hidden for PLC, and its editor fills the released viewport space. Scan counts, device/wire counts and diagnostics remain anchored inside the canvas; Single scan remains available in Simulation. Navigation preserves the suite’s cached workspaces. ElectCAD and the top toolbar layout are unchanged.

Validation for the bottom-bar update: production build, 26 PLC tests, 27 workspace integration tests and 67 original browser-script checks passed. Browser checks confirmed six workspace links, one readiness notice, a 52 px single row, Start/Stop state changes and advancing scan count.

### Electrical building-plan workspace

The `/electrical` route uses its dedicated BuildingCAD editor. Its single 50 px toolbar contains File, Edit, View, Insert, Project and Electrical menus plus grid, zoom, save/export and Workspace controls. Blank-project and open-project actions live inside Project; Electrical has no fabricated set of ten starter examples. Shared account, language, theme and readiness controls remain available in Workspace, with the shared header restored when switching away.

The canvas fills the space between the toolbar and bottom navigation. A 200 mm model grid uses virtual rulers spanning 0–10,000 horizontally and A–ZZ vertically. The scrollable model accommodates existing objects beyond the former 80 × 42 boundary. Scrollbars, background/Space/middle-button drag panning, zoom buttons, Ctrl+wheel and pinch use the same camera coordinates. Placement and device dragging retain integer grid snapping; the drawing title block and status remain anchored while the drawing moves. The library and inspector overlay the canvas, close when the pointer leaves and remain available from the panel rail. The inspector stops above the title block so its fields remain editable.

Existing room, device, orthogonal connection, validation, reference assignment, schedule, save/open, undo/redo and export actions are retained. Loading a project applies its title fields before saving, preventing the previous project's metadata from replacing imported metadata. No project schema change is required.

Validation: 12 targeted document, routing and viewport tests; browser checks for ruler endpoints, zoomed placement, two-axis pan, room drawing, orthogonal connections, anchored title position, saved project recovery, readiness dialog and shared-header restoration. Physical touch-device and print-output verification remain pending. PLC source files are unchanged.

### PLC canvas reference alignment

PLC uses the supplied ElectCAD images as its canvas reference only. Rulers now use the same 100-unit divisions, with fixed-size text: a 950-unit-wide view shows 0–9 at 100% and 0–37 at 25%. The model grid combines subtle 20-unit dots with major lines every ten grid intervals. Camera bounds keep labels visible at worksheet edges across zoom levels. The inspector reserves its own 280 px column, and a compact editable title block stays inside the visible drawing viewport. The unused minimap is removed. Coordinates and zoom appear at the lower-left; diagnostics remain visible when needed. Completed top and bottom bars and ElectCAD files are unchanged.

Validation: production build, 27 PLC engine/geometry tests and 27 workspace integration tests passed. Browser comparison at 100% and 25% confirmed increased ruler coverage, readable labels and identical origin/title-block positions.

### PLC Properties toggle and fixed canvas dimensions

Properties now owns a permanently reserved right-hand column. Its header and show/hide button remain visible in the same position when the panel content is collapsed. Opening or hiding Properties does not resize or shift the canvas, rulers, camera or title block at 100% or 25%. The header stays accessible when moving the pointer away collapses the panel content. Existing left-rail shortcuts still open the relevant dock tab. The top and bottom bars and ElectCAD source are unchanged.

Validation for the Properties fix: production build and 54 tests passed. Browser measurements at both 100% and 25% confirmed identical canvas bounds, ruler coverage, camera translation, title-block bounds and toggle position before hiding, while hidden and after reopening.

### Breadboard workspace follows the completed PLC reference
Breadboard now owns a single top menu row, a single bottom navigation/simulation row, a left tool rail and a permanently reserved Properties column. The library overlays the canvas; hiding Properties leaves its header toggle accessible and does not change the canvas dimensions. Examples and blank-project actions live inside Project. Existing breadboard components, tie-point snapping, wiring, probe, firmware, serial, PCB, scope and solver handlers are retained; scope lives inside Properties.

The canvas uses the available viewport with independent horizontal/vertical scrolling and panning, 0–10000 / A–ZZ rulers, and zoom from 25% to 800%. Ruler text stays readable while divisions follow the workspace scale. Title fields and status stay anchored to the viewport; title metadata is included in project exports. The default view shows the physical board at 100%. PLC and ElectCAD source are unchanged.

Validation: 51 Breadboard tests and 27 workspace integration tests passed. Browser checks confirmed Project examples run a wired LED circuit and that Properties toggling preserves canvas/title/ruler geometry at 100% and 25%.

### Breadboard production shell cleanup
The production experience layer now leaves Breadboard’s existing frame intact. Its extra global header and lowest navigation row are hidden, while the original engineering AI launcher remains floating at the same lower-right offset as ElectCAD. The native Breadboard menus, bottom simulation controls, canvas and Properties layout are retained. The legacy studio decorator skips the completed Breadboard shell.

### Documentation maintenance

Update this README alongside every project change that affects functionality, navigation, setup, configuration, deployment or verification. Describe delivered behaviour, accurate library counts, relevant checks and known limitations; preserve still-valid documentation.

---

## Engineering · Intelligence · Security

Hephzibah Behulah is a browser-first technical platform combining engineering, software, data, networking, cybersecurity, OSINT, AI security and structured learning into one connected workspace.

The platform is designed as a working technical environment rather than a conventional portfolio.

**Core method**

`OBSERVE → RESEARCH → BUILD → TEST → DOCUMENT`

**Learning model**

`SEARCH → UNDERSTAND → COPY → PRACTICE`

**Technical path**

`ELECTRICITY → SIGNAL → DATA → NETWORK → SECURITY`

---

## Platform

The repository is the canonical source of truth for the website and its application code.

The current platform includes:

- Public technical profile and portfolio
- Intelligence Tree
- Resource and Knowledge systems
- Ebook Vault
- Mega Tools
- Engineering calculators
- Technical Workbench
- Browser-native terminal
- Reconnaissance and OSINT workspace
- Cyber OS
- ADIGUN Control
- ADIGUN Tool Lab
- Public AI and Admin AI interfaces
- Learning, quiz and simulation systems
- Responsive and accessibility systems
- Multilingual interface support
- Project and repository integrations

The repository is currently private. The production hosting/runtime can change independently of the source repository.

---

# 1. Public Website

The public site is the main entry point.

It provides:

- Personal technical identity
- Engineering and software background
- Technical learning resources
- Interactive tools
- Project portfolio
- Cybersecurity and OSINT learning
- GitHub project integration
- Public external profiles and resources

The homepage remains browser-first and keeps core interactive functionality available without requiring a backend.

---

# 2. Private Control Platform

The private control environment extends the public platform with authenticated engineering and administration workspaces.

## ADIGUN Control

Path:

`/admin`

Purpose:

**ADIGUN CONTROL // COMMAND ROOM**

It provides a private operational interface for:

- identity and session status
- system intelligence
- knowledge access
- terminal access
- Admin AI
- control-room status
- authenticated administrative capabilities
- security boundary visibility

The private control layer is protected by the application's authentication boundary and the current hosting infrastructure.

## ADIGUN Tool Lab

Path:

`/admin-tools`

Purpose:

**ADIGUN TOOL LAB // TECHNICAL ENGINEERING LABORATORY**

The Tool Lab unifies technical workspaces for:

- calculations
- experiments
- testing
- technical documentation
- Mega Tools
- engineering tools
- projects
- knowledge
- terminal workflows
- AI assistance

The former standalone Engineering Library experience has been consolidated into the unified tool environment.

---

# 3. ADIGUN Cyber OS

Path:

`/cyber-os/`

Mission:

**TURN UNKNOWN SIGNALS INTO UNDERSTANDABLE, VERIFIED SECURITY KNOWLEDGE.**

Core workflow:

`COLLECT → CORRELATE → ANALYSE → VERIFY → LEARN`

Cyber OS is the dedicated security intelligence and learning workspace.

## Current navigation

1. Dashboard
2. Stats
3. Knowledge Hub
4. Scale Status
5. Networking
6. Network Academy
7. Reconnaissance
8. Workflow
9. Toolkit
10. Query Lab
11. Evidence
12. Learning
13. Command Center
14. Keyboard Lab
15. Frameworks
16. OSINT
17. Detection
18. Teams & Actors
19. Formulas
20. SOC Simulator
21. Cyber Games
22. Network Calculator
23. Labs
24. Glossary
25. Knowledge Graph
26. Learning Path
27. Linux Terminal
28. Admin AI
29. Public AI

The navigation order is explicitly synchronised by the Cyber OS runtime so the sidebar and page sequence remain aligned.

## Security approach

Cyber OS is built around:

- lawful research
- authorised testing
- passive-first reconnaissance
- evidence
- verification
- privacy awareness
- defensive learning
- responsible disclosure

The platform does not provide unrestricted remote command execution or unrestricted offensive scanning from the browser.

---

# 4. Reconnaissance and OSINT

Reconnaissance is integrated into Cyber OS rather than maintained as an isolated public feature.

The workspace covers areas including:

- domains
- URLs
- DNS
- certificate transparency
- WHOIS
- HTTP headers
- robots.txt
- sitemaps
- internet-facing assets
- evidence collection
- verification
- security intelligence

The design principle is:

**COLLECT → CORRELATE → ANALYSE → VERIFY**

Tools and explanations are intended for legal, authorised and educational use.

---

# 5. ADIGUN Terminal

The platform contains a browser-native technical command environment.

It is a learning and simulation interface, not a remote Linux shell.

The terminal supports command families covering:

### System

- HELP
- LIST / LS
- MAN
- WHICH
- STATUS
- VERSION
- ABOUT / WHOAMI
- TREE
- HISTORY
- CLEAR
- PWD
- CD
- ECHO
- DATE
- NAV
- FOCUS
- SELFTEST

### Engineering

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
- SERIES-RESISTANCE
- PARALLEL-RESISTANCE
- POWER-FACTOR
- THREE-PHASE
- MOTOR-TORQUE
- VOLTAGE-DROP

### Networking

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

### Security

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

### Data

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

### OSINT

- URLINFO
- URL
- HEADERS
- ROBOTS
- SITEMAP
- CRT
- WHOIS

### Learning

- QUIZ
- GAME
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

The expanded command registry adds structured technical topics and learning routes without replacing the original terminal engine.

The terminal expansion currently contains hundreds of structured topics and generated learning routes across:

- engineering
- electronics
- networking
- web and APIs
- cybersecurity
- cryptography
- OSINT
- forensics
- data and machine learning
- Python
- Linux
- Git and GitHub
- AI security

Typical commands include:

```text
HELP ENGINEERING
SEARCH capacitor
MAN tcp
FORMULA ohms-law
EXPLAIN prompt-injection
RELATED jwt
CONVERT 1 kW W
MASK 24
GRAPH SINE
SIMULATE RC 1000 0.000001
PROFILE
```

The terminal uses a simulated/browser environment where an operation cannot safely or technically be executed by a static web application.

---

# 6. Mega Tools

Mega Tools is the unified searchable technical toolbox.

It combines:

- engineering calculators
- electronics tools
- networking tools
- security references
- data utilities
- technical learning tools
- local engineering modules
- structured technical resources

The catalogue is data-driven rather than manually duplicating thousands of individual cards.

Primary data source:

`data/source-library.json`

The system is designed around:

**DATA → RENDERER → INTERACTION**

This makes the catalogue scalable and maintainable.

---

# 7. Engineering Tools

Engineering functionality is integrated into Mega Tools and the wider Tool Lab.

Current domains include:

- electrical engineering
- electronics
- HVAC
- plumbing
- construction
- mechanical engineering
- networking
- signal analysis

Examples include:

- Ohm's law
- power
- energy
- resistance
- voltage divider
- series and parallel resistance
- efficiency
- frequency
- RMS
- impedance
- power factor
- three-phase calculations
- motor torque
- voltage drop
- LED resistor calculations

Where supported, calculations execute locally in the browser.

---

# 8. Technical Workbench

The Technical Workbench connects:

**ELECTRICITY → SIGNAL → DATA → NETWORK → SECURITY**

Its major systems include:

### Signal Decoder

Binary, hexadecimal, decimal, ASCII and IP/CIDR representations.

### Color and LED Lab

HEX, RGB/RGBA, HSL, luminance, contrast and LED resistor calculations.

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

Supports:

- sine
- square
- triangle
- sawtooth

with frequency, amplitude and phase calculations.

### Technical Challenge

A procedural learning engine combines engineering, networking, cybersecurity, data, OSINT and AI-security concepts into generated practice scenarios.

---

# 9. Knowledge and Learning

The platform combines searchable technical material with interactive learning.

Major areas include:

- Knowledge Library
- Resource Matrix
- Ebook Vault
- Cybersecurity study material
- Networking
- Electronics
- Engineering
- OSINT
- AI security
- quizzes
- scenarios
- simulations
- glossary
- learning paths

The learning system is designed to move from discovery to understanding and then to practice.

---

# 10. Intelligence Tree

The Intelligence Tree provides a visual representation of the platform's technical domains.

Primary branches include:

- Engineering
- Web / Code
- Data Analytics
- Cybersecurity
- OSINT
- AI Security
- Learning Lab

It supports:

- node inspection
- visual relationships
- zoom
- pan
- reset
- interactive exploration

Main implementation:

`js/intelligence-map.js`

---

# 11. Projects

The platform connects selected public technical projects and repositories.

Project information is maintained through the repository data layer and can include areas such as:

- machine learning
- data analysis
- cybersecurity
- Power BI
- security learning
- prompt injection research
- technical applications

The project system is designed to expose real project work rather than placeholder portfolio cards.

---

# 12. AI Systems

The platform contains separate public and private AI interfaces.

## Public AI

Available within the public/Cyber OS experience.

## Admin AI

Available inside the authenticated private control environment.

The frontend communicates through application API contracts rather than embedding private provider credentials in browser code.

AI provider implementation is treated as a backend/runtime concern.

---

# 13. Language System

The platform includes a shared language system supporting:

- English
- German
- Yoruba
- Nigerian Pidgin

The language selector can persist the selected language and respond to language query parameters.

The translation system also supports dynamic content and accessibility-related labels.

Not every educational text block is necessarily translated yet. The system is designed so additional translations can be added without rebuilding the application architecture.

---

# 14. Responsive and Accessibility Systems

The platform is designed for:

- desktop
- tablet
- mobile

The shared responsive layer provides:

- overflow protection
- responsive grids
- mobile navigation behaviour
- touch-friendly controls
- mobile language selection
- landscape handling
- reduced-motion support

Accessibility touch sizing is applied to mobile interfaces without unnecessarily changing desktop interaction dimensions.

---

# 15. Architecture

The repository follows a three-layer model.

```text
PRIVATE GITHUB
      |
      | source of truth
      v
APPLICATION
      |
      +-- Public Website
      +-- ADIGUN Control
      +-- ADIGUN Tool Lab
      +-- Cyber OS
      +-- Terminal
      +-- AI Interfaces
      +-- Learning Systems
      |
      v
SERVICE / API LAYER
      |
      +-- Authentication
      +-- AI services
      +-- GitHub integration
      +-- Data services
      +-- Server-side processing
      |
      v
HOSTING / RUNTIME
      |
      +-- Current Cloudflare runtime
      +-- Future hosting provider if required
```

GitHub is the canonical source repository.

The hosting provider is treated as a deployment/runtime layer rather than the owner of the application.

The frontend uses relative API routes where applicable so that the application can be moved behind another compatible runtime without rewriting the entire browser application.

Provider-specific configuration remains isolated in the runtime/deployment layer.

---

# 16. Hosting Portability

The platform is intentionally being maintained so a future hosting provider can replace the current runtime with minimal application disruption.

The migration principle is:

```text
GitHub
  ↓
Build
  ↓
Staging
  ↓
Functional verification
  ↓
Traffic / DNS switch
  ↓
Monitoring
  ↓
Retire old runtime
```

The existing runtime should remain active until the replacement has been verified.

A host migration must preserve:

- public URLs
- application routes
- API contracts
- authentication
- AI interfaces
- Cyber OS
- ADIGUN Control
- Tool Lab
- terminal
- knowledge systems
- calculators
- learning systems
- responsive behaviour

Provider-specific secrets belong in runtime secret stores and must never be committed to source code.

Detailed architecture:

`ARCHITECTURE.md`

Migration runbook:

`deployment/PORTABILITY.md`

Secret-name reference:

`deployment/runtime-secrets.example`

---

# 17. Security Model

Security-sensitive functionality follows:

**LEGAL → AUTHORISED → PRIVACY-AWARE → EVIDENCE-DRIVEN**

The platform does not intentionally expose:

- arbitrary server-side command execution
- unrestricted remote shells
- private credentials
- unrestricted offensive scanning
- browser bypass mechanisms

The browser cannot directly provide capabilities that require privileged server or operating-system access.

Sensitive operations should remain behind authenticated service boundaries.

---

# 18. Repository Structure

The repository contains the public application, private-control application, Cyber OS, shared systems, backend/runtime components and deployment documentation.

Important areas include:

```text
/
├── index.html
├── admin.html
├── admin-tools.html
├── ai-agent.html
├── cyber-os/
│   ├── index.html
│   ├── cyber-os.js
│   └── cyber-os.css
├── css/
│   ├── adigun-admin.css
│   ├── ai-lab.css
│   ├── accessibility.css
│   ├── mobile-system.css
│   └── other shared styles
├── js/
│   ├── adigun-admin.js
│   ├── adigun-agent.js
│   ├── adigun-command-engine.js
│   ├── adigun-private-operator.js
│   ├── adigun-renderer.js
│   ├── adigun-terminal-controller-v2.js
│   ├── ai-lab.js
│   ├── language-system.js
│   └── other application modules
├── data/
├── backend/
├── deployment/
├── assets/
├── ARCHITECTURE.md
├── DEPLOYMENT_SAFETY.md
└── README.md
```

Additional compatibility and legacy assets may remain where they are required by the existing application.

---

# 19. Development Principles

### Preserve working functionality

Existing working systems should be improved rather than unnecessarily replaced.

### Build from real data

Large catalogues should use structured data and reusable renderers rather than fake duplicated entries.

### Keep interfaces human-readable

Operational results should be understandable to a human user. Raw internal JSON should not be the default presentation for ordinary status or tool results.

### Separate application from infrastructure

The website should not become permanently dependent on one hosting provider when a stable API boundary can be maintained.

### Keep secrets out of source

Credentials belong in runtime secret management.

### Verify before claiming success

A repository commit, a CI result and a live deployment check are different forms of evidence.

### Prefer small, reversible changes

Changes should be isolated, verifiable and easy to roll back.

---

# 20. Browser-First Limitations

The browser application cannot:

- execute arbitrary Linux commands on the user's computer
- access the user's private filesystem without explicit browser APIs and permission
- run native Nmap from ordinary browser JavaScript
- perform unrestricted port scanning
- bypass CORS
- bypass authentication
- operate as a remote shell
- guarantee access to external services that block browser requests

Where these capabilities are not available, the platform provides education, simulation, reference information or an authenticated backend service instead.

---

# 21. Current Status

The platform is an actively developed technical environment.

Current focus areas include:

- cybersecurity learning
- OSINT
- networking
- engineering
- data
- Python
- AI security
- technical automation
- private control infrastructure
- hosting portability
- structured technical knowledge

The architecture is being developed so that new capabilities can be added without unnecessarily destabilising existing systems.

---

# 22. Documentation

Key architecture and deployment documents:

- `ARCHITECTURE.md` — platform architecture and provider boundaries
- `DEPLOYMENT_SAFETY.md` — deployment safety rules
- `deployment/PORTABILITY.md` — future hosting migration procedure
- `deployment/runtime-secrets.example` — runtime secret names without secret values

---

# 23. Identity

**HEPHZIBAH BEHULAH**

Engineering · Intelligence · Security

**Observe → Research → Build → Test → Document**

© 2026 Hephzibah Behulah
