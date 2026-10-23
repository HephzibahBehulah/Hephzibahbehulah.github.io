# Implementation plan and verified scope

## Repository audit
- Root application is a React/TypeScript/Vite frontend and is deployed as a static GitHub Pages site.
- The optional SQLite API is a separate Node service under server/server.mjs; GitHub Pages does not execute it.
- The application is an open-source starter workbench, not a certified electrical CAD or SPICE replacement.

## Implemented in the current branch
- [x] Typed document schema, schema migration, validation, import/export and browser autosave.
- [x] Searchable component library with 136 base component types and grouped categories.
- [x] Paged lazy parametric value variants with a one-million-index range per selected family.
- [x] SVG rendering for common passive, semiconductor, switching, source, motor, logic and industrial component families.
- [x] Pin-aware 1-, 2- and 3-pin geometry for ground, terminals, transistors and op-amp/logic-gate families.
- [x] Orthogonal wire drawing, wire selection/deletion, reference and label editing, gauge/core/color metadata.
- [x] Explicit junction markers and global named-net connectivity.
- [x] Undo/redo, copy/paste, duplicate, rotation, horizontal mirror and wire endpoint reconnection on component movement/rotation/mirroring.
- [x] Multi-sheet add/rename/duplicate/delete, project title-block metadata and printable title block.
- [x] DC MNA operating-point solver for ideal DC voltage sources, linear resistors, ground and simple contacts.
- [x] Basic diagnostics for duplicate references, missing ground, floating pins and unsupported DC models.
- [x] Device list, grouped BOM, terminal plan, wire/cable schedule, sheet-list, SVG and browser print-to-PDF exports.
- [x] Optional SQLite project API with revision history, revision conflict detection, runtime schema validation and API integration tests.
- [x] Optional server-side structured AI proposal endpoint; browser integration uses it when available and explicitly falls back to a local parser otherwise.
- [x] English/German menu and core workspace controls.
- [x] CI test/build workflow and static GitHub Pages deployment workflow.

## Not complete and must not be represented as complete
- Full persistent port/net graph shared by editor, diagnostics and simulator; automatic wire splitting/merging and advanced junction topology.
- Nonlinear semiconductor models, transient analysis, AC analysis, waveform viewer, thermal simulation, ngspice integration and manufacturer model import.
- Authoritative IEC 60617 symbols and verified DIN/EN/VDE rule engine or installation safety checks.
- Native DWG/DXF import/export and complete EPLAN/AutoCAD interoperability.
- Complete German localization, accessibility audit, browser end-to-end testing and performance tests at million-variant browsing scale.
- Production backend deployment, authentication/authorization, tenant isolation, backups, migrations, rate limits and audit logging.
- Fully automated professional terminal, cable, cross-reference, protection coordination and revision-controlled engineering document sets.

## Validation
- npm test covers document schema/geometry/connectivity, catalogue generation, DC solver reference cases and SQLite API CRUD/revision behavior.
- npm run build validates TypeScript and creates the static production frontend.
- Passing CI does not imply safety, standards compliance, full product completeness or suitability for live installation design.


## Continuation update — workspace profiles and responsive layout

- [x] Added persistent **Quick Design**, **Professional CAD**, and **Advanced Engineering** workspace profiles over the existing editor model. Quick Design collapses both side panels; Professional CAD restores both; Advanced Engineering restores both and opens the simulation console. The selected profile is stored locally.
- [x] Removed the fixed 800 px document minimum width and added small-screen header, menu, toolbar, panel, dock, modal, and status-bar layouts. Reduced-motion preferences are respected.
- [x] GitHub Actions CI completed successfully on the pull request: `npm test`, `npm run test:solver`, and `npm run build` all passed. The pull request was squash-merged to `main`.

## Verification status for this continuation

- Changes were developed on `feature/workspace-profiles-responsive`, verified by the GitHub Actions `Validate VoltPro` workflow, and merged to `main` in commit `270932c3eb466aed2408aa5144dde6d5d17f98d8`.
- CI ran under Node.js 22. Dependency installation, `npm test`, `npm run test:solver`, and `npm run build` all completed successfully.
- Interactive browser verification at desktop/tablet/phone widths has not been performed in this session. GitHub Pages deployment should be checked separately; a passing frontend build alone does not prove deployment availability.


## Follow-up documentation and contributor workflow

- [x] Document workspace profile behaviour and responsive layout in README and roadmap.
- [x] Add an architecture guide covering frontend/editor/backend boundaries and current trust boundaries.
- [x] Add contributor guidance and a changelog entry for the continuation.
- [x] Confirm CI completion; changes merged after the workflow passed.
- [ ] Validate the interface in real desktop and mobile browsers and verify the GitHub Pages deployment.


## Continuation update — Project Studio and procedural catalogue

- [x] Added a Project Studio accessible from **Reports → Open Project Studio (5–500 sheets)**.
- [x] Added 30 searchable project families covering industrial facilities, smart substations, solar/BESS, buildings, residential, critical facilities, EV charging, controls, water treatment, earthing/lightning and more.
- [x] Added a deterministic virtual catalogue with 10,000,000 addressable variants. Variants are computed on demand; the repository does not contain ten million materialized projects.
- [x] Added structured project metadata, a 5/25/50/100/250/500-page sheet manifest, deliverable-readiness statuses, engineering assumptions, next-required-input lists, JSON export and CSV exports.
- [x] Reuses the existing industrial-facility and smart-substation concept packages where the prompt classifier recognizes those project families.
- [x] Added regression tests for catalogue indexing, project classification, page manifest sizes, CSV output, and input validation.

### Explicit limits
- A generated page manifest is not the same as 500 fully drawn, coordinated construction sheets. Pages marked scaffolded require project-specific design work.
- Only existing supported concept packages provide built-in engineering model data. Other template families provide a structured scope/manifest and clearly identified outstanding deliverables, not fabricated drawings or calculations.
- Parsed kW totals are rule-based screening only. They are not a substitute for a checked load schedule, demand study, protection coordination, cable selection, earthing design, arc-flash analysis, or licensed standards review.
- Supabase and Cloudflare have not been changed or deployed as part of this feature. The local/static workflow needs no credentials; persistent multi-user cloud storage or production AI execution would require secure backend/auth configuration and explicit deployment verification.

## Validation for Project Studio

- `tests/project-studio.test.mjs` exercises ten-million-index addressing, prompt routing, 100/500-sheet manifests, CSV output and validation errors.
- GitHub Actions `Validate VoltPro` run **420** passed against the Project Studio integration: dependency installation, `npm test`, `npm run test:solver`, and `npm run build` all completed successfully.
- Manual browser interaction and real CAD export inspection remain separate acceptance checks.


## Continuation update — model-assisted engineering brief

- [x] Added an optional server-side `/api/ai/project-package` endpoint with strict structured output for design principles, architecture roles/rating basis, workstreams, risk register, assumptions, open inputs, and validation gates.
- [x] Added a Project Studio action to request and display the model-assisted brief while retaining deterministic offline/local package generation.
- [x] The API key remains server-side; the endpoint validates request bounds and top-level response structure, and explicitly labels results as preliminary.
- [x] Added an API integration test for the unconfigured-key response. GitHub Actions `Validate VoltPro` run 430 passed for the model-assisted endpoint and Project Studio integration (`npm test`, `npm run test:solver`, and `npm run build`).

### Configuration and limits

- Set `OPENAI_API_KEY` in the private API server environment to enable the model-assisted brief. The key must never be placed in frontend variables or committed to the repository.
- Static GitHub Pages alone cannot run the Node API. Configure a secure server deployment and `VITE_API_BASE_URL` to use the model endpoint from a deployed frontend.
- Do not expose the current development API publicly until authentication, authorization, rate limiting, tenant isolation, audit logging and backup/restore are implemented.
- The AI produces planning guidance and review gates, not certified calculations, final protection settings, or construction-ready CAD drawings.
