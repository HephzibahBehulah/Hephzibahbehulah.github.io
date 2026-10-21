# VoltPRo Suite Integration Plan

**Status:** active source audit; implementation must proceed in small, tested changes.  
**Scope:** the connected main website, engineering route host, VoltPRo simulator/academy, PLC, Breadboard, and VoltPro ElexCAD.  
**Rule:** a repository commit, successful build, and production deployment are separate events. Record each independently.

## Source-of-truth and deployment map

| Area | Repository/source | Public route |
|---|---|---|
| Main portfolio and shared platform | `HephzibahBehulah/Hephzibahbehulah.github.io` | https://hephzibahbehulah.com/ |
| Simulator, academy and Breadboard source | `HephzibahBehulah/Hephzibah-VoltPRo` | https://engineering.hephzibahbehulah.com/simulator and /breadboard |
| PLC workspace | Existing PLC source in the VoltPRo repository must be traced; `HephzibahBehulah/VoltProPlc` currently has no files | https://engineering.hephzibahbehulah.com/voltpro-plc/ |
| ElexCAD standalone source | `HephzibahBehulah/VoltPro-ElexCAD` | Legacy repository URL redirects to the integrated deployment |
| ElexCAD integrated source | `apps/voltpro-electcad/` in the main platform repository | https://engineering.hephzibahbehulah.com/voltPro-ElectCAD/ |

The main platform README describes the shared engineering Worker as the deployment surface for the static ElexCAD build. Verify the actual route configuration and artifact provenance before changing deployment wiring. Do not assume similarly named repositories are interchangeable.

## Verified source-level risks to resolve

### P0 — Project integrity and simulation truth

- The VoltPRo engineering audit in `Hephzibah-VoltPRo/docs/ENGINEERING_AUDIT.md` records two project representations: legacy `components` plus `wires.a/b`, and v5 `devices` plus named terminals and `wires.from/to`. Make one tested adapter the import/export boundary; preserve legacy files.
- Verify the audit findings against the current HEAD before changing code. Current engine source already includes `threephase` in source selection and has explicit numeric contact-state handling in some paths, so older audit statements must not be repeated as current defects without rechecking.
- Test named-terminal-to-legacy-pin conversion, relay/contactor contacts, three-phase source behavior, and meter values against the authoritative MNA result. No unsupported component should silently produce a plausible result.
- Keep diagnostics explicit when a model is unsupported, the network is floating/singular, or a result is only approximate.

### P0 — Preserve user work

- Imports must validate and normalize before mutating live editor state.
- Keep recovery/autosave snapshots until the new project is successfully loaded.
- Keep undo/redo, stable device IDs, wire endpoints, project metadata and existing export formats working.
- Add regression tests for every corrected defect before integrating changes.

### P1 — Shared application contract

- Document route ownership and build-artifact provenance for all engineering paths.
- Define a versioned, tool-neutral project-transfer envelope with explicit schema/version, source tool, stable device identities, terminal mappings, units, and unsupported-field warnings.
- Cross-tool conversion must be loss-aware: never silently discard device state, PLC logic, wire attributes, sheets or simulation assumptions.
- Share theme, language, responsive navigation and accessibility conventions without forcing all tools into one rendering or simulation engine.

### P1 — Account, cloud persistence and security

- Local-first save/load/export must continue to work without an account or network.
- Cloud save requires authenticated ownership checks, server-side authorization on every operation, revision/concurrency handling, backups and restore tests.
- Never place provider keys in frontend bundles. Do not expose the ElexCAD development SQLite API publicly; its own README explicitly says authentication and per-project authorization are incomplete.
- Keep owner/admin routes private and separate from public/member authentication. Do not relax existing access controls to make cross-tool features easier.

### P1 — AI and voice

- Treat generated circuits and CAD proposals as review-first drafts with assumptions, warnings, model provenance and explicit user acceptance before applying.
- Voice input must be opt-in, show what will be executed, provide text fallback and never execute destructive edits without confirmation.
- Keep a deterministic local path when AI credentials/services are absent. Report provider unavailability clearly; do not simulate a successful AI response.
- Cross-tool agent actions must use the same validation and authorization boundaries as direct user actions.

## Execution order and acceptance gates

1. **Inventory current HEADs and routes.** Identify route handlers, build scripts, CI workflows, deployment configuration and artifact source for each live tool.
2. **Baseline checks.** Run each repository's existing tests and build in an executable environment; record pre-existing failures separately from regressions.
3. **Repair project interoperability.** Add fixture-based migration and round-trip tests before changing the live editor's save/load path.
4. **Repair simulation consistency.** Compare DC reference circuits, switch/relay states, three-phase topology and meter results to the same solver output. Add explicit failure/warning cases.
5. **Unify shared contracts and UI.** Add cross-tool transfer tests and responsive/navigation checks without removing useful controls.
6. **Secure persistence and AI boundaries.** Use explicit configuration checks and tests for ownership, authorization, revision conflicts, missing credentials and provider failures.
7. **Build and regression gate.** Run the full test suites and production builds for every changed application. Inspect generated routes and assets.
8. **Integrate.** Use a reviewable branch/PR where practical; inspect the diff and CI result. Do not merge a failing or unverified change.
9. **Deploy and smoke-test.** Confirm the actual deployment target, wait for the deployment run, then check public routes, asset loading, project open/save, a known circuit result, PLC Run/Stop and mobile layout.
10. **Document release evidence.** Record exact commit(s), test commands/results, workflow/deployment IDs and remaining limitations. Never claim a live deployment from a source commit alone.

## Immediate next task

Reconcile the project-format adapter and current simulator import/export handlers against the current branch, starting with fixtures for:
- legacy v1/v2 projects,
- v5 projects with named terminal IDs,
- wrapped export envelopes,
- invalid/missing endpoints,
- preservation of unknown-but-supported metadata,
- failed imports leaving the currently open project unchanged.

No live application behavior should be removed merely because a newer module exists. Replace old paths only after equivalent behavior is covered by tests.
