# VoltPRo Terminal Engine

The terminal engine in `src/core/terminal-graph.js` is the framework-independent authority for terminal identity, device ownership, terminal positions, wire endpoint lookup, and topology validation. It runs in Node.js and in the browser and does not inspect SVG nodes, DOM IDs, or renderer state.

## Identity and ownership

A terminal's stable public ID is `<deviceId>:<localTerminalId>`, for example `KM1:A1` or `KM1:13`. The local terminal ID is stored in the project model. Device movement and rotation only update the derived world position; neither operation changes identity.

Terminal definitions include label, terminal number, terminal type, electrical domain, local position, connection direction, optional phase and polarity, electrical properties, and metadata. The world position is calculated by rotating the local terminal offset around the device origin and translating it by the device position.

## Model definitions

The `DEFINITIONS` registry contains explicit definitions for resistors, lamps, switches, NO/NC pushbuttons, fuses, circuit breakers, contactors, relays, motors, transformers, terminal blocks, sensors, PLC inputs and outputs, measurement instruments, and batteries. A model with an explicit project terminal list retains its model-specific terminal metadata. The old generic two-terminal fallback from the canonical project helper is replaced by the registered definition when it is clearly only the generic `1`/`2` fallback.

A contactor has separate coil terminals `A1/A2`, three main contact pairs `L1/T1`, `L2/T2`, `L3/T3`, and auxiliary pairs `13/14` and `21/22`. Its internal paths are separate model records. A relay likewise exposes its coil and separate NO/NC contact paths. Internal paths do not collapse their endpoints into a single net: switchable paths remain model behaviour, not permanent wire connectivity.

## API

- `new TerminalEngine(project, options?)` or `build(project)`: index project devices and terminals.
- `resolveTerminal(stableId)` / `resolve(deviceId, localId)`: resolve a terminal record.
- `registerTerminal(deviceId, definition)`: register an additional terminal for an existing device.
- `createDevice(device)`: add a device using explicit model definitions where available, then rebuild the index.
- `terminalPosition(stableId)`: get the derived world position.
- `terminalsForDevice(deviceId)`: list a device's terminals.
- `findConnectedWires(stableId)` and `findConnectedNets(stableId)`: query wire and net membership.
- `validateConnection(from, to, wire?)` and `validateTopology()`: report compatibility issues and invalid endpoint references.
- `danglingTerminals()`: list terminals with no directly attached wire.
- `internalPaths(deviceId)`: return device-model paths with fully qualified terminal references.
- `deleteDevice(deviceId, {wires: "remove" | "reject"})`: remove dependent wires by default, or refuse deletion if connections exist.
- `updateTopology(mutator?)`: apply an optional project mutation and rebuild all derived indexes.

The legacy `build()`, `endpoint()`, `resolve()`, `endpointIds()`, `terminals`, `devicesById`, and `errors` access points remain available to reduce disruption to existing UI consumers.

## Validation and tests

Run `node --test tests/terminal-engine.test.js` for focused terminal tests, or `npm test` for the full repository suite. Tests cover stable lookup, movement, rotation, duplicate IDs, contactor path independence, connected wires/nets, invalid references, safe device deletion, and canonical save/reload.

The terminal engine validates topology metadata; it does not claim that every listed component has a complete manufacturer-validated electrical simulation model. Domain and connection rules are deliberately explicit and can be extended as device models mature.
