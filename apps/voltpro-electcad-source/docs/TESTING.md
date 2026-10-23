# Testing

## Current automated checks
- npm test: project schema migration/validation, serialization, wire geometry and connectivity tests, plus DC solver reference tests and SQLite API integration tests.
- npm run build: TypeScript check and Vite production build.
- GitHub Actions runs tests and build on pushes to main.

## Simulation reference circuit
A grounded 24 V ideal source and 1 kΩ resistor are expected to produce an absolute resistor current of 24 mA and absolute resistor dissipation of 0.576 W. Sign depends on chosen pin orientation. Tests also verify missing ground and invalid resistance fail explicitly.

## Gaps
No browser automation, UI accessibility audit, full end-to-end test, concurrency test beyond revision conflict behavior, security test, performance benchmark for million-item virtual catalogs, nonlinear SPICE comparison, or qualified engineering review has been performed. CI passing does not establish product completeness or safety.
