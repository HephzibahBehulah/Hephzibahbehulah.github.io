# ADIGUN Platform Architecture

## Source of truth

GitHub is the canonical source repository for the website and its application code.

The repository contains the public site, ADIGUN Control interfaces, ADIGUN Tool Lab, Cyber OS, browser-side tools, data catalogues, Worker/API source, backend service boundaries, tests and deployment documentation.

The current repository is private.

## Runtime model

The platform is intentionally split into three layers:

1. Application layer
   - HTML
   - CSS
   - browser JavaScript
   - Cyber OS
   - ADIGUN Control
   - Tool Lab
   - language and responsive systems
   - static data and generated catalogues

2. Service layer
   - HTTP API contracts under `/api/*`
   - authentication boundary
   - AI provider integration
   - GitHub integration
   - optional ML service
   - optional databases/object storage
   - server-side execution boundaries

3. Hosting/provider layer
   - current Cloudflare Worker/Pages-style runtime
   - current Cloudflare-specific bindings and deployment configuration
   - future hosting provider, if required

The application layer must remain usable without assuming that the current hosting provider is permanent.

## Current provider-specific components

The following files are deployment/provider adapters rather than the core browser application:

- `wrangler.jsonc`
- `backend/workers/worker-platform.mjs`
- `backend/workers/worker-public-v2.js`
- `backend/workers/worker-openai.js`
- `backend/workers/worker-v2.js`
- `backend/workers/worker.js`
- `backend/src/worker.js`
- `backend/wrangler.jsonc`
- Cloudflare-specific workflow checks
- Cloudflare-specific AI, Sandbox, Durable Object and binding configuration

These components may remain in the repository while Cloudflare is the active runtime. They must not become assumptions embedded throughout the frontend.

## Stable frontend contract

Frontend service calls use relative application routes such as:

- `/api/health`
- `/api/chat`
- `/api/transcribe`
- `/api/admin/*`

Relative routes are deliberate. They allow the same frontend build to operate behind another host or reverse proxy without rewriting every client module.

A future host adapter should preserve these route contracts whenever practical.

## Provider-neutral service contract

The browser should know:

- which API route to call
- the request format
- the response format
- the authentication/session mechanism exposed to the browser
- safe error behaviour

The browser should not need to know:

- which cloud vendor runs the service
- which AI provider is behind the service
- where private credentials are stored
- how private storage is implemented
- how server-side execution is implemented

## Secrets

Secrets are runtime configuration, never source code.

Known secret names include:

- `OPENAI_API_KEY`
- `ADIGUN_ADMIN_EMAIL`
- `ADIGUN_AGENT_KEY`
- `GITHUB_TOKEN`
- `AI_ADMIN_KEY`
- `ML_SERVICE_URL`

Their values must remain outside GitHub source files and browser JavaScript.

Changing hosting providers means moving the secret values into the new provider's secret store, not changing the frontend code.

## Authentication

The current private control boundary uses Cloudflare Access at the edge and server-side verification.

This is provider-specific infrastructure.

The application-level concept is simply:

`authenticated operator -> authorised control APIs -> allow-listed actions`

If the host changes, only the authentication adapter and deployment configuration should need replacement. The browser-facing control API should remain stable.

## Migration rule

Never migrate by rebuilding the website manually.

The migration unit is the repository state plus its runtime configuration.

Preferred sequence:

`GitHub commit -> build/deploy to staging -> service configuration -> functional verification -> DNS/traffic switch -> monitoring -> retire old runtime`

The old runtime remains active until the replacement has passed verification.

## No destructive migration

Do not:

- delete the current Worker before a replacement is verified
- rewrite the frontend merely to suit a new host
- move secrets into source files
- replace working APIs with provider-specific browser URLs
- change public route contracts without a compatibility plan
- treat a successful Git commit as proof of deployment
- remove the known-good rollback snapshot

## Portability target

A future host change should primarily replace:

- deployment configuration
- runtime adapter
- secret/binding configuration
- provider-specific authentication adapter
- provider-specific storage/compute adapters

It should not require rewriting:

- public page content
- Cyber OS
- ADIGUN Control UI
- Tool Lab
- browser calculators
- search systems
- language system
- responsive system
- knowledge catalogues
- client-side learning tools

## Verification standard

A migration is complete only after:

1. static assets load
2. all major routes load
3. relative API endpoints respond
4. public AI functions work
5. private authentication works
6. admin tools work
7. Cyber OS works
8. Tool Lab works
9. mobile and desktop layouts are checked
10. no secrets are exposed
11. rollback to the previous runtime remains possible

GitHub source validation and live runtime verification are separate evidence.

## Design principle

**GitHub owns the source. The hosting provider runs the application. The application must not depend on the provider unnecessarily.**


## Repository source layout

The repository keeps application sources separate from release tooling and Worker adapters:

- `apps/public/`, `apps/admin/`, and `apps/cyber-os/` contain the public, admin, and Cyber OS HTML entry points.
- `apps/engineering/` contains engineering applications, including the integrated VoltPro ElectCAD source.
- `apps/terminal/` contains terminal and ADIGUN browser modules.
- `packages/shared-ui/`, `packages/shared-data/`, and `packages/shared-i18n/` hold shared presentation assets, data, and language code.
- `backend/workers/` contains the five Worker entry points. The root `wrangler.jsonc` selects `backend/workers/worker-platform.mjs` as the integrated Worker.
- `platform/` remains at the repository root because workflows invoke its release scripts by that path.

Run `node platform/release.mjs` to build `dist-platform/`. The build flattens public and admin HTML into the output root to preserve existing Worker routes, and writes Cyber OS at `dist-platform/cyber-os/index.html`. Shared assets are copied to their established deployed paths. Source locations and deployed routes are separate contracts; update the build mapping when either changes.
