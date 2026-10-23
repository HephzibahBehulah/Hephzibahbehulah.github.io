# Engineering handoff

## Current implemented scope
- React/TypeScript/Vite editor with searchable 136-type component catalogue and lazy paged parametric variants.
- SVG symbol rendering for common electrical/electronic and industrial component families.
- Pin-aware component orientation and mirror operations; wire endpoints are reconnected when components move or rotate.
- Orthogonal wires with selectable/deletable segments and editable reference, net label, conductor size, core count and color.
- Explicit junction marker and global net-label connectivity.
- Versioned project JSON, browser autosave, multiple sheets, editable title block, copy/paste, undo/redo and pan/zoom.
- Basic electrical diagnostics and DC operating-point solver with clear model limitations.
- Device list, grouped BOM, terminal plan, wire/cable schedule, sheet-list, SVG and browser print-to-PDF exports.
- Optional SQLite project store with revisions, optimistic concurrency, schema validation and API integration tests.
- Optional server-side structured AI design endpoint; AI API key remains server-side. Without the backend, the frontend clearly labels its local parser fallback.
- English/German menu and core workspace label selection.

## Still incomplete
- Full persistent multi-port electrical graph shared by editing, diagnostics and simulation.
- Nonlinear/transient/AC simulation, ngspice integration, validated semiconductor models and waveform visualization.
- Authoritative standards-derived symbol and rule libraries, DIN/VDE verification, safety/protection coordination and certification.
- Native DWG import, production-grade DWG authoring, DXF import, and full proprietary CAD interchange; the optional LibreDWG DXF-to-DWG converter is experimental.
- Complete German localization, full accessibility audit, automated browser end-to-end tests and million-variant performance benchmarks.
- Production backend deployment, authentication/authorization, user isolation, rate limiting, backup/restore and audit logs.
- Full professional report set with validated terminal/cable cross-references, title block standards, project revisions and approval workflows.

## Safety and claims
Do not claim a million separately engineered manufacturer parts, standards certification, native DWG support, SPICE equivalence, safe installation design or production readiness until specific acceptance tests have been completed.


## New package-generator outputs (2026-10-20)

The application now exposes deterministic concept package generation in Reports and routes matching large prompts from Design Copilot to the package generator. The industrial package exports load and cable schedules, preliminary protection register, equipment coordinates, BOQ, grounding concept, clash register, assumptions and a concept SLD SVG. The smart-substation package exports its architecture and concept SLD. All remain preliminary, and unprovided engineering values are left unset rather than invented.


## Engineering tools added after the initial handoff

The editor now has the following additional, explicitly bounded tools:

- **IFC4 schematic exchange:** extruded proxy geometry for symbols and IFC curve elements for wire routes. Coordinates are schematic logical units interpreted as millimetres. This is a schematic coordination model, not a surveyed building-services model.
- **IFC4 industrial concept massing:** facility zones are extruded using the concept package's dimensions and local coordinates; equipment coordinate entries become generic equipment proxies. It does not infer structural framing, architectural envelope detail, cable trays, real equipment footprints, working clearances, or clash-free routing.
- **DXF R12 export:** exports simplified symbols, tags, and wire segments.
- **Optional native DWG conversion:** `Dockerfile.api` builds GNU LibreDWG's experimental DXF-to-DWG converter behind the Node API. The `docker-compose.yml` configuration binds to localhost only and persists SQLite data. This is an interoperability path, not a guarantee that every DWG version/application accepts the output. The API remains unauthenticated and must not be exposed to the public internet.
- **Cable sizing screening:** computes design current, approximate ambient/grouping/material corrections, an approximate voltage-drop section, optional adiabatic short-circuit section and a basic protective-device current inequality. Ampacity values are illustrative screening values, not an authoritative standards table.
- **Protection relay screening:** sweeps a configurable minimum-to-maximum fault-current range using idealized IEC inverse-time equations and fixed user-entered breaker opening times. A passing sweep is still not proof of overall selectivity.
- **Construction readiness gate:** exports a QA checklist. It intentionally never declares drawings certified or approved.

### Required before engineering release

1. Validate IFC files with an independent IFC4 validator and import them into target BIM viewers; add actual IfcDistributionBoard, IfcCableSegment, IfcProtectiveDevice and manufacturer equipment semantics where appropriate.
2. Replace the screening ampacity table with properly licensed/traceable standards data, complete installation-method and conductor-count matrices, temperature and grouping factors, reactance, harmonic neutral, parallel conductor, PE and voltage-drop checks, and benchmark tests.
3. Build multi-scenario short-circuit and time-current coordination using utility minimum/maximum source data, transformer impedances, motor contribution, CT/VT data, relay tolerances, breaker clearing curves and manufacturer damage curves.
4. Native DWG requires a dependable DWG SDK/interoperability engine; DXF must not be renamed or advertised as DWG.
5. Construction packages require a complete project-specific model, current standards editions, local authority requirements, traceable calculations, QA and sign-off by a qualified professional. Software export cannot provide professional certification.


## Follow-up implementation update — 20 October 2026

- Added a glTF 2.0 export for concept engineering packages. It includes embedded binary cube meshes, separate building/equipment materials, metre-scale dimensions, node coordinates and explicit model limitations. This is useful 3D geometry exchange, but it is not a fully detailed or coordinated electrical BIM.
- Added a fault-current envelope sweep to protection screening. It calculates idealized IEC inverse relay operating times across 2–501 points and includes user-entered fixed breaker opening times. JSON and CSV reports expose the margins and failed points. This remains a screening aid and must not be described as validated protection coordination.
- Added an optional native DWG conversion API endpoint using GNU LibreDWG dxf2dwg. It requires a separately hosted Node API and the executable installed on that host; the browser-only GitHub Pages deployment cannot run this conversion. LibreDWG itself describes DXF-to-DWG writing as experimental and limited to older versions. The application returns a dependency error rather than renaming DXF data to .dwg when the converter is missing.
- Left and right panel visibility now persists in browser storage. Both panels retain edge-reveal controls when hidden; the language selector already persists English, German, Yoruba and Nigerian Pidgin choices.

### Outstanding blockers for the user's requested full scope

1. Native DWG is only available when the optional server converter is deployed and installed. Its output requires independent compatibility testing and is not a production-guaranteed AutoCAD authoring engine.
2. The interactive Three.js viewport and IFC4/glTF exports now cover both the industrial facility and smart-substation concept packages. IFC4 includes spatial zones, common electrical object classes, cable-route elements and concept property sets for tags, dimensions, coordinates and descriptions. Full coordinated BIM still needs manufacturer/architectural/structural models, validated service routing, cable tray/conduit geometry, clearance envelopes, real connectivity, code-compliant spatial coordination and validation in target BIM applications.
3. Protection screening now accepts either idealized IEC inverse-time curves or user-supplied manufacturer time-current points, interpolated in log-log space only inside the supplied range. Validated coordination still needs an actual network short-circuit study, minimum/maximum operating modes, CT/VT behaviour, relay and breaker tolerances, motor starting, transformer inrush, conductor/equipment damage curves, and independent benchmark verification.
4. Detailed cable sizing still needs traceable standards-authoritative ampacity tables, installation methods, conductor/neutral/PE sizing, derating matrices, reactance, harmonics, parallel runs, short-circuit thermal checks and route-specific installation conditions. Current outputs remain screening only.
5. Certified construction drawings cannot be certified by the application or assistant. They require project-specific complete calculations, applicable local code/authority review, quality control and sign-off by a qualified responsible professional.
6. Supabase/Cloudflare are not wired into this repository. Credentials and deployment settings are not present, so no claim is made that authentication, cloud storage, collaboration or production deployment is configured.

Never treat a successful file export or CI build as proof of engineering compliance or professional certification.


## Optional API container

For a local test environment, run `docker compose up --build`. The first build compiles GNU LibreDWG. The API is bound to loopback on the host, stores SQLite data in a named volume and supports the optional AI endpoint when `OPENAI_API_KEY` is supplied. This is intentionally not a public deployment recipe: no authentication, per-user project authorization, abuse controls, or backup/restore exists yet. CI builds and smoke-tests the API container and DWG converter separately from the frontend test/build workflow.


### Updated 3D spatial screening

The concept clash analyzer now checks axis-aligned 3D equipment-box intersections, building-zone plan overlaps, and equipment height against the clear height of a containing zone. It distinguishes plan-only overlap with no vertical intersection from a 3D collision. This is a useful early screening step, not a coordinated BIM clash test: equipment boxes remain generic, building zones assume a zero-metre base, and trays, conduits, service/access envelopes, fire separations, structure and architecture are not modeled.


### Smart-substation concept geometry

The smart-substation package now includes five named site zones, eight equipment envelope proxies and six concept route segments so the 3D viewer, IFC4 and glTF exports can represent a coherent preliminary arrangement. Dimensions and route endpoints are explicit concept assumptions, not manufacturer data or a surveyed site model. Transformer ratings, utility fault data, earthing design, clearances, route burial/trays, fire separation and protection settings remain unverified; this model is not for construction.
