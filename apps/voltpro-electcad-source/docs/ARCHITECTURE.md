# VoltPro ElectCAD architecture

## System boundaries

VoltPro is currently a browser-first React + TypeScript + Vite application, with engineering calculations and data transformations implemented as local modules. The browser is the primary editing environment; the optional Node API is a separate service and is not hosted by GitHub Pages.

- `App.tsx`: application composition, editor interaction state, menus, panels, exports and feature orchestration. This is still a large module and should be decomposed incrementally.
- `src/editor-model.ts`: versioned project document types, import validation/migration, serialization and drawing-level connectivity helpers.
- `src/component-library.ts`: typed symbol catalogue, search, category filtering and lazy family variants. Catalogue presence does not imply a validated simulation model or licensed manufacturer part.
- `src/dc-solver.mjs`: modified nodal analysis for a limited DC operating-point model set; unsupported components must remain warnings rather than silently receiving invented models.
- `src/engineering-tools.mjs` and `src/engineering-package.mjs`: deterministic screening calculations and exchange/concept exports with stated assumptions.
- `src/Engineering3DViewer`: interactive concept-massing viewer; geometry is not a fully coordinated BIM model.
- `server/server.mjs`: optional Node HTTP service backed by SQLite, structured project validation, revision history and optional server-side AI proposals.
- `styles.css`: shared visual system, editor layout and responsive rules.

## Data flow

1. The user edits drawing objects in the browser.
2. Supported edits update the current sheet and the undo/redo history.
3. The document serializer produces a versioned JSON project; browser autosave is separate from server persistence.
4. Optional API writes validate the document and store a revision transactionally in SQLite.
5. Solver and engineering tools receive structured data and return results with explicit limits/assumptions.
6. SVG, CSV, JSON, DXF R12, IFC4, glTF and browser print/PDF exports are separate adapters. A file being emitted does not establish compliance with the target CAD/BIM application or an engineering standard.

## Document and connectivity principles

The visual drawing uses logical document coordinates and stable IDs. A document has schema version 2, a project name, an active sheet ID, sheets, parts, wires and optional title-block metadata. Schema validation rejects malformed or unsupported data. Schema version 1 imports through a migration path.

Drawing geometry and electrical connectivity are not yet one complete shared domain model. Wire segments are represented by endpoint coordinates, and some helpers infer connection groups from geometric points and named labels. Complex crossing/junction topology, automatic segment splitting and a canonical port/net graph remain open engineering work. Never treat an arbitrary crossing as an electrical junction without an explicit rule/object.

## Persistence and hosting

- Browser autosave uses local storage and is not a backup strategy.
- The optional local API stores projects and revisions in SQLite at `VOLTPRO_DB_PATH`; it is not automatically deployed with the static frontend.
- GitHub Pages serves the static client only. A separate backend host and secure production configuration are required for hosted persistence or server-side AI.
- The current backend is not a production multi-user service. Authentication, per-project authorization, tenant isolation, rate limiting, backup/restore, audit logging and deployment security review remain required before public exposure.

## Workspace profiles

Quick Design, Professional CAD and Advanced Engineering are layouts over the same project model, not separate applications. The selected profile is stored in browser local storage. Quick Design collapses the left and right panels; Professional CAD restores both; Advanced Engineering restores both and opens the simulation console. Panel visibility can still be controlled with edge reveal buttons.

## Verification and engineering trust

Use the repository's CI workflow to run `npm test`, `npm run test:solver` and `npm run build`. Numerical features must be validated against explicit reference cases. Electrical installation, protection, cable sizing, BIM, standards and AI-generated designs remain preliminary unless independently validated for the intended application. No generated output should be described as certified or safe for construction solely because the application produced it.
