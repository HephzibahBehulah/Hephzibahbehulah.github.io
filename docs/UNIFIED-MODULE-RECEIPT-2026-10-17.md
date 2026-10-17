# Integrated application source receipt — 2026-10-17

Main platform base SHA: `4d2bd0e544ce545f0ccd30353887ab07b1756684`
VoltPRo source: `a93d7d27e87ab7a802bedf80b693e4f21cffd2b0`
PenTesting source: `099aa197fb4d73e6488f920d2ffeb2e0715386bf`

## Imported and retained

- `apps/voltpro/`: full 241-file browser runtime snapshot including simulator, engine, academy, PLC, breadboard, 768 component catalogue entries, PWA, SVG symbols and design/reference workspaces. The source has numerous additional test/docs/build/CSV files that are **not** in this browser snapshot and remain in the public source repository.
- `apps/pentesting/`: curated browser learning view, canonical security tool registry (154 records), learning resources (183), learning paths (9), labs (4), questions (70), and safe in-browser progress. The full Kali/WSL2 desktop and Python backend **has not** been transferred. Do not label native features as implemented on the website.
- Main site HTML has only one additive integration section; original scripts, routes, CSS and business logic remain unchanged.

## Regression and release warning

This is an integration candidate on a development branch. Cross-platform browser tests, Cloudflare Access checks, numerical simulator acceptance, PWA behavior, CSP headers, and production deployment **have not been independently verified**. The current PenTesting browser module intentionally declines Python-generated cases instead of presenting fake execution; its curated educational materials remain browsable.

Before merging: run JavaScript syntax checking on every imported JS file; ensure all relative asset paths resolve, all JSON parses, static deployment sizes remain acceptable, browser smoke tests cover working simulator operation and curated labs, and existing public/admin navigation is unchanged. Verify Cloudflare deployment independently and preserve `production-known-good`.
