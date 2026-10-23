# VoltPRo Engineering Remediation Plan

**Created:** 2026-10-09  
**Audit baseline:** `ece4df043764e38eafacc671e418c611a2b0ac45`  
**Companion report:** [ENGINEERING_AUDIT.md](ENGINEERING_AUDIT.md)

This is a prioritised plan based on the source-level audit. It is intentionally a remediation checklist, not a claim that any fix has already been implemented. Do not redesign the visual theme, migrate frameworks, or remove existing features as part of these steps. Each step must be implemented, tested, committed, and reported separately before proceeding.

## Priority definitions

- **P0 — simulation integrity:** the current result can be inconsistent with intended topology/device behaviour, or a project may fail to load correctly.
- **P1 — core functionality:** required simulation, measurement, state, or editing integration is missing.
- **P2 — reliability and maintainability:** validation, history, lifecycle, and documentation must be hardened.
- **P3 — release verification:** repeatable integration, browser, and deployment acceptance.

## Execution rules

1. Start from the current `main` commit and inspect the working tree before each change.
2. Do not mix unrelated steps in one commit.
3. Do not alter appearance or theme while fixing electrical logic.
4. Keep existing v1 project import/export working through explicit migration fixtures.
5. Do not describe catalogue metadata as an executable or validated electrical model.
6. Every solver-affecting change needs analytical reference tests and a reproducible circuit fixture.
7. No step is complete because source code compiles. It is complete only when its acceptance tests pass and the result is reported.
8. Never claim compliance with IEC/DIN/VDE/NEC or manufacturer specifications without a documented, applicable validation basis.
9. Treat this as an educational simulator, not a substitute for certified engineering design or commissioning.

---

## P0 — Canonical project and electrical topology

### Step 1 — Freeze and document the existing data contracts

**Audit links:** F-01, F-02, F-08  
**Depends on:** None  
**Expected files:** `docs/ENGINEERING_AUDIT.md`, schema/contract tests only

- [ ] Record exact current shapes for legacy component, wire, v5 device, terminal, net, simulation state, and export envelope.
- [ ] Add fixture files for a legacy v1 DC circuit and a v5 circuit with named terminals.
- [ ] Add tests documenting the current behaviour before changing adapters.
- [ ] Identify which fields are required, optional, migrated, or deprecated.
- [ ] Do not change application behaviour in this step.

**Acceptance**
- Contract documentation matches actual source.
- Fixtures parse as data and are committed.
- Existing runtime files remain unchanged.

### Step 2 — Define one canonical project schema

**Audit links:** F-01, F-08, F-11  
**Depends on:** Step 1

- [ ] Choose one canonical project shape for devices, terminals, wires, nets, parameters, state, panel, PLC, and simulation.
- [ ] Keep UI coordinates separate from electrical terminal identity.
- [ ] Require stable unique device IDs, terminal IDs, and wire IDs.
- [ ] Define parameter units, defaults, limits, and migration rules.
- [ ] Define versioning and unknown-field policy.
- [ ] Specify how older `components/props/a/b` projects map to `devices/parameters/from/to`.

**Acceptance**
- Schema tests cover valid and invalid projects.
- Every required field and migration rule is explicit.
- No active runtime is switched over until migration fixtures pass.

### Step 3 — Implement one safe legacy-to-canonical migration boundary

**Audit links:** F-01, F-02, F-08  
**Depends on:** Step 2

- [ ] Route UI Load and import through one normalizer.
- [ ] Migrate `components` to canonical devices.
- [ ] Map legacy wire endpoints `a/b` to canonical `from/to`.
- [ ] Map numeric terminal indexes to the terminal IDs defined by the selected component model.
- [ ] Preserve project name, settings, parameters, panel, PLC, and supported metadata.
- [ ] Reject malformed or ambiguous endpoint references with an actionable message.
- [ ] Keep a round-trip fixture for a real legacy project.

**Acceptance**
- Importing the current v1 export restores the same devices and wires.
- Importing a valid v5 project does not create an empty canvas.
- Unknown or duplicate IDs are reported; no wire is silently dropped.
- Export/import round-trip preserves electrical connectivity.

### Step 4 — Make terminal identity stable from palette to solver

**Audit links:** F-02  
**Depends on:** Steps 2–3

- [ ] Generate terminal instances from each component's model definition.
- [ ] Use the same terminal ID in SVG data attributes, wire storage, terminal graph, netlist, and measurement mapping.
- [ ] Do not infer electrical identity from SVG coordinates, pin order, or label text.
- [ ] Keep display label and stable terminal ID as separate fields.
- [ ] Validate endpoint ownership and existence on every connection.
- [ ] Define rotation and movement as presentation changes that cannot alter endpoint IDs.

**Acceptance**
- Test base components and registry components with `0/1` and `T1/T2`-style terminals.
- Moving/rotating a component does not change connected terminal IDs.
- Every stored wire resolves to two valid terminals or is rejected.

### Step 5 — Make the terminal graph and net resolver authoritative

**Audit links:** F-02, F-03  
**Depends on:** Steps 2–4

- [ ] Call terminal graph validation before a solve.
- [ ] Resolve nets once and pass that exact result into netlist generation.
- [ ] Reject unknown endpoints, duplicate identities, invalid domain combinations, and malformed wires before solving.
- [ ] Keep separate device-internal branches distinct from external wire connectivity.
- [ ] Define explicit junction/crossing semantics; never connect terminals merely because symbols or wires are visually close.
- [ ] Remove the diagnostic-only duplicate topology path only after the authoritative path has equivalent tests.

**Acceptance**
- Unit tests cover simple series, parallel, branched, disconnected, and invalid circuits.
- Net IDs are deterministic for the same project.
- The solver receives the resolved net structure and cannot silently re-infer a different topology.

### Step 6 — Connect the canonical netlist to the MNA solver

**Audit links:** F-03, F-06  
**Depends on:** Steps 2–5

- [ ] Define a solver input contract based on canonical devices, terminals, resolved nets, branches, parameters, and simulation mode.
- [ ] Stop using a separate ad hoc legacy wire union inside the active solver once canonical parity tests pass.
- [ ] Define ground/reference-node selection and floating-circuit diagnostics.
- [ ] Validate matrix singularity and unsupported element types.
- [ ] Return structured diagnostics as well as numeric results.
- [ ] Keep existing DC/AC/transient API behaviour through compatibility tests where it is supported.

**Acceptance**
- A 12 V source across 100 Ω produces 0.12 A and 1.44 W within defined tolerances.
- A 12 V source across 1 kΩ produces 0.012 A and 0.144 W within defined tolerances.
- Parallel branches agree with hand calculations.
- Open, floating, shorted, contradictory, and unsupported circuits produce explicit statuses rather than plausible numbers.

---

## P0 — Relay, contactor, protection, and motor correctness

### Step 7 — Define executable device-model contracts

**Audit links:** F-04, F-06, F-11, F-12  
**Depends on:** Steps 2 and 6

- [ ] Distinguish catalogue record, visual symbol, behavioural model, and executable electrical model.
- [ ] Define model inputs/outputs: terminal map, internal branches, parameter schema, units, state transitions, solver coupling, diagnostics, and supported domains.
- [ ] Make unsupported models report `catalogue-only` or `behavioural-only`.
- [ ] Remove any unsubstantiated `validated: true` designation or link it to concrete passing validation cases.
- [ ] Register models under explicit canonical IDs; do not silently fall back to a resistor for an unknown type.

**Acceptance**
- Each simulation-capable model can be traced from registry entry to actual solver branch generation.
- Unknown models fail with a visible diagnostic.
- Model status distinguishes “present”, “executable”, and “numerically validated”.

### Step 8 — Implement relay and contactor coil/contact coupling

**Audit links:** F-04  
**Depends on:** Steps 4–7

- [ ] Represent coil terminals explicitly (for example A1/A2).
- [ ] Represent each main contact pole as its own independent conductive branch.
- [ ] Represent each auxiliary NO/NC contact as its own branch and define the normally-open/normally-closed default state.
- [ ] Compute coil voltage/current from the solved circuit, not from a manually set `closed` property.
- [ ] Derive energized/de-energized state using rated coil data, hysteresis or state-transition rules where supported, and explicit AC/DC model assumptions.
- [ ] Re-resolve/re-solve when contact state changes, with convergence limits and event logging.
- [ ] Replace loose truthiness checks with typed state values.

**Acceptance**
- De-energized coil: NO contacts open and NC contacts closed.
- Energized coil: NO contacts closed and NC contacts open.
- Each main pole switches independently in the circuit graph.
- A holding auxiliary contact can maintain coil power after Start is released.
- Test proves the contact change alters actual branch current and downstream voltage, not only a returned JSON object.

### Step 9 — Implement protection-device trips as electrical state changes

**Audit links:** F-06, F-12  
**Depends on:** Steps 6–8

- [ ] Map fuse, MCB/MCCB, RCD/RCBO, and overload states to explicit branches.
- [ ] Define trip inputs and assumptions; do not treat simple current thresholds as manufacturer time-current curves.
- [ ] Keep residual-current logic separate from overcurrent logic.
- [ ] Apply trip state to the solver and reset only through defined actions.
- [ ] Show trip reason, measured quantity, threshold, and model limitation.

**Acceptance**
- Normal current leaves the device closed.
- Defined overcurrent/residual-current test cases trip the correct model.
- Tripped devices interrupt the actual circuit in the next solved state.
- Tests do not imply certified protective-device coordination.

### Step 10 — Repair the Motor Starter demo using a real three-phase path

**Audit links:** F-05, F-04, F-06  
**Depends on:** Steps 6–9

- [ ] Decide and document whether three-phase simulation is supported by the active solver.
- [ ] If supported, model three phase conductors and phase-aware voltage/current quantities; do not map the source to a two-terminal DC element.
- [ ] Model contactor poles L1/T1, L2/T2, L3/T3 independently.
- [ ] Model a motor using supported electrical inputs and an explicit simplified motor assumption set.
- [ ] Implement DOL control circuit with Stop NC, overload NC, Start NO, KM coil, and KM holding auxiliary NO.
- [ ] Keep control and power circuits separate but coupled through contactor state.
- [ ] If a fully coupled three-phase solver is not yet available, change only the demo's status text to clearly identify it as a behavioural training sequence rather than a solved electrical circuit.

**Acceptance**
- Three-phase source is recognized by the solver.
- Loss of one phase is observable in the motor model.
- Stop, overload, and coil de-energization open the power contacts.
- Start energizes the coil; the holding contact maintains it after Start release.
- Expected values are checked against a stated simplified model, not claimed as manufacturer-exact motor behaviour.

---

## P1 — Measurements, visual states, and lifecycle

### Step 11 — Make instruments consume the authoritative solver result

**Audit links:** F-07  
**Depends on:** Steps 5–6

- [ ] Save the latest successful solver result with project revision/version.
- [ ] Route voltage, current, resistance, continuity, and three-phase instruments through one measurement API.
- [ ] Use canonical net IDs for voltage and canonical branch IDs for current.
- [ ] Mark results stale when topology or relevant parameters change.
- [ ] Return “not solved”, “floating”, “open”, or “unsupported” explicitly instead of inventing zero.
- [ ] Remove the approximate legacy series-only solver from instrument click handlers once regression parity is established.

**Acceptance**
- Meter values match solver node/branch results.
- Parallel networks, open switches, and disconnected measurement points have tested results.
- Changing a parameter invalidates or recomputes the reading.

### Step 12 — Make device visuals reflect solved state

**Audit links:** F-03, F-04, F-06  
**Depends on:** Steps 6–11

- [ ] Define visual states from the canonical solver/device state: energized, de-energized, tripped, faulted, unsupported, and stale.
- [ ] Keep visual state separate from user-editable model parameters.
- [ ] Update wires, lamps, contactors, motors, and protection devices only from solved state.
- [ ] Surface solve errors beside the affected device/net where possible.
- [ ] Do not infer current flow solely from `S.running`.

**Acceptance**
- Visual state matches computed branch state.
- Failed or stale solves do not leave the last result looking current.
- Stopping simulation has defined behaviour and does not mutate saved design topology.

### Step 13 — Integrate undo/redo with canonical project commands

**Audit links:** F-09  
**Depends on:** Steps 2–5

- [ ] Wire the existing command module into active UI actions.
- [ ] Implement transactions for place, connect, disconnect, move, rotate, property edit, duplicate, delete, import, and relevant project settings.
- [ ] Preserve stable terminal IDs and endpoint references across undo/redo.
- [ ] Clear redo history on a new command.
- [ ] Clear pending wire selection after undo, redo, delete, load, and reset.
- [ ] Avoid storing transient render/DOM state in project history.

**Acceptance**
- Every command can be undone and redone exactly.
- Removing a component removes its wires; undo restores both.
- Undo/redo never creates dangling wire endpoints.
- Repeated undo/redo does not mutate the original snapshot.

### Step 14 — Define project and simulation lifecycle

**Audit links:** F-08, F-10  
**Depends on:** Steps 2–6 and 11–13

- [ ] Define what New, Load, Save, Run, Stop, Reset, and project edits do to solver state, meters, diagnostics, wire selection, undo/redo, and device state.
- [ ] Stop or invalidate simulation when the project changes.
- [ ] Clear transient interaction state on project load/reset.
- [ ] Ensure load is atomic: parse, migrate, validate, then replace the current project only on success.
- [ ] Preserve the current project if import fails.
- [ ] Add a dirty-project indicator only if it can be implemented without changing the agreed visual theme.

**Acceptance**
- Invalid import leaves the existing project untouched.
- New/Load/Reset cannot leave an old wire endpoint selection active.
- Stale readings are cleared or clearly marked.
- Save/load round-trips the canonical project and simulation configuration.

### Step 15 — Normalize parameter schema and units

**Audit links:** F-11, F-12  
**Depends on:** Steps 2 and 7

- [ ] Store model parameters in one canonical field and separate dynamic state.
- [ ] Define units and conversions for resistance, voltage, current, capacitance, inductance, power, speed, torque, and time.
- [ ] Enforce required values, valid ranges, and type constraints.
- [ ] Keep legacy parameter aliases in migration code, not scattered solver conditionals.
- [ ] Surface invalid parameters before solving.

**Acceptance**
- UI value, saved value, model input, and displayed unit agree.
- Invalid, NaN, infinite, and out-of-range values are rejected or handled explicitly.
- Model parameter fixtures cover supported minimum, nominal, and maximum values.

---

## P2 — Engineering evidence and automated quality

### Step 16 — Add analytical reference tests per executable model

**Audit links:** F-12, F-13  
**Depends on:** Steps 6–11 and 15

- [ ] Create a model validation manifest: model ID, domain, reference case, expected outputs, tolerance, limitations, and test file.
- [ ] Test resistor, source, switch, diode, capacitor, inductor, fuse/breaker, relay/contactor, and motor separately where supported.
- [ ] Test the same devices in integrated circuits.
- [ ] Require an evidence-backed validation status before showing a model as validated.
- [ ] Keep catalogue count separate from executable/validated model counts.

**Acceptance**
- Each `validated: true` model has named passing numerical/state tests.
- Test tolerances are explicit and justified.
- Unsupported analysis domains are documented and rejected clearly.

### Step 17 — Expand integration and regression tests

**Audit links:** F-01 through F-13  
**Depends on:** Steps 1–16

- [ ] Add browser-level tests against the actual `simulator.html` entry point.
- [ ] Test place → wire → resolve → netlist → solve → measure → visual update.
- [ ] Test registry-backed named terminals and legacy migration.
- [ ] Test relay/contactor coil coupling, auxiliary holding contact, overload trip, and phase loss.
- [ ] Test save/load and undo/redo after every topology mutation.
- [ ] Test unsupported models and invalid circuits.
- [ ] Keep the existing `npm test` and both validation scripts as required CI gates.

**Acceptance**
- Unit, contract, integration, and browser tests run in CI.
- Failures identify the stage and component/net involved.
- Test output includes pass/fail counts and non-zero exit status on failure.

### Step 18 — Verify PWA/offline and static deployment

**Audit links:** release verification  
**Depends on:** Stable app and tests

- [ ] Inspect service-worker asset list and cache versioning.
- [ ] Test fresh install, repeat visit, update, offline start, offline project open, and recovery after reconnect.
- [ ] Confirm all required component JSON and symbol assets are cached or clearly unavailable offline.
- [ ] Verify GitHub Pages deploy workflow success and deployed commit SHA.
- [ ] Test the deployed URL in a clean browser session, not only the development source.
- [ ] Check browser console for missing scripts, failed registry fetches, and service-worker errors.

**Acceptance**
- A clean deployment loads the expected commit and all required scripts.
- Offline claims are limited to flows actually tested without network access.
- Deployment success is not treated as simulator acceptance.

### Step 19 — Release acceptance and audit closure

**Audit links:** F-13  
**Depends on:** Steps 1–18

- [ ] Re-run all unit tests, validators, and browser integration tests from a clean checkout.
- [ ] Run reference circuits: 12 V / 100 Ω, 12 V / 1 kΩ, parallel branches, open/closed switch, diode, RLC where supported, relay/contactor, and DOL starter.
- [ ] Test legacy import/export and v5 round-trip.
- [ ] Test all topology edits and undo/redo.
- [ ] Test meter consistency and stale-state handling.
- [ ] Record commit SHA, commands, exit codes, test counts, browser version, deployment URL, and deployment status.
- [ ] Update the audit with findings fixed, remaining limitations, and links to the exact commits.

**Acceptance**
- All P0 tests pass before any P1/P2 step is declared release-ready.
- No known critical or high-severity topology/model integration defect remains unaddressed.
- Any unsupported feature is clearly labelled and excluded from claims of validated electrical simulation.

---

## Dependency overview

| Step | Main dependency | Blocks |
|---|---|---|
| 1. Freeze contracts | None | 2 |
| 2. Canonical schema | 1 | 3, 4, 7, 15 |
| 3. Migration boundary | 2 | 4, 8, 14 |
| 4. Stable terminals | 2–3 | 5, 8 |
| 5. Authoritative topology | 2–4 | 6, 11 |
| 6. Solver integration | 2–5 | 7–12, 16 |
| 7. Executable model contract | 2, 6 | 8–10, 12, 16 |
| 8. Relay/contactor coupling | 4–7 | 10, 16–17 |
| 9. Protection coupling | 6–8 | 10, 16–17 |
| 10. Three-phase motor starter | 6–9 | 16–17 |
| 11. Measurement integration | 5–6 | 12, 17 |
| 12. Visual state integration | 6–11 | 17 |
| 13. Command history | 2–5 | 14, 17 |
| 14. Lifecycle | 2–6, 11–13 | 17–19 |
| 15. Parameter schema | 2, 7 | 16–17 |
| 16. Model reference tests | 6–11, 15 | 17, 19 |
| 17. Integration tests | 1–16 | 18–19 |
| 18. Offline/deployment | Stable tested app | 19 |
| 19. Acceptance closure | 1–18 | Release |

## Immediate next step

Execute **Step 1 only** from this plan: freeze/document current contracts and add fixtures/tests without changing runtime behaviour. Then review and commit that step before implementing the canonical schema. The two audit documents themselves do not implement any of the remediation items.
