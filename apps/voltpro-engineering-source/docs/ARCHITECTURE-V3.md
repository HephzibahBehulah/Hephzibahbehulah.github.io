# VoltPRo Platform Architecture v3

## Product boundary
VoltPRo is an open-source browser learning platform and electrical/electronics simulation laboratory. It must never imply that a simulation is approval for real electrical work.

## Layers
1. Academy: curriculum, lessons, labs, assessments, reference material.
2. Workspace: schematic, panel and microcontroller modes.
3. Component system: JSON definitions, symbols, pins, parameters, documentation and model adapters.
4. Engine: topology extraction, numerical solvers and domain models.
5. Project format: versioned .voltpro JSON with migration support.
6. Documentation/export: SVG, JSON, BOM, schedules and later PDF.
7. Offline shell: PWA cache and local project storage.

## Engine contract
`VoltProEngine.analyze(project, options)` returns deterministic JSON containing DC results and optional transient/AC analysis. UI code must not implement circuit mathematics.

## Component contract
A component definition supplies stable ID, category, pins, parameters, symbol references, documentation and simulation model identifiers. A registry entry is not considered functional until a model adapter and validation test exist.

## Safety
High-voltage and three-phase features are educational models. No software output replaces VDE/DIN/IEC/NEC requirements, manufacturer instructions, inspection or qualified engineering judgement.
