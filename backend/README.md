# Hephzibah Behulah AI Platform Backend

The server-side intelligence layer for hephzibahbehulah.com. It is intentionally separated from the public static Worker so the portfolio remains fast and stable.

## Current API

- GET `/api/health` — service and capability status
- GET `/api/projects` — curated project intelligence index
- POST `/api/chat` — controlled AI gateway
- Future: document ingestion, RAG retrieval, dataset jobs, automation and ML execution

## Architecture

- **Edge gateway:** Cloudflare Worker
- **AI inference:** Cloudflare Workers AI binding
- **Knowledge:** RAG / AI Search integration boundary
- **Storage:** D1 / R2 bindings can be added without exposing credentials to application code
- **Heavy ML:** external Python job boundary
- **Security:** allow-listed tools, validation, rate limiting and audit logging

Cloudflare documents Workers AI bindings as the mechanism for calling models from a Worker, and also provides AI Search, Vectorize, R2 and D1 bindings for full-stack AI applications. The current code uses the AI binding but deliberately keeps RAG storage separate until the knowledge ingestion contract is finalized.

## Production setup

1. Create/deploy this Worker separately from the static portfolio.
2. Ensure the Worker has a Workers AI binding named `AI`.
3. Attach a dedicated API hostname such as `api.hephzibahbehulah.com` when ready.
4. Point the AI Lab frontend API gateway at that hostname.
5. Add authentication and rate limiting before enabling private memory, document storage or privileged tools.
6. Add RAG storage/search only after the document schema and retention rules are defined.

Never commit API keys, tokens, database passwords or private documents.

## Security boundary

The AI agent must not receive arbitrary shell, network, browser, filesystem or deployment capabilities. Every future tool should have:

- explicit allow-list entry
- input validation
- authentication/authorization
- bounded execution
- audit event
- failure handling

The heavy Python ML engine remains outside the Worker so model training and large dataset processing do not turn the edge API into a compute bottleneck.
