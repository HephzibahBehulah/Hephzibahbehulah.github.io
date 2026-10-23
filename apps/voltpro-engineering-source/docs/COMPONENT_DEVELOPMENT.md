# Component Development Guide

A functional VoltPRo component is more than metadata. It requires a versioned definition, pin contract, IEC/ANSI symbol references, panel asset, simulation model, documentation and regression tests.

## Definition

Use `data/components.v4.json` as the reference contract. New components must provide:

1. Stable versioned id.
2. Multilingual name.
3. IEC and ANSI standards references.
4. IEC and ANSI SVG symbol paths.
5. Panel asset reference.
6. Typed pins.
7. Parameter values and units.
8. Simulation model and supported analyses.
9. Original safety/documentation text.
10. Tags and tests.

Do not copy proprietary symbols, product photographs, datasheets or WireONa assets.

## Review gate

A component is DONE only when it can be placed, wired, simulated, inspected and tested end-to-end.
