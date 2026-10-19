# Unified Platform Integration Baseline — 2026-10-17

## Decision and non-destructive scope

Public website: https://hephzibahbehulah.com/
Private control gateway: https://admin.hephzibahbehulah.com/ (Cloudflare Access; verify edge and service-side enforcement independently)
Public engineering source: HephzibahBehulah/Hephzibah-VoltPRo
Public security source: HephzibahBehulah/Hephzibah-PenTestingApp (actual repository name, despite a legacy URL mentioned during discovery)

**Preserve every existing main-platform feature.** Do not delete, replace or blindly overwrite existing applications. Compare overlapping functionality for testability, correctness, security and usability. Avoid copying local Kali/WSL2 tools into browser-only JavaScript.

## Immutable source baseline as inspected

- Main platform `main`: `4d2bd0e544ce545f0ccd30353887ab07b1756684`
- Existing source rollback branch: `production-known-good` (keep unchanged)
- Main repository contains browser frontend, ADIGUN Control, Tool Lab, Cyber OS, Cloudflare Workers, large technical catalogues, language systems, AI, and production inventory.
- VoltPRo includes simulator engine, component registry, schematic/breadboard/panel/PLC/microcontroller workspaces, academy, reference and AI-circuit features. Its catalogue contains 768 reference records across 24 component families; do not mistake records for validated simulation models.
- PenTestingApp is a WSL2/Kali/Python/Bash desktop and CLI application with learning paths, games, labs, tool registry, and installation/updating workflows. Actual runtime execution needs local companion or secure dedicated backend.
- WireONa is a **functional reference only**. Independently implement behaviour; never copy proprietary code, images, device datasets or branding.

## Integration strategy

1. Inventory per-file ownership, existing entry points, scripts, imports and service-worker scopes. Record source commit SHA of each imported module.
2. Add stable feature/module manifest and mount isolated engineering/security routes without changing existing URLs or API contracts.
3. Keep VoltPRo's original project runtime as the engineering module; test relative asset paths, CSP, browser storage and PWA scope before mirroring.
4. Keep cybersecurity knowledge, practice and simulations in the browser, while preserving CLI/native capabilities through an authorised local application or isolated runner.
5. Compare overlapping calculators, terminal, learning, search, knowledge datasets, games and labs. Merge verified complementary capabilities instead of suppressing one.
6. Add a review-first update workflow: source commit pinning, dependency/licence/security checks, CI, staging preview and controlled approval before production.
7. Maintain Cloudflare Access on the admin gateway; require server-side authorization on admin APIs. Never leak secrets into repository or frontend builds.
8. Verify public entry page, Cyber OS, Tool Lab, AI, engineering simulation, cybersecurity lessons, accessibility/mobile/offline and admin auth.
9. Only call a feature deployed when live application verification and Cloudflare deployment evidence exist; preserve the production ledger.

## WireONa capability gap to evaluate

Public product descriptions reference: multi-trace oscilloscope (time/XY/FFT, phase and trigger), Arduino Uno/PWM/servos/L298N, Siemens LOGO! FBD, Schneider Zelio ladder, cooling/compressor simulations, solar orientation calculations, manufacturer-referenced device metadata, and course/academy flows. These are **audit targets, not implemented claims**. Compare against VoltPRo's current engine and workspaces, then implement compatible original functionality incrementally and validate numerically.

## Acceptance / no-regression gates

- No removal of pre-existing working production route or feature.
- Existing Cloudflare relative `/api/*` contract and existing admin gateway maintained.
- Static/syntax and unit CI green plus actual browser and integration tests.
- Functional electrical numerical checks and safety disclaimer for educational simulations.
- WSL/Linux execution never mislabeled as browser-native.
- No WireONa proprietary assets or code.
- Pin upstream commit identifiers; updates require review and rollback.
- Public features stay usable and admin features remain inaccessible without authentication.
- Production deploy evidence recorded separately from GitHub commit status.

## Remaining required work

This document is an initial source-code integration baseline, NOT a claim that the two full applications have been merged or production has been deployed.
