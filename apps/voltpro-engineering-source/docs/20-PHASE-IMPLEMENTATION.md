# VoltPRo 20-Phase Delivery Matrix

1. Baseline/stability — repository CI, syntax and required-file checks.
2. Simulation core — isolated numerical engine and stable API.
3. Component models — versioned JSON model contracts.
4. IEC/ANSI symbols — dedicated symbol asset layer; do not use text glyphs as final symbols.
5. Panel designer — DIN rail/device placement/routing/documentation.
6. Fault laboratory — explicit fault objects and deterministic outcomes.
7. Arduino/Raspberry Pi — runtime adapters and I/O event model.
8. Challenge engine — objective/connection/value validators.
9. Tutorial engine — step/hint/validation state machine.
10. Engineering toolkit — formulas with units, assumptions and standards references.
11. Documentation — BOM/wire/terminal/device schedules and exports.
12. Component information — ratings, pins, applications, safety and provenance.
13. Accessibility — keyboard, focus, contrast, non-colour state and reduced motion.
14. PWA/offline — versioned cache, icons, update lifecycle and offline diagnostics.
15. Localization — external EN/DE/ES catalogs.
16. Plugin architecture — contribution contract for definitions/assets/models/tests.
17. Automated testing — solver fixtures, schema validation and UI regression.
18. Performance — lazy-load heavy runtimes and measure startup/bundle budgets.
19. Licensing/provenance — dependency and asset attribution records.
20. Definition of done — beginner circuit, professional motor starter and MCU Blink acceptance tests.

## Current v3 implementation
This delivery establishes the architectural seam for phases 2, 3, 10, 13, 14, 15 and 16 and adds documentation/contracts for the remaining phases. Features must be marked complete only after their acceptance tests pass.
