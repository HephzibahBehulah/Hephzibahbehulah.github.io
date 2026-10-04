# Hosting Portability and Migration Runbook

## Objective

Keep the existing website fully functional today while making a future hosting change predictable and low risk.

This document is an operational runbook. It does not change application behaviour by itself.

## Current state

- Source of truth: private GitHub repository
- Default branch: `main`
- Current runtime: Cloudflare-based Worker/API architecture
- Frontend API style: relative `/api/*` routes
- Private control: authenticated edge plus server-side authorisation
- Rollback source snapshot: `production-known-good`

## What must remain stable

### URLs and routes

Preserve existing public URLs unless a deliberate redirect plan exists.

Preserve application API contracts:

```
GET  /api/health
GET  /api/projects
POST /api/chat
POST /api/transcribe
GET  /api/knowledge/search
POST /api/knowledge/ingest
GET  /api/github/repo
GET  /api/admin/capabilities
GET  /api/admin/commands
POST /api/admin/sandbox
```

The exact currently implemented route set remains defined by the runtime source. Do not add or remove routes during a host migration without checking their consumers first.

## Provider adapter inventory

### Cloudflare-specific

- `wrangler.jsonc`
- Worker entrypoints
- Workers AI binding
- AI Search binding
- Sandbox container
- Durable Object binding
- rate-limit binding
- Cloudflare Access JWT verification
- Cloudflare custom-domain routes

### Provider-neutral

- page HTML
- shared CSS
- browser JavaScript
- Cyber OS data and UI
- Tool Lab calculators
- knowledge catalogues
- language system
- responsive system
- public learning content
- relative API contracts

## Migration procedure

### Phase 1: freeze the source

1. Record the current production commit.
2. Do not rewrite history.
3. Preserve the known-good rollback branch.
4. Record current runtime variables and secret names, never their values.

### Phase 2: build the replacement adapter

Create the new provider runtime separately.

The replacement must expose the same browser-facing API contracts.

Do not change frontend JavaScript merely because the new provider uses different server technology.

### Phase 3: move runtime configuration

Create the equivalent secret and configuration entries on the new host.

Move values through the provider's secret-management system.

Never paste secrets into:

- HTML
- JavaScript
- JSON configuration committed to Git
- GitHub Actions logs
- browser localStorage

### Phase 4: deploy in parallel

Keep the existing production runtime online.

Deploy the replacement to a staging hostname.

Do not switch the main domain yet.

### Phase 5: verification

Check:

- homepage
- profile
- Cyber OS
- ADIGUN Control
- ADIGUN Tool Lab
- Public AI
- Admin AI
- terminal
- API health
- authentication
- file/voice/image/video flows
- search
- calculators
- language selector
- responsive layout
- service error handling

### Phase 6: traffic switch

Only after verification:

1. lower DNS TTL if necessary
2. switch the relevant DNS/traffic record
3. monitor both public and private routes
4. retain the old runtime during the observation window

### Phase 7: rollback

If a regression appears:

1. restore traffic to the old runtime
2. preserve logs/evidence
3. identify the failing adapter
4. fix the replacement
5. repeat staging verification
6. switch traffic again only after verification

### Phase 8: retirement

Retire the old provider only after:

- the new runtime is stable
- authentication is confirmed
- all required APIs work
- backups/rollback are confirmed
- DNS has fully converged
- no critical errors remain

## What not to migrate

Do not migrate the Git history into the hosting platform as the source of truth.

The host is replaceable.

GitHub remains the canonical source repository.

## Zero-regression principle

No migration is considered successful if it preserves only the homepage.

The whole application is the migration unit, including:

`public site + Cyber OS + ADIGUN Control + Tool Lab + AI + APIs + authentication + data + automation`

## Security rule

A private GitHub repository protects source visibility, but it does not replace runtime security.

Keep private logic, credentials and sensitive datasets behind authenticated server-side boundaries.

## Evidence rule

A GitHub commit proves source state.

A CI result proves repository checks.

A live deployment check proves runtime behaviour.

These are separate facts and must be recorded separately.
