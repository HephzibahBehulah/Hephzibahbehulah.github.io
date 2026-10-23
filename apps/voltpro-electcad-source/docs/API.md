# API

The optional local backend lives in server/server.mjs. It uses Node.js built-in HTTP and SQLite modules and stores data in VOLTPRO_DB_PATH (default ./data/voltpro.sqlite).

## Start locally
npm install
npm run dev:server
npm run dev

Vite proxies /api to http://127.0.0.1:4000.

## Endpoints
- GET /api/health: service status, SQLite status, and whether an AI key is configured.
- GET /api/projects: latest 500 project summaries.
- POST /api/projects: create a project with a name and structured data; records initial revision.
- GET /api/projects/:uuid: load a project and current revision.
- PUT /api/projects/:uuid: update project and create a revision. Optional If-Match revision protects against concurrent overwrites.
- DELETE /api/projects/:uuid: delete a project and its revisions.
- GET /api/projects/:uuid/revisions: list recent revision numbers and timestamps.
- POST /api/ai/design: optional structured design proposal via OpenAI Chat Completions JSON Schema.

Project bodies must contain a non-empty name (max 120 characters) and an object-valued data. JSON bodies are limited to 2 MB. Use HTTPS, user authentication, authorization, rate limiting, backup/restore, audit logging and a deployment-specific CORS allowlist before any network-facing deployment. The current server is intentionally bound to loopback by default and is not a production multi-user service.
