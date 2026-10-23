# VoltPro ElexCAD

VoltPro ElexCAD is an open-source electrical design workbench built with React, TypeScript, SVG and Vite. It is an original project inspired by common professional electrical-engineering workflows; it is not affiliated with proprietary CAD products and does not include their protected assets.

## Run the frontend

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open the Vite URL printed by the terminal.

## Run the optional local API

In another terminal:

```bash
npm run dev:server
```

The API binds to 127.0.0.1:4000 and stores projects/revisions in SQLite at data/voltpro.sqlite by default. Vite proxies /api requests to this server. Configure OPENAI_API_KEY in the server environment to enable structured AI design proposals; the key is never shipped to the browser. Do not expose this development API directly to the public internet: authentication, authorization, rate limits, backups and production deployment are not yet complete.

### Containerized API and optional native DWG conversion

A reproducible Linux image definition is provided in `Dockerfile.api`. It builds GNU LibreDWG and runs the Node/SQLite API in a separate runtime image. For local testing, run `docker compose up --build`; the API is deliberately bound to `127.0.0.1:4000` because user authentication and per-project authorization are not implemented. Project data persists in the `voltpro-data` Docker volume. Set `OPENAI_API_KEY` in the shell environment before starting Compose to enable AI proposals. The first image build compiles LibreDWG and may take several minutes. Its DWG writer is experimental; the API container CI builds the image and smoke-tests the converter and health endpoint. Do not expose this API publicly until authentication, authorization, rate limiting, request logging and backup/restore are implemented.

## Build and test

```bash
npm test
npm run build
npm run test:solver
```

GitHub Actions runs the tests and frontend production build. The backend uses Node's built-in SQLite module and requires a supported recent Node release.

## Current working features

- Interactive SVG schematic editor with component placement, selection, drag movement, editable properties, orthogonal wires, wire selection/deletion, grid/snap controls, pan/zoom, undo/redo, multi-sheet documents and browser autosave.
- Pin-aware component rotation and horizontal mirroring with wire-endpoint reconnection.
- Versioned project JSON import/export, editable project title block, SVG export, browser print-to-PDF, device-list CSV, grouped BOM CSV, terminal plan, cable/wire schedule and sheet-list exports.
- Searchable catalogue with 136 typed base electrical/electronic symbol definitions across sources, passive devices, semiconductors, control, protection, industrial automation, power electronics, logic, measurement, connections and annotations.
- Paged, lazy parametric variants across multiple component families. The generator can address up to one million illustrative variants per family without allocating the entire family at once. These are not one million separately validated manufacturer parts.
- Review-first Design Copilot: optional server-side model-generated proposals when configured, otherwise an explicitly labeled local rule-based proposal. Text instructions and browser speech input require review before applying.
- Project Studio: natural-language brief intake, 30 searchable electrical project families, 5–500-sheet document manifests, deliverable readiness tracking, explicit assumptions/open-inputs, and JSON/CSV exports. Its procedural virtual catalogue exposes 10,000,000 deterministic variants on demand without storing millions of project files.
- Optional model-assisted engineering brief: Project Studio can request a schema-constrained architecture, workstreams, risk register, assumptions, open inputs and verification gates from the private API when `OPENAI_API_KEY` is configured server-side. The deterministic local package remains available without AI; model output is preliminary planning guidance, not validated engineering.
- DC operating-point solver using modified nodal analysis for ideal DC sources, linear resistors, ground and simple contacts, with warnings for unsupported models.
- Basic electrical diagnostics for duplicate references, missing ground, floating pins and unsupported simulation models.
- Optional SQLite project API with revision history, optimistic revision checks and server-side structured AI design endpoint.
- English, German, Yoruba and Nigerian Pidgin language selector; common menu actions are localized and preference is saved in browser storage.
- Persistent Quick Design, Professional CAD and Advanced Engineering workspace profiles. Quick Design maximizes the drawing by collapsing both side panels; Advanced Engineering opens the simulation console. Workspace selection is saved locally.
- Responsive layout adjustments for narrow screens, scrollable menu/toolbar regions, and reduced-motion preference support.
- Collapsible left symbol/project explorer and right properties inspector with edge reveal controls to maximize drawing width.
- DXF R12 exchange export and IFC4 coordination-model export. IFC output contains extruded building spaces, common transformer/distribution-board/protective-device classes and cable-segment route elements; it is an initial coordination exchange model, not a fully classified/validated building-services BIM.
- Cable sizing screening with load current, ambient/grouping/install correction factors, temperature-adjusted resistance and user-supplied reactance, voltage-drop screening, optional adiabatic short-circuit check, protective-device checks, per-section pass/fail CSV, and optional user-provided manufacturer ampacity table JSON. The built-in table remains explicitly illustrative.
- IEC inverse-time fault-current sweep with fixed breaker-time assumptions, optional manufacturer time-current curve points (log-log interpolation with no extrapolation), and selectivity-margin export, plus a construction drawing QA gate report that explicitly identifies unresolved professional review.

## Engineering concept package generator

From **Reports**, choose **Generate industrial facility package** or **Generate 132/33/11 kV smart substation package**. The Design Copilot also routes large facility/substation prompts to the corresponding structured package. The industrial package calculates connected load, demand/diversity assumptions, reserve, apparent demand, preliminary transformer sizing, rated currents and an explicitly idealized transformer-terminal fault estimate. It includes preliminary load/cable/protection schedules, equipment coordinates, BOQ, grounding-grid concept, clash register, deliverable status, and export to JSON, CSV and concept single-line SVG. The smart-substation package now also provides a concept site model with five spatial zones, eight equipment envelopes, six conceptual route records, interactive 3D navigation, IFC4/glTF exports, site-layout SVG and spatial clash screening. Equipment envelope dimensions are generic concept geometry where manufacturer dimensions are unavailable; this is not a coordinated or construction-ready BIM model.

All high-voltage package results are **preliminary concepts, not for construction**. Settings and cable sizes are not fabricated when utility, device, route, soil and protection-study inputs are missing. See [Engineering package handoff](docs/ENGINEERING_HANDOFF.md) for calculation basis and outstanding inputs.

## Important limitations

This is not production-ready or certified electrical engineering software. Transient and AC simulation, validated nonlinear semiconductor models, ngspice, a shared persistent port/net graph, authoritative IEC/DIN/VDE rule checking, complete German localization, native DWG authoring/export, full-classification 3D BIM, multi-scenario protection coordination, authoritative standards-based cable ampacity tables, production-grade certified construction drawings, complete interface localization, authentication and production backend hosting remain incomplete. A symbol being available in the library does not mean it has a validated simulation model. Generated designs and simulation results must be independently reviewed before real-world use.

## Deployment

The GitHub Pages workflow deploys only the static frontend:
https://engineering.hephzibahbehulah.com/voltPro-ElectCAD/

GitHub Pages cannot host the SQLite API or keep an AI API key. Host the backend separately in a secured Node environment before enabling persistent multi-user projects or hosted AI.

**Optional native DWG API container:** the repository Dockerfile builds GNU LibreDWG 0.14 and the Node API. Build it with `docker build -f Dockerfile.api -t voltpro-api .` and run it with `docker run --rm -p 4000:4000 -v voltpro-data:/data -e CLIENT_ORIGIN=https://hephzibahbehulah.github.io voltpro-api`. Set `VITE_API_BASE_URL` to the deployed API origin when building the frontend and configure `CLIENT_ORIGIN` to the exact browser origin. Expose the API over HTTPS in production and add suitable access controls before public use. LibreDWG conversion is experimental and supports only certain older DWG versions; verify every converted file in the target CAD application.


## CAD/BIM exchange and engineering screening

- **File → Export CAD exchange (DXF)** creates an AutoCAD R12-compatible DXF geometry exchange from the active schematic. Symbol graphics are simplified for exchange.
- **File → Export native DWG (LibreDWG server)** calls the optional Node API conversion endpoint. Set `VITE_API_BASE_URL` to the API origin and install GNU LibreDWG's `dxf2dwg` executable on that server. LibreDWG DWG writing is experimental and limited to older DWG versions; validate every converted file in the target CAD application. Without the backend and converter, native DWG export reports the missing dependency instead of generating a fake `.dwg` file. See the [GNU LibreDWG program manual](https://www.gnu.org/software/libredwg/manual/html_node/Programs.html).
- **File → Export 3D BIM exchange (IFC4)** creates an IFC4 exchange model with spatial building zones, semantic transformer/distribution/protective-device classes, generic equipment proxies, cable-segment route elements and `Pset_VoltProConcept` property sets for tags, values, dimensions and coordinates. These are concept proxies, not manufacturer-certified BIM objects.
- **Reports → Generate industrial facility package / Generate 132/33/11 kV smart substation package** opens an interactive Three.js 3D viewport with orbit, pan, zoom, grid/building/equipment visibility toggles, plus IFC4 and embedded-buffer glTF 2.0 exports with cuboid meshes for concept building zones and equipment coordinates. **Run 3D spatial clash check** exports a preliminary axis-aligned 3D overlap report for building zones, equipment collisions, vertical separation and equipment clear-height conflicts. **This is concept massing, not full electrical BIM**: it has no detailed manufacturer geometry, cable trays, routed conduits, architectural/structural coordination, device connectivity in 3D or verified working clearances.
- **Electrical → Cable sizing screening** prompts for load, voltage, route length, power factor, permissible voltage drop, ambient temperature, grouped circuits and protective-device rating. Its ampacity values are deliberately labelled screening values; the selected section must be checked against the applicable IEC/VDE tables and installation details.
- **Electrical → Protection coordination screening** sweeps a configurable fault-current range and exports JSON plus CSV operating-time/margin rows, including user-entered fixed breaker opening times. It remains an idealized IEC inverse-time screening tool, not a validated time-current/selectivity study; manufacturer relay curves, CT checks, breaker curves/tolerances, damage curves and network fault studies are not included.
- **Electrical → Construction drawing QA gate** exports a machine-readable readiness checklist. It cannot certify, seal, sign or approve construction drawings.

The app does not currently connect to Supabase or Cloudflare. No credentials or project accounts are assumed. The local SQLite API and browser autosave remain separate. The optional Docker API is local-only by default and is not a secure public multi-user service. See `docs/ENGINEERING_HANDOFF.md` for engineering assumptions and outstanding validation requirements.


## Native DWG API container

The static GitHub Pages frontend cannot execute native binaries. A separate Linux API host is required for the experimental GNU LibreDWG conversion endpoint. The repository now includes `Dockerfile.api` and a CI build/smoke test for the API image.

Build and run locally (Docker required):

```bash
docker build -f Dockerfile.api -t voltpro-api:local .
docker run --rm -p 4000:4000 -v voltpro-data:/data -e CLIENT_ORIGIN=http://localhost:5173 voltpro-api:local
```

Set `VITE_API_BASE_URL` to the deployed API origin when building the frontend if the API is hosted separately. Keep `OPENAI_API_KEY` on the server only. Back up the persistent `/data` volume. Do not expose the API publicly until authentication, per-user authorization, rate limiting, HTTPS, backup/restore and production security review are in place.

**DWG limitation:** GNU LibreDWG's DXF-to-DWG writer is experimental and can produce files that some CAD programs reject. The endpoint verifies the file signature but cannot certify full AutoCAD compatibility. DXF remains the dependable open exchange fallback. The container provides the conversion executable; it does not make the GitHub Pages frontend a full native-DWG authoring engine.

- **File → Export drawing sheet with title block (SVG)** places the active schematic on an A3-landscape sheet with project number, client, designer, revision, standard, issue date and explicit preliminary/not-for-construction status. It is a drawing-sheet export, not professional certification.
