# Canonical VoltPRo Project Model

**Status:** Canonical contract v1 defined behind a standalone module and migration boundary. The legacy UI and solver are not switched over in this step.  
**Implementation:** platform/canonical-project.js  
**Tests:** tests/canonical-project.test.js

## Design rules

1. One editable source of truth: devices plus wires.
2. Electrical identity is independent of labels, SVG coordinates, position, rotation, and display order.
3. A terminal key is device-id:local-terminal-id, for example KM1:A1, KM1:L1, KM1:T1, KM1:13, and KM1:14. The device/model definition determines which terminals exist; these are examples, not universal pin assignments.
4. Wires is the sole editable external electrical topology. Endpoints use canonical terminal keys in from and to. Legacy a/b endpoints are accepted only by migration.
5. Nets are derived from terminal identities and wires. They are never a second editable topology.
6. Node voltages, branch currents, and other calculated values are results, not circuit inputs. Persist simulation configuration and optional result provenance/metadata, not solver values as circuit inputs.
7. Unknown source fields are retained under extensions.preservedUnknownFields during migration. Unsupported future canonical versions are rejected rather than downgraded.
8. This module is not wired into the legacy UI in this commit. Active loader/solver integration waits for adapter and integration tests.

## Canonical envelope

```json
{
  "format": "voltpro",
  "formatVersion": 1,
  "metadata": { "id": "project-001", "name": "Starter circuit", "author": "", "createdAt": null, "updatedAt": null, "sourceFormatVersion": 1 },
  "workspace": { "mode": "schematic", "grid": 20, "units": "SI", "symbolStandard": "IEC", "viewport": { "zoom": 1, "pan": { "x": 0, "y": 0 } } },
  "devices": [{
    "id": "KM1", "type": "contactor", "modelVersion": "1.0.0", "label": "KM1",
    "position": { "x": 120, "y": 80 }, "rotation": 0,
    "terminals": [
      { "id": "A1", "label": "A1", "type": "electrical", "domain": "control" },
      { "id": "A2", "label": "A2", "type": "electrical", "domain": "control" },
      { "id": "L1", "label": "L1", "type": "electrical", "domain": "ac3" },
      { "id": "T1", "label": "T1", "type": "electrical", "domain": "ac3" },
      { "id": "13", "label": "13", "type": "electrical", "domain": "control" },
      { "id": "14", "label": "14", "type": "electrical", "domain": "control" }
    ],
    "parameters": { "coilVoltage": 230 }, "operatingState": { "coilEnergized": false }, "extensions": {}
  }],
  "wires": [{
    "id": "W001", "from": "KM1:L1", "to": "Q1:1", "label": "L1", "colour": "#333333",
    "routing": [{ "x": 180, "y": 90 }], "domain": "ac3",
    "electrical": { "crossSection": "2.5 mm2", "material": "copper", "phase": "L1" }, "extensions": {}
  }],
  "nets": { "policy": "derived", "snapshot": null },
  "panel": { "rails": [], "items": [], "width": 600, "height": 400 },
  "plc": { "programs": [], "ioMappings": [] },
  "simulation": { "configuration": { "mode": "dc" }, "resultsMetadata": null },
  "extensions": {}
}
```

The example is illustrative, not a valid complete circuit: every referenced endpoint must resolve to an actual device terminal. Routing stores optional intermediate points as finite {x,y} coordinates; endpoints remain defined only by from/to.

## Stable identifiers and validation

- Device IDs and wire IDs are unique within a project, begin with a letter, and use letters, numbers, underscore, period, or hyphen.
- Terminal local IDs are unique within their owning device and may be numeric (13) or named (A1). Their fully qualified key is always deviceId:terminalId.
- IDs do not change when a device is moved, rotated, renamed, or visually reordered. Display labels/reference designators are presentation fields, not identity.
- Validation rejects duplicate IDs, duplicate terminal IDs, missing endpoints, self-loop wires, malformed routing points, unsupported domains, and endpoint/domain mismatches.
- v1 domain vocabulary: dc, ac, ac1, ac3, three-phase, three_phase, control, signal, logic, data, pneumatic, hydraulic, mechanical, thermal, optical, and unknown. Unknown domain vocabulary is rejected; a wire domain must match both endpoint domains.

## Editable state versus derived state

| Data | Authority | Persistence |
|---|---|---|
| Metadata, workspace, devices, terminals, parameters, operating-state inputs, wires, panel, PLC, simulation configuration | Editable project | Persist |
| Electrical nets | Deterministic result of terminal graph + wires | Not editable; optional cache only |
| Node voltages, branch currents, power, solver matrices, convergence traces | Simulation result | Never project inputs; result storage should reference a project revision |
| Result timestamp, solver/version, project revision/hash, status | Result provenance | Optional simulation.resultsMetadata |
| UI selection, hover, drag, transient wire start | UI session | Do not persist |

The serializer removes legacy simulation.nodeVoltages if present. New calculated values belong in a separate result payload keyed to the project revision.

## Migration and compatibility

platform/canonical-project.js provides migrate(raw). It accepts legacy components/props/a/b and v5-like devices/parameters/from/to envelopes, maps them to canonical devices/terminals/wires, and preserves unknown top-level, device-level, and wire-level fields in extensions. Legacy numeric endpoint forms such as KM1:0 map to the corresponding migrated terminal by index. Missing/out-of-range indexes remain unresolved and fail validation; wires are never silently dropped.

- Canonical v1: validate and load without reshaping authoritative topology.
- Legacy/v5 formats: migrate, then validate before replacing active project state.
- Future canonical version: reject with an explicit unsupported-version error; never downgrade.
- UI import must be atomic: parse, migrate, validate, then replace active state only if valid.
- Preserve original import bytes at the caller when migration errors need recovery. Preserved unknown fields do not imply vendor-specific behaviour is executable.

## Interfaces

- **Device registry:** device type + modelVersion identifies a model definition. The registry supplies terminal definitions, domain, parameter schema/defaults, and executable-model capability. This module does not claim catalogue entries are solver-ready.
- **Terminal graph:** terminal instances derive from devices[].terminals; a full key is deviceId:terminalId.
- **Net resolver:** resolveNets(project) validates first and deterministically unions terminals connected by wires, returning derived net IDs and sorted members.
- **Circuit netlist:** a future adapter consumes canonical devices and resolved nets, then expands device-internal branches. External connectivity is not independently re-inferred by a second topology store.
- **Simulation engine:** accepts an explicit netlist, simulation configuration, and operating-state inputs; returns status, results, and diagnostics. The existing MNA engine is unchanged in this step.
- **Device state updates:** solved state is returned separately from editable parameters and applied as a result update, not as implicit topology mutation.
- **Serialization:** serialize(project) validates before producing JSON; deserialize(input) parses/migrates/validates and throws an error carrying structured validation errors on failure.
- **Validation:** validate(project) returns {valid, errors:[{code,path,message}]}, suitable for UI presentation and tests.

## Panel and PLC

- panel stores enclosure dimensions, DIN rails, and device placements. Panel positions are separate from schematic coordinates. The current free-form payload is preserved until the panel designer contract is migrated explicitly.
- plc.programs stores PLC program documents and language/runtime metadata; plc.ioMappings stores stable PLC point IDs mapped to device terminal keys or typed signals. The current PLC payload is preserved without pretending it is already normalized.
- simulation.configuration stores analysis mode and solver settings. simulation.resultsMetadata stores provenance only, not authoritative electrical values.

## Test coverage and limits

The Node test suite covers creation, serialize/load round-trip, deterministic net derivation, explicit legacy endpoint migration, unknown top-level field retention, duplicate IDs, dangling endpoints, unsupported domains, malformed route geometry, and future-version rejection.

This step establishes the model and validation boundary only. It does not yet route the legacy UI, PLC runtime, panel designer, terminal graph, net resolver, or MNA solver through this module. That integration is separate and must preserve existing projects through fixtures and adapter tests before active runtime behaviour changes.
