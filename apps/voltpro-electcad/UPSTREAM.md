# VoltPro ElectCAD — migrated source

This application is migrated from [HephzibahBehulah/VoltPro-ElexCAD](https://github.com/HephzibahBehulah/VoltPro-ElexCAD). The React/TypeScript frontend and its MIT license are retained; the optional SQLite/Node API, local database, recordings, screenshots, test fixtures and development-only files are not deployed to the public browser workspace.

## Build

Run `npm install --no-audit --no-fund` and `npm run build`. The production build uses the canonical base path `/voltPro-ElectCAD/`. The deployed frontend is static and does not claim that the optional local API is available. Model-generated proposals must gracefully fall back to the local rule-based proposal when no API is configured.

The upstream API is explicitly documented as not production-ready for public exposure; it is intentionally excluded from the Cloudflare Worker deployment until authentication, authorization, rate limits, logging and persistence are implemented.
