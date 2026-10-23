# Contributing to VoltPro ElectCAD

Thank you for helping improve VoltPro ElectCAD. Contributions should preserve existing user work, favour deterministic engineering logic, and accurately describe the limits of calculations and exports.

## Development setup

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

For the optional local SQLite API, run `npm run dev:server` in a second terminal. The API defaults to loopback and is not production-secure for public exposure.

## Before opening a pull request

Run the checks that apply to your change:

```bash
npm test
npm run test:solver
npm run build
```

Explain any checks you could not run. Do not mark CI as passing without a successful run. Keep changes focused and include regression tests for schema, geometry, connectivity, calculations, persistence, or export behaviour as appropriate.

## Engineering and data integrity rules

- Preserve stable IDs and versioned project import/export compatibility.
- Keep electrical connectivity separate from drawing appearance; do not infer junctions from ambiguous crossings.
- Use SI units and validate numeric inputs at runtime.
- Include assumptions, unsupported cases and traceable inputs in calculation results.
- Do not invent manufacturer ratings, datasheets, standards clauses or simulation results.
- Do not claim certification or construction readiness without a documented validation basis and qualified review.
- Keep secrets and private engineering projects out of source control. Keep AI provider keys on the server only.
- Do not add proprietary CAD symbols, copyrighted standards text or unlicensed manufacturer data.
- Keep static frontend deployment and optional backend deployment clearly separated.

## Pull request checklist

- [ ] Describe the user-visible change and engineering scope.
- [ ] Add/update automated tests where practical.
- [ ] Run the relevant test commands and production build, or state why not.
- [ ] Update README/docs and changelog for user-visible features.
- [ ] Check keyboard access, focus states, responsive behaviour and reduced-motion preferences for UI changes.
- [ ] Document limitations and any migration implications.
- [ ] Confirm no secrets, private data, generated databases or dependency directories were added.
