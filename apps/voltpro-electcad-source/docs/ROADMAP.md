# VoltPro ElectCAD roadmap

This roadmap reflects the current repository and does not imply a feature is complete because its menu item or export exists.

## Completed foundations (repository evidence)

- React, TypeScript and Vite static frontend with a responsive SVG-based schematic editor.
- Versioned JSON document import/export, browser autosave, multiple sheets, edit history, symbol catalogue and common drafting actions.
- Optional SQLite API with project revisions and runtime document validation.
- Limited DC operating-point solver and deterministic engineering screening modules.
- SVG/CSV/JSON and selected DXF/IFC/glTF concept exports.
- English, German, Yoruba and Nigerian Pidgin language selection.
- Quick Design, Professional CAD and Advanced Engineering workspace profiles.
- CI workflow for tests, solver tests and frontend build; GitHub Pages workflow for the static client.

## Priority 1 — verify and stabilize the editor

- Run the full CI suite on each proposed change and add browser-level regression coverage.
- Split the oversized application composition into feature components without changing serialized project behaviour.
- Expand coordinate-transform, wire routing, explicit junction, move/rotate/mirror, multi-sheet and undo/redo tests.
- Complete keyboard-only workflows, focus management, screen-reader labels, contrast review and small-screen browser testing.
- Implement full light and high-contrast themes with a token-based design system.

## Priority 2 — canonical electrical model

- Introduce a stable component/terminal/port schema and a shared net graph independent of rendering geometry.
- Define explicit wire-to-port and junction relationships; test crossing, branch, moved component and deleted segment cases.
- Keep simulator topology and diagnostics consistent with the same canonical graph.
- Add project migration tests and deterministic serialization fixtures.

## Priority 3 — documentation and interoperability

- Continue improving project title blocks, wire numbering, terminal/cable reports, device cross-references and revision history.
- Validate exported DXF/IFC/glTF against independent readers and document interoperability limitations.
- Keep manufacturer part data traceable to licensed sources; do not imply native DWG authoring where only conversion exists.

## Priority 4 — simulation

- Add a vetted SPICE adapter after model mapping and reference-circuit criteria are defined.
- Add transient and AC analysis only with solver verification, settings validation, result units and explicit unsupported-model reporting.
- Never substitute a plausible-looking plot for a solver result.

## Priority 5 — backend and release security

- Add authentication, per-project authorization, tenant isolation, rate limiting, audit logging and backup/restore before exposing the API publicly.
- Document database migrations and recovery tests.
- Add dependency/license review and security scanning to CI.
- Verify deployment from the actual hosted service; GitHub Pages only hosts the frontend.

## Current continuation validation

The workspace-profile/responsive-layout branch has source and documentation changes. Local build/test execution was unavailable in the repository-editing session; successful CI and interactive browser verification remain required before merge. Engineering outputs remain preliminary and require independent professional review for real installations.
