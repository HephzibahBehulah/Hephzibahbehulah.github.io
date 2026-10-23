# Phase 1 Stabilisation Report

Date: 2026-10-07

## Status

- Syntax validation: DONE — automated Node syntax checks cover simulator, engineering, platform, engine and tests.
- JSON validation: DONE — required project/data contracts are parsed in CI.
- Simulator startup: DONE — simulator entrypoint and engine are checked by CI; browser smoke verification remains separate.
- Core editing actions (drag/drop, wiring, delete, duplicate, rotate, undo, redo): IN PROGRESS — existing MVP retained; dedicated browser automation coverage is still required.
- Save/load, .voltpro import/export, SVG export: IN PROGRESS — existing MVP retained; dedicated end-to-end browser assertions are still required.
- Mobile layout: IN PROGRESS — responsive foundation retained; device-level verification is pending.
- PWA install/offline startup: IN PROGRESS — manifest/service-worker foundation is present; real-device installation/offline verification is pending.

## Browser and screen matrix

Chrome, Firefox, Edge, Safari, Android Chrome and iOS Safari are required. The 1920, 1440, 1366, 1024, 768, 430, 390 and 375 px breakpoints remain acceptance targets.

These cannot be truthfully marked DONE from repository-side CI alone. They are therefore IN PROGRESS until browser/device evidence is attached to a release.

## Engineering baseline

The previous educational resistance/current calculator has been replaced on the Phase 2 branch by a browser-native MNA engine supporting DC operating point, RLC transient analysis, AC sweep and power reporting, with core nonlinear device envelopes.

This engine is explicitly called MNA, not SPICE. It is not a claim of Ngspice compatibility.

## Release gate

Phase 1 is not considered fully closed until browser/device smoke tests are automated or manually evidenced for the required matrix.
