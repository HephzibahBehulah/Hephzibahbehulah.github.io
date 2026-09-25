# Hephzibah Behulah AI Platform Backend

This directory is the server-side foundation for the next generation of hephzibahbehulah.com.

## Architecture

- API gateway: Cloudflare Worker
- AI orchestration: provider-agnostic agent layer
- Knowledge: RAG-ready document and project index
- Storage: database/object storage adapters
- Jobs: queue/scheduled automation adapters
- ML: external Python execution boundary for heavy workloads
- Security: allow-listed tools, rate limits, validation and audit logging

## Important

The backend is intentionally isolated from the current static site. It is not deployed by the current static asset deployment until the production API infrastructure and secrets are configured.

Never commit API keys, tokens, database passwords or private documents here.

## Planned API surface

- GET /api/health
- POST /api/chat
- POST /api/analyze/document
- POST /api/analyze/dataset
- GET /api/projects
- POST /api/automation/run

All privileged actions must be authenticated and tool allow-listed.
