# VoltPro ElectCAD — engineering handoff and roadmap

## Product direction
Build an original, modular electrical CAD and circuit-design environment with workflows familiar to electrical engineers: project/page structure, symbol libraries, wire numbering, cross-references, terminal planning, bills of materials, reports, and eventually circuit simulation. Product inspiration may be drawn from public workflows in EPLAN Electric P8, WSCAD ELECTRIX, and AutoCAD Electrical; do not copy proprietary UI assets, source code, libraries, or branding.

## Milestone 0 — scaffold (current)
- [x] React/TypeScript/Vite frontend
- [x] Express/TypeScript REST API
- [x] CAD-like layout with menu, toolbar, symbol palette, canvas, project tree, inspector
- [x] Place basic symbols on canvas
- [x] Select and inspect placed symbols
- [x] Draw simple wires between points
- [x] Backend health and starter project endpoints
- [x] CI build workflow
- [ ] Persist projects in a database
- [ ] Add unit and end-to-end tests

## Milestone 1 — editor foundations
1. Define versioned JSON schema for projects, sheets, symbols, ports, wires, labels, and metadata.
2. Implement undo/redo command history and autosave.
3. Add selection rectangle, move, rotate, duplicate, delete, align, snap-to-grid, zoom-to-fit, and keyboard shortcuts.
4. Make wire endpoints attach to symbol ports rather than arbitrary coordinates.
5. Add layers, sheet title blocks, page numbering, and print/PDF export.
6. Add component library search, favorites, and user-defined symbols.

## Milestone 2 — electrical intelligence
1. Model electrical connectivity as a graph, independent from drawing geometry.
2. Add stable component IDs, terminal IDs, net IDs, and wire IDs.
3. Implement net highlighting and connectivity validation.
4. Add configurable wire numbering and cross-reference generation.
5. Generate terminal strip plans, cable schedules, bills of materials, and device lists.
6. Add manufacturer part data only from licensed, traceable sources.

## Milestone 3 — standards and interoperability
1. Add symbol variants and documented mapping to relevant IEC 60617 / EN / DIN conventions where legally available.
2. Treat standards compliance as versioned rules with tests and explicit coverage; never advertise compliance before verification.
3. Add import/export adapters: SVG/PDF first, then DXF/DWG via a suitable licensed SDK or tested open-source library.
4. Add project exchange format and migration/version support.
5. Verify German-language labels, decimal formatting, units, and DIN rail/control-cabinet workflows.

## Milestone 4 — simulation
1. Create a separate simulation domain model that maps schematic components to electrical models.
2. Integrate a SPICE-compatible solver or use a clearly documented adapter.
3. Support DC operating point first, then transient and AC analysis.
4. Display plots with units, analysis settings, and solver warnings.
5. Keep simulation separate from drafting geometry and report unsupported models explicitly.

## Milestone 5 — reliability and release
- Authentication, authorization, project sharing, audit trail, backups.
- Database migrations and API validation.
- Threat model, dependency scanning, CI tests, accessibility checks.
- Performance tests for large sheets and symbol libraries.
- Engineering review and clear disclaimer for non-certified outputs.
- Never use output as the sole basis for safety-critical installation decisions.

## Suggested architecture
- Frontend: React + TypeScript + Vite; SVG-based drawing layer initially.
- Backend: Node.js + Express + TypeScript with Zod validation.
- Storage: PostgreSQL for multi-user deployments; SQLite for local/single-user prototype.
- Simulation: isolated solver adapter, ideally a vetted SPICE implementation.
- Export: SVG/PDF first; DWG/DXF through a compliant SDK/adapter.
- Tests: Vitest for unit tests, Playwright for browser flows, API integration tests.

## First next tasks for the next engineer
1. Install dependencies and verify both builds.
2. Add Vitest and tests for editor actions and API routes.
3. Replace demo in-memory project with a versioned persistence layer.
4. Refactor `App.tsx` into toolbar, palette, canvas, inspector, and project-tree components.
5. Create a proper port/net model and endpoint snapping before implementing electrical validation.


## Implementation status — 20 October 2026

### Implemented and available in the editor
- [x] Collapsible project/symbol palette and properties inspector with edge reveal controls.
- [x] English, German, Yoruba and Nigerian Pidgin selector; common menu and core panel/catalog labels are localized.
- [x] DXF R12 schematic exchange with separate drawing layers and simplified common symbol geometry.
- [x] IFC4 exchange for schematic component proxies and wire routes; industrial facility and smart-substation concept massing with semantic electrical classes and `Pset_VoltProConcept`/cable-route property sets.
- [x] Interactive Three.js viewport with orbit/pan/zoom, building/equipment/route visibility toggles, reset view and category-based equipment envelope dimensions for facility/substation concepts.
- [x] Cable-sizing screening (load current, correction factors, voltage-drop, optional adiabatic screening, protective-device checks, and user-supplied manufacturer ampacity tables) with assumptions included in the report.
- [x] IEC inverse-time fault-current sweep with independent upstream/downstream curves, optional manufacturer TCC point interpolation without extrapolation, fixed breaker-time assumptions, selectivity margins and CSV export.
- [x] Construction readiness QA checklist export, explicitly not a certification.
- [x] A3-landscape SVG drawing-sheet export with project/client/designer/revision/standard/date title block and explicit preliminary/not-for-construction status.
- [x] Automated tests for engineering tools plus CI production build.

### Not yet production-grade / must not be represented as complete
- Production-grade native DWG authoring/export; optional LibreDWG conversion is experimental and runs only through the separately hosted API container.
- Fully classified, surveyed, routed 3D electrical BIM with manufacturer equipment, coordinated architectural/structural/MEP models and automated clash detection.
- Standards-authoritative cable sizing data for all installation methods, verified short-circuit and voltage-drop studies.
- Multi-scenario, manufacturer-curve validated protection coordination and arc-flash analysis.
- Certified construction drawings; these require a complete project-specific design and professional review/signature.
- Connected Supabase/Cloudflare deployment; account credentials and production bindings have not been supplied to this repository.

Do not mark these items complete based solely on export file creation or screening calculations. Keep engineering inputs, assumptions, test coverage and verification status traceable.


### Follow-up engineering exchange work
- [x] Embedded-buffer glTF 2.0 concept model export with building-zone, equipment and schematic cable-route meshes.
- [x] IFC4 export includes spatial building spaces, common transformer/distribution-board/protective-device classes and cable-segment route elements; IFC remains a coordination exchange, not a fully validated BIM deliverable.
- [x] 3D axis-aligned equipment/building clash screening with vertical separation and clear-height checks, exported as JSON and CSV.
- [x] Protection fault-current envelope sweep with relay times, fixed breaker-time assumptions, margin results and CSV export.
- [x] Cable screening expanded with phase count, material, insulation, conductor operating temperature, reactance, route length, grouping, installation factor, voltage-drop limit, optional adiabatic fault inputs, and a per-section pass/fail table; JSON and multiple CSV reports.
- [x] Optional LibreDWG-backed server endpoint for DXF-to-DWG conversion, with explicit dependency and conversion failure reporting. This is experimental and does not guarantee AutoCAD-compatible files.
- [x] Docker API image and local-only Docker Compose profile with persistent SQLite volume; CI builds and smoke-tests the container.
- [x] Interactive Three.js concept viewer for industrial facility zones and equipment proxies.
- [x] Persistent left/right sidebar visibility preferences and dedicated collapse icons; voice recognition locale follows the selected interface language where browser support exists.

The glTF model and axis-aligned 3D clash check are not full coordinated BIM. The cable and protection modules remain engineering screening, not validated standards studies. Native DWG conversion depends on a separately hosted API and an installed LibreDWG binary. Professional construction certification remains outside the application's capability.


## Continuation — 20 October 2026

- [x] Add persistent Quick Design, Professional CAD and Advanced Engineering workspace profiles over the shared editor model.
- [x] Add small-screen responsive header, menu, toolbar, dock and modal behaviour; remove the fixed 800 px body minimum width.
- [x] Respect `prefers-reduced-motion`.
- [ ] Verify current branch using GitHub Actions, exercise profile switching in a browser, and review the UI at desktop/tablet/mobile sizes.
- [ ] Continue with accessibility testing, full light/high-contrast themes, and component-level editor decomposition without disrupting current features.

These UI improvements do not change the electrical verification scope. Circuit simulation, installation calculations, CAD exchange, BIM proxies and AI proposals retain the limitations described above.
