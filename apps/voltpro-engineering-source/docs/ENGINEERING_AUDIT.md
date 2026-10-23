# VoltPRo Engineering Audit

**Audit date:** 2026-10-09  
**Repository:** [HephzibahBehulah/VoltPRo-Academy](https://github.com/HephzibahBehulah/VoltPRo-Academy)  
**Branch inspected:** `main`  
**Audited commit:** `ece4df043764e38eafacc671e418c611a2b0ac45`  
**Scope:** Read-only source and architecture audit. No application code was changed for this audit.

## 1. Executive summary

The running simulator is still driven by the legacy `simulator.js` state model and `engine/voltpro-engine.js` MNA engine. The newer terminal graph, net resolver, v5 project adapter, device-model registry, panel, PLC, and measurement modules are loaded by `simulator.html`, but they do not form one authoritative simulation pipeline. The v5 hook runs a separate topology/model diagnostic when Run is clicked; its result is logged and dispatched as an event, not supplied to the circuit solver.

This is not merely a naming or documentation concern. Source inspection verifies several integration defects:

1. The legacy UI stores wire endpoints as numeric pin indices (`componentId:0`, `componentId:1`), while registry-backed devices can expose named terminal IDs such as `T1` and `T2`. The v5 adapter preserves the named IDs, so its terminal graph cannot resolve legacy numeric endpoints for those devices.
2. The legacy import path does not use the v5 project migration/normalization code. A v5 project with `devices` and `from/to` wire endpoints is not restored correctly by the current UI loader.
3. Relay/contactor behaviour models return contact states, but those contacts are not mapped to solver branches. The legacy MNA engine instead treats relay/contactor as a single two-terminal switch-like branch; its `closed !== false` test treats numeric `closed: 0` as closed.
4. The Motor Starter demo uses a `threephase` component, but the MNA engine's source selection does not include that component type. The demo therefore does not represent a valid three-phase circuit in the active solver.
5. Meter-button readings use the legacy approximate `solve()` function, not the MNA result or `VoltProMeasurement`; they can disagree with Run results.

The newer modules are not all unused: the v5 hook calls `VoltProV5Runtime.analyze()`, which calls the terminal graph, net resolver, and model registry. However, that path is diagnostic-only and does not drive the solver or authoritative visual state.

### Overall assessment

| Area | Audit result |
|---|---|
| Active execution path | Verified: legacy simulator + MNA engine |
| v5 terminal graph / net resolver | Invoked by a secondary diagnostic hook, not the solver |
| Project format interoperability | Verified incompatibility between active loader and v5 format |
| Registry component endpoint interoperability | Verified mismatch for named-terminal registry devices |
| Relay/contactor contact switching | Verified disconnected from the solver; legacy branch logic also mishandles numeric `closed: 0` |
| Three-phase Motor Starter demo | Verified source-type mismatch with the active solver |
| Measurements | Verified split between MNA Run output and approximate meter-button path |
| Undo/redo and topology cleanup | Basic legacy snapshots exist; full project/command architecture is not integrated |
| Automated tests | Source inspected; execution unavailable in this environment (details below) |
| Deployment | GitHub Pages workflow is configured for pushes to `main`; this audit itself has not yet been deployed at the time of writing |

## 2. Audit method and evidence standard

The audit examined the active HTML script order, legacy simulator state and handlers, MNA solver, v5 contracts/adapter/terminal graph/net resolver, model registry and representative models, project serialization/migration, PLC/panel/measurement modules, component-registry loading, test files, package scripts, validation scripts, and the Pages workflow.

Findings are labelled as follows:

- **Verified defect:** directly supported by source paths and execution/data-flow logic.
- **Verified architectural gap:** source shows a module is not connected to the active path, without claiming every advertised feature is broken.
- **Unverified risk:** a plausible concern requiring runtime/browser reproduction, more complete model inspection, or a dedicated test.
- **Not tested:** the environment could not execute the relevant code; no pass/fail conclusion is inferred.

This was a source-level audit, not a browser acceptance test or an electrical certification.

## 3. Active runtime architecture

### 3.1 Script and event order

`simulator.html` loads, in order, `engine/voltpro-engine.js`, core terminal and wire modules, simulation models, rendering/UI modules, `src/project/io.js`, panel and PLC modules, validation/platform modules, `platform/v5-runtime.js`, `platform/project-format.js`, platform utilities including `platform/component-registry.js`, then `simulator.js`, then `platform/v5-hook.js`. It subsequently attempts service-worker registration.

The existence and load order of these scripts does not itself mean that the legacy UI delegates to them.

### 3.2 Actual placement-to-solver path

1. **Placement:** `simulator.js:addComponent(type, x, y)` creates an object in `S.components` with `id`, `type`, canvas coordinates, rotation, `props`, and an empty `pins` array.
2. **Terminal display:** `renderCanvas()` asks `compDef(type)` for a pin count and creates clickable SVG pins labelled by numeric index. Pin references are `componentId:index`.
3. **Wire creation:** `handlePin(ref)` appends `{a: S.wireStart, b: ref}` to `S.wires`. The active wire format uses `a/b`, not `from/to`.
4. **Run preparation:** `run()` creates a temporary legacy project with `components`, and fills each component's `pins` with `componentId:index`. It passes this project directly to `VoltProEngine.analyze()`.
5. **Electrical solve:** `engine/voltpro-engine.js` builds topology from legacy `components/pins/wires.a/wires.b` and runs its MNA implementation. This is the authoritative solver called by the Run handler.
6. **Displayed result:** `run()` reads `r.dc || r`, updates the current readout and console, and writes a DC operating-point summary. The UI does not consume a v5 netlist or v5 device-model contact graph here.
7. **Secondary diagnostic:** `platform/v5-hook.js:bind()` adds a separate click listener to `#runBtn`. It calls `VoltProV5Runtime.analyze(window.S || {})`, appends topology/model diagnostics to the console, and dispatches `voltpro-v5-analysis`. The hook does not pass its output into the MNA solver. No source evidence was found that this event updates solver branches or visual device states.

### 3.3 Where the new architecture participates

- `src/core/terminal-graph.js:build()` builds endpoint identities from `project.devices || project.components` and their terminal/pin definitions.
- `src/core/net-resolver.js:resolve()` unions valid `from/to` wire endpoints and returns nets and errors.
- `platform/v5-runtime.js:adapt()` converts the legacy `S` shape into a v5 project; `analyze()` invokes terminal graph, net resolver, and model registry.
- `src/simulation/model-registry.js:evaluate()` evaluates a registered behavioural model.
- `platform/project-format.js:normalize()/migrate()` provides a legacy-to-v5 normalization path.
- `src/project/io.js:serialize()/envelope()/parse()` provides another project serialization API.

These functions are loaded and some are called, but the active Run/save/load handlers do not make them the single source of truth. The project therefore has two partially overlapping representations and two different simulation paths.

## 4. Verified findings

### F-01 — Two project models are active without one canonical integration boundary

**Severity:** Critical  
**Classification:** Verified architectural defect

**Files/functions**
- `simulator.js`: `S`, `addComponent()`, `handlePin()`, `run()`, `serialize()`, `loadProject()`
- `src/core/contracts.js`: `project()`, `wire()`
- `platform/v5-runtime.js`: `adapt()`, `analyze()`
- `platform/project-format.js`: `normalize()`, `decode()`, `migrate()`
- `src/project/io.js`: `serialize()`, `envelope()`, `parse()`

**Current behaviour:** The active UI stores `components` with `x/y/props` and wires with `a/b`. The v5 contract uses `devices`, named `terminals`, `parameters/state`, and `from/to` wires. The active serializer writes `format: "voltpro"`, `version: 1`, `components`, and legacy wires. The v5 normalizer can translate legacy shape, but the active loader does not call it.

**Expected behaviour:** One documented canonical project model must be used by editing, terminal resolution, solver, measurements, undo/redo, and persistence. Legacy files should pass through one tested migration adapter.

**Reproduction:** Import a valid v5 project containing `devices: [{id:"R1", ...}]` and `wires: [{from:"R1:1",to:"V1:1"}]` through the current Load control. `loadProject()` assigns `S.components = x.components || []`, so a v5 project with only `devices` loads as an empty component list. Wire endpoints also remain `from/to`, while the legacy renderer expects `a/b`.

**Repair:** Define the canonical schema and version policy first. Make load/import normalize to that schema, and make save/export serialize the same schema. Preserve a tested adapter for v1 legacy files.

**Dependencies:** F-02, F-03, F-08, F-09.

### F-02 — Registry-defined terminal IDs can disagree with UI wire endpoint IDs

**Severity:** Critical  
**Classification:** Verified defect in the v5 diagnostic path for registry-backed components

**Files/functions**
- `simulator.js:renderCanvas()`, `getPin()`, `handlePin()`
- `platform/component-registry.js:toDef()`
- `platform/v5-runtime.js:adapt()`
- `src/core/terminal-graph.js:build()/resolve()`
- `src/core/net-resolver.js:resolve()`
- Example registry data: `components/contactors/index.json`

**Current behaviour:** The UI identifies pins by numeric index (for example `KM1:0`). Registry records can define terminals by semantic IDs such as `T1` and `T2`. `adapt()` preserves registry terminal IDs when it finds metadata, and the terminal graph constructs endpoints such as `deviceId:T1`. The resolver then checks the legacy wire endpoint `deviceId:0` against the graph and reports an unknown endpoint.

**Expected behaviour:** A displayed terminal, saved endpoint, terminal graph entry, and solver terminal must all share one stable terminal ID. Display index must not silently become a different electrical identity.

**Reproduction:** Place a registry-backed component whose terminal metadata uses `T1/T2`, connect its displayed pin 0 to another pin, then press Run. Inspect the appended v5 topology diagnostics for `WIRE_ENDPOINT_UNKNOWN` (subject to successful asynchronous registry loading).

**Repair:** Store wires against stable terminal IDs from component instances. If a migration adapter accepts numeric endpoints, map indices to terminal IDs deterministically and validate every endpoint before solving.

**Dependencies:** F-01; then F-03 and F-08.

### F-03 — v5 topology analysis is diagnostic-only, not the authoritative netlist for the solver

**Severity:** Critical  
**Classification:** Verified architectural gap

**Files/functions**
- `platform/v5-hook.js:bind()`
- `platform/v5-runtime.js:analyze()`
- `src/core/terminal-graph.js:build()`
- `src/core/net-resolver.js:resolve()`
- `simulator.js:run()`
- `engine/voltpro-engine.js:build()/analyze()`

**Current behaviour:** Run calls the MNA engine using the legacy project. The v5 hook separately analyses the same legacy state and logs topology/model results. The v5 result is not used to build or validate the MNA netlist and is not the source of the displayed electrical solution.

**Expected behaviour:** A single topology-resolution result should feed netlist construction, model evaluation, equation solving, measurements, and rendering. Invalid or unknown endpoints should stop a solve with actionable diagnostics.

**Reproduction:** Connect a registry-backed component using named terminal metadata, run the circuit, and compare the MNA output with the appended v5 topology diagnostic. The two paths consume different terminal representations; the diagnostic result is not passed to the MNA call.

**Repair:** Integrate topology validation at the boundary before solving and have the solver consume the canonical resolved nets. Remove duplicate resolution only after equivalence tests prove the replacement.

**Dependencies:** F-01 and F-02.

### F-04 — Relay/contactor model contact states do not switch actual solver branches

**Severity:** Critical  
**Classification:** Verified defect

**Files/functions**
- `src/simulation/contact-models.js:energized()` and registered `contactor/relay.evaluate()`
- `src/simulation/model-registry.js:evaluate()`
- `platform/v5-runtime.js:analyze()`
- `engine/voltpro-engine.js:build()`
- `simulator.js:resistance()`, `run()`

**Current behaviour:** The contactor model returns separate logical contacts (three main poles plus NO/NC auxiliary contacts), and the relay model returns NO/NC contact states. The legacy MNA engine instead models relay/contactor as one switch-like branch across the first two pins. It does not create independent coil, main-pole, and auxiliary-contact paths from the model's `contacts` array. In the engine's switch-like branch condition, `x.props?.closed !== false` treats numeric `closed: 0` as closed because zero is not the boolean `false`. The default legacy relay/contactor props use `closed: 0`.

The behavioural model's `energized()` reads `state.coilVoltage` or a context coil voltage; `platform/v5-runtime.js:analyze()` evaluates with an empty context, while the legacy component's `props.coilVoltage` is not mapped into `state.coilVoltage`. Model output therefore does not represent voltage calculated across an actual coil in the active solver.

**Expected behaviour:** Coil voltage/current must be calculated on explicit A1/A2 terminals. The coil state must drive independent main and auxiliary contact branches, which in turn participate in the same resolved electrical circuit and solver iteration.

**Reproduction:** Use a default contactor (`props.closed: 0`) in a circuit and inspect the legacy branch construction: it is treated as closed by the numeric-versus-boolean condition. Separately evaluate a contactor model and observe that its returned contacts are only behaviour output; no code in the active Run path applies those contact states to MNA branches.

**Repair:** Create explicit coil and contact terminals and map each contact to a distinct solver branch. Derive coil state from solved coil voltage/current and apply state transitions before resolving/solving the next electrical state. Replace truthiness and mixed-type state checks with a strict schema.

**Dependencies:** F-01, F-03, F-05, F-06.

### F-05 — Motor Starter demo is not a valid three-phase circuit in the active solver

**Severity:** High  
**Classification:** Verified defect

**Files/functions**
- `simulator.js:demoMotor()`, `run()`
- `engine/voltpro-engine.js:build()` / source selection
- `src/simulation/motor-model.js`
- `src/simulation/three-phase.js`
- `src/training/dol-runtime.js`

**Current behaviour:** `demoMotor()` creates a `threephase` source and calls `run()`. The MNA engine's source selection recognises `battery`, `dcsource`, `voltage_source`, and `ac_source`, but not the legacy `threephase` type. The newer three-phase source and motor models are separate modules and are not invoked as a three-phase solver by the legacy Run path. The demo also wires a contactor as a single two-terminal element.

**Expected behaviour:** A three-phase demo should solve a three-phase network using phase-aware source, switching, motor, and protection models; a single-phase/DC approximation must not be labelled as a functioning motor starter.

**Reproduction:** Click **Motor Starter** and then Run. Trace the resulting project into the source-selection branch in `engine/voltpro-engine.js`; no supported source is selected for `type: "threephase"`.

**Repair:** Implement a validated three-phase solver/model integration or explicitly mark the demo as behavioural-only until that solver exists. Do not fake three-phase operation by mapping the source to an unrelated two-terminal DC branch.

**Dependencies:** F-03, F-04, F-06.

### F-06 — Component model registry is not the solver's model registry

**Severity:** High  
**Classification:** Verified architectural gap

**Files/functions**
- `src/simulation/model-registry.js:register()/evaluate()`
- `src/simulation/core-models.js`
- `src/simulation/contact-models.js`
- `src/simulation/control-models.js`
- `src/simulation/protection-models.js`
- `src/simulation/motor-model.js`
- `engine/voltpro-engine.js:build()`
- `platform/v5-runtime.js:analyze()`

**Current behaviour:** The v5 analysis path evaluates behavioural models and returns a list of results. The MNA engine independently dispatches on legacy `type` values and properties. There is no general adapter that converts a registered model's electrical terminals/contacts/states into solver branches. A catalogue record having `electricalModel` and `behaviorModel` metadata does not prove that the active solver executes it.

**Expected behaviour:** Every simulation-capable model should declare terminal mapping, electrical branch generation, state transitions, units, limits, and validation status. The solver should explicitly reject catalogue-only models instead of silently approximating them.

**Reproduction:** Place a catalogue component with a namespaced ID and inspect the registry evaluation versus the MNA branch list. The v5 hook reports behaviour models, while `run()` passes the legacy type/props to the independent MNA engine.

**Repair:** Define an executable model contract and an adapter from each model to solver branch/state equations. Distinguish catalogue records, behavioural-only models, and analytically validated electrical models.

**Dependencies:** F-01 through F-04.

### F-07 — Instrument readings bypass the MNA result

**Severity:** High  
**Classification:** Verified defect

**Files/functions**
- `simulator.js:solve()` and `[data-meter]` click handler
- `simulator.js:run()`
- `src/simulation/measurement.js:measure()`

**Current behaviour:** Run displays current from `VoltProEngine.analyze()`. The voltage/current/resistance/continuity meter-button handler calls the separate legacy `solve()` function, which approximates the circuit as a series sum of resistances and uses the first two connected wires for each component. It does not consume the MNA node voltages or branch values, and it does not call `VoltProMeasurement.measure()`.

**Expected behaviour:** Instruments should read the same solved node/branch state that drives visual indicators. If the simulation has not been solved or a measurement point is invalid, show an explicit status rather than a plausible but unrelated number.

**Reproduction:** Run a parallel-branch circuit, then click the current/voltage meter buttons and compare readings with the MNA console. The meter handler uses `solve()`, not the `dc` result generated by Run.

**Repair:** Store the latest solver result and route all measurement tools through one measurement API keyed by canonical net/branch IDs. Add parallel-network and open-circuit tests.

**Dependencies:** F-01, F-03, F-06.

### F-08 — The v5 project normalizer and serializer are not used by active Load/Save

**Severity:** High  
**Classification:** Verified defect

**Files/functions**
- `simulator.js:serialize()`, `loadProject()`, Save/Load handlers
- `platform/project-format.js:normalize()/encode()/decode()/migrate()`
- `src/project/io.js:serialize()/envelope()/parse()`

**Current behaviour:** Save stores a legacy version-1 `voltpro` document in localStorage or exports it. Load accepts any JSON whose `format` equals `voltpro`, then directly assigns `components` and `wires`. It neither migrates version 1 to v5 nor validates endpoints. The two newer project APIs are loaded but not called by these handlers.

**Expected behaviour:** Import must detect format/version, migrate once, validate component and terminal identities, preserve wire metadata, and either load safely or give a precise error. Save and export should have a documented stable format.

**Reproduction:** Import a v5 document with `devices` and `from/to` wires. The current loader does not map `devices` into `S.components` and does not map wire endpoints to `a/b`.

**Repair:** Route all project input through one tested migration/validation function and serialize only the canonical format. Keep backward-compatibility fixtures for current version-1 files.

**Dependencies:** F-01, F-02, F-09.

### F-09 — Undo/redo is legacy snapshot history, not the loaded command system

**Severity:** Medium  
**Classification:** Verified architectural gap; some topology operations are handled correctly

**Files/functions**
- `simulator.js:saveHistory()`, `restore()`, Undo/Redo handlers, `renderCanvas()`, `renderInspector()`
- `src/core/commands.js:history()`, `insert()`, `remove()`, `setPath()`

**Current behaviour:** Legacy Undo/Redo snapshots only `components` and `wires`. The transactional command-history module is not used by the active handlers. Moving a component recomputes pin coordinates from the component's stable legacy ID/index, and deleting a component filters wires that begin with its ID, which are useful existing behaviours. However, history does not include a complete canonical project/topology state, and restoring a snapshot does not clear `wireStart` or run topology validation.

**Expected behaviour:** Every mutation (place, wire, move, rotate, edit, duplicate, delete, import, mode change where relevant) should be a transaction against the canonical project. Undo/redo should preserve referential integrity and revalidate the graph.

**Reproduction:** Start a wire operation, create/undo other changes, or load a project while an endpoint selection is active; inspect whether transient `wireStart` remains and whether subsequent wiring references the old selection. Also verify undo/redo does not restore stale or dangling wire endpoints.

**Repair:** Integrate the command layer only after F-01 establishes the canonical project model. Add topology invariants to each command's apply/revert tests.

**Dependencies:** F-01, F-02, F-08.

### F-10 — Editing, reset, and load do not share a complete simulation-state lifecycle

**Severity:** Medium  
**Classification:** Verified architectural gap / runtime risk

**Files/functions**
- `simulator.js:renderInspector()`, `clearProject()`, `stop()`, `loadProject()`, New handler
- `src/simulation/state-store.js` (loaded by HTML)
- `src/simulation/state-machine.js`

**Current behaviour:** Property edits call `saveHistory()` and mutate `c.props`, but no shared simulation-state invalidation/recompute contract is visible in the active handlers. `stop()` only clears `S.running` and re-renders. The New handler clears components/wires but does not call `stop()`. Load replaces components/wires without stopping or resetting transient wire selection/history. The newer state-store/state-machine modules are loaded but not used by these handlers.

**Expected behaviour:** Editing electrical parameters or topology must invalidate the prior result; New/Load/Stop should have explicit, tested reset semantics. The UI must never display a stale result as if it corresponds to the current circuit.

**Reproduction:** Run a circuit, change a resistance or load a different project, then inspect whether previous readouts/status are cleared or recalculated. Start a wire selection and invoke New/Load; check whether the pending endpoint state is cleared.

**Repair:** Define simulation lifecycle events (project changed, topology changed, parameters changed, run, stop, reset) and connect them to solver-state invalidation and UI status. Clear transient interaction state on load/reset.

**Dependencies:** F-01, F-08, F-09.

### F-11 — Component editing does not guarantee model-schema compatibility

**Severity:** Medium  
**Classification:** Verified architectural risk

**Files/functions**
- `simulator.js:renderInspector()`
- `platform/component-registry.js:toDef()`
- `components/contactors/index.json` and other family records
- `platform/project-format.js:normalize()`

**Current behaviour:** The inspector combines registry schema keys and current props, but registry defaults are extracted by `toDef()` and the UI stores edits into `c.props`. Newer models may expect `parameters` and `state`, while the legacy engine reads `props`. The v5 adapter copies `props` into `parameters`, but that does not guarantee parameter-name or unit equivalence.

**Expected behaviour:** Parameter definitions, stored values, units, bounds, and runtime model inputs should be one schema with explicit migration and validation. A value accepted by the UI must be supported by the selected executable model.

**Reproduction:** Edit a registry-backed device property and compare the persisted `props`, adapted `parameters`, and model-specific parameter names. Verify that the same numeric value and unit reach the model.

**Repair:** Normalize values through a schema-driven parameter layer with unit conversion, min/max validation, and model-specific required-field checks.

**Dependencies:** F-01, F-06, F-08.

### F-12 — Validation labels exceed the evidence available from this audit

**Severity:** Medium  
**Classification:** Verified documentation/quality risk, not proof that every model is wrong

**Files/functions**
- `src/simulation/model-registry.js:list()`
- `src/simulation/core-models.js`, `contact-models.js`, `protection-models.js`, `motor-model.js`
- `scripts/validate-components.js`
- `components/index.json`

**Current behaviour:** Model registry entries can declare `validated: true`; the component validation script verifies record structure and required fields/counts, not numerical equivalence to analytical reference circuits or contactor/motor integration. The component manifest declares 768 records across 24 families, but record presence and schema validity do not establish that 768 models are executable or electrically validated.

**Expected behaviour:** “Validated” should be tied to named test fixtures, reference values, tolerances, supported analysis domains, and a recorded validation status. Catalogue completeness and solver validation must be reported separately.

**Repair:** Add a validation manifest and analytical tests for each model/domain. Rename or remove validation flags that are not backed by repeatable tests.

**Dependencies:** F-06 and the acceptance suite in F-13.

### F-13 — No automated end-to-end acceptance proof was available during this audit

**Severity:** High  
**Classification:** Not tested / verification gap

**Files/scripts**
- `package.json`: `npm test`
- `scripts/validate-v3.js`
- `scripts/validate-components.js`
- Tests inspected: `tests/engine.test.js`, `tests/terminal-graph.test.js`, `tests/net-resolver.test.js`, `tests/commands.test.js`, `tests/project-io.test.js`, `tests/contact-models.test.js`

**Current behaviour:** The package test script runs `node --test tests/*.test.js`, then `validate-v3.js` and `validate-components.js`. The tests inspected exercise the MNA engine, graph/resolver, command history, project IO, and isolated contactor behaviour. They do not establish that the live Run handler, v5 adapter, actual project import/export, instrument buttons, and contactor branches operate together.

**Execution outcome:** The environment could not clone the public repository because DNS resolution for `github.com` failed (`Could not resolve host: github.com`). Therefore `npm test`, `node scripts/validate-v3.js`, and `node scripts/validate-components.js` were **not executed**. This is an environment limitation, not a test failure. The combined commit-status query for the audited commit returned no status contexts; this is not evidence of a passing CI run.

**Expected behaviour:** Run the full package script in CI and add browser-level integration tests for the real entry point and data flow. Record each command's exit code and test count.

**Repair:** Make the existing test workflow an explicit gate and add tests for F-01 through F-10 before implementation is considered complete.

**Dependencies:** All functional repairs; tests should be written before or alongside each repair.

## 5. Data-flow contract: observed versus required

| Stage | Observed active implementation | Required canonical implementation |
|---|---|---|
| Place device | `S.components`, legacy type/props | Canonical device instance with stable ID and schema |
| Generate terminals | Pin count and numeric display index | Stable terminal IDs generated from model definition |
| Connect | `{a,b}` endpoint strings | Wire records using stable terminal IDs; validated endpoints |
| Resolve nets | MNA engine independently unions legacy endpoints; v5 hook separately resolves `from/to` | One validated terminal graph/net resolver shared with solver |
| Generate netlist | Legacy MNA builds branches from `type`, first pins and props | Model contract maps resolved terminals and internal branches |
| Evaluate devices | Legacy type switch plus separate behaviour model evaluation | Executable model registry integrated into solver iteration |
| Solve equations | `VoltProEngine.analyze()` on legacy project | Solver consumes canonical netlist and model state |
| Measure | Run output from MNA; meter buttons from legacy approximate `solve()` | Measurements read the same solved nodes and branches |
| Visual update | Legacy render plus `S.running`; v5 diagnostics append console text | Visual device states derive from solved canonical state |
| Save/load | Legacy v1 serializer/loader; v5 helpers separate | One versioned serializer, migrator, validator and round-trip tests |

## 6. Undo, redo, movement, deletion, editing and reset

- **Movement:** the legacy UI stores wires by component ID and numeric pin index, then recomputes pin coordinates when rendering. This should preserve legacy wire attachment during movement. Browser acceptance is still required to verify drag interactions and hit-testing.
- **Deletion:** `renderInspector()` removes the selected component and filters wires whose `a` or `b` begins with the component ID. This is a positive legacy topology-cleanup path, but it is not implemented through the v5 command system.
- **Property editing/rotation/duplication:** each handler calls `saveHistory()`; edits mutate legacy `props`. Model-schema normalization and solver-result invalidation are not shared with the v5 modules.
- **Undo/redo:** snapshots restore only `components/wires`. The loaded `VoltProCommands.history()` is not wired into active UI events.
- **New/load/reset:** transient wire-selection and solver/UI state do not have a single reset lifecycle. The New handler does not call `stop()`; Load replaces arrays without migration or topology validation.
- **Simulation state:** `stop()` only changes the running flag and render. No shared state-store reset is called from the active handlers.

These findings do not mean every basic edit operation is unusable; they mean the current editing lifecycle is split across the legacy state model and newer modules.

## 7. Test and validation inventory

| Command/test | Intended coverage | Audit outcome |
|---|---|---|
| `npm test` | All `tests/*.test.js`, then both validators | Not executed: clone blocked by DNS resolution |
| `node scripts/validate-v3.js` | Syntax checks for selected JS folders and v4/PWA data contracts/assets | Not executed |
| `node scripts/validate-components.js` | Manifest and 768 component-family record structure | Not executed |
| `tests/engine.test.js` | DC 12 V/1 kΩ reference, RLC APIs, diode, analysis API, ground reference, sweep | Source inspected; not executed |
| `tests/terminal-graph.test.js` | Stable endpoint indexing and duplicate identity detection | Source inspected; not executed |
| `tests/net-resolver.test.js` | Wired net grouping and unknown endpoint errors | Source inspected; not executed |
| `tests/commands.test.js` | Undo/redo and path restoration in isolated command module | Source inspected; not executed |
| `tests/project-io.test.js` | Deterministic serialization and export envelope round-trip | Source inspected; not executed |
| `tests/contact-models.test.js` | Isolated contactor model returns expected NO/NC states | Source inspected; not executed |
| Browser integration / live acceptance | Place-wire-run-measure-save-load, contactor switching, motor demo, offline | Not executed |

The isolated contactor tests validate the model's returned contact list, not that the list changes the MNA circuit. The isolated net-resolver tests validate the resolver on correctly formatted v5 endpoints, not the compatibility of the active legacy UI endpoint IDs.

## 8. Files inspected

- Runtime and solver: `simulator.html`, `simulator.js`, `engine/voltpro-engine.js`
- Contracts/topology/commands: `src/core/contracts.js`, `src/core/terminal-graph.js`, `src/core/net-resolver.js`, `src/core/commands.js`, `src/core/wire-data.js`
- Models and measurements: `src/simulation/model-registry.js`, `core-models.js`, `contact-models.js`, `control-models.js`, `protection-models.js`, `motor-model.js`, `measurement.js`, `state-machine.js`, `three-phase.js`
- UI/project/panel/PLC: `src/panel/designer.js`, `src/plc/runtime.js`, `src/plc/integration.js`, `src/project/io.js`
- Platform integration: `platform/v5-runtime.js`, `platform/v5-hook.js`, `platform/project-format.js`, `platform/component-registry.js`, `src/platform/capabilities.js`
- Registry evidence: `components/index.json`, `components/contactors/index.json`, `components/relays/index.json`, `components/power/index.json`, `components/loads/index.json`
- Validation: `package.json`, `scripts/validate-v3.js`, `scripts/validate-components.js`, `SIMULATOR.md`, selected test files listed above
- Deployment: `.github/workflows/pages.yml`

The requested files were reviewed directly where available. The audit is not a claim that every file in the repository or every test file has been executed.

## 9. Deployment and change boundary

The repository's `.github/workflows/pages.yml` is configured to deploy on pushes to `main` and via manual workflow dispatch. This audit changes documentation only; it does not modify simulator HTML, JavaScript, CSS, models, or runtime behaviour. GitHub Pages deployment status must be checked after the documentation commit. A documentation-only Pages deployment is not a browser acceptance test of the simulator.

## 10. Recommended implementation order

1. Establish one canonical project/terminal/wire schema and migration tests (F-01, F-02, F-08).
2. Connect the terminal graph and net resolver to the authoritative solver and reject invalid topology (F-03).
3. Define executable device-model contracts and integrate coil/contact state with the solver (F-04, F-06).
4. Implement phase-aware source, switching and motor models; repair the Motor Starter demo (F-05).
5. Route instruments and visual states through the same solved state (F-07).
6. Integrate transactional history and project/simulation lifecycle (F-09, F-10).
7. Add schema-driven parameter validation and model-specific numerical validation (F-11, F-12).
8. Execute unit, validation, browser integration, regression, and offline tests in CI (F-13).

No speculative code repairs were implemented during this audit.
