# Hephzibah Behulah AI Platform Backend

This directory is the independently deployable AI service boundary. The current production site exposes the same safe API contract from its current Worker runtime so the AI platform can operate immediately. The frontend depends on the API contract, not on the implementation vendor. A future host can replace the current Worker adapter without requiring a frontend rewrite.

## API contract

- GET `/api/health`
- GET `/api/projects`
- POST `/api/chat`
- GET `/api/knowledge/search?q=...`
- POST `/api/knowledge/ingest` with the `x-hb-admin-key` secret header
- GET `/api/github/repo?repo=HephzibahBehulah/name`

## Current runtime adapter

The current deployment uses Cloudflare Workers AI through the `AI` binding and AI Search through the `AI_SEARCH` namespace binding. Public chat is rate-limited. Private document ingestion requires the `AI_ADMIN_KEY` secret.

These bindings are implementation details of the current runtime. The browser-facing `/api/*` contract is the stable integration boundary.

Cloudflare's current AI Search Workers Binding supports runtime instance creation, search/chat, and Items uploads. Workers AI uses the `AI` binding. The frontend keeps local document and dataset analysis as the privacy-first path.

## Required secret

Set `AI_ADMIN_KEY` as a Cloudflare Worker secret before enabling private document ingestion. Never commit its value.

Optional `GITHUB_TOKEN` can be stored server-side for higher GitHub API limits. Public unauthenticated GitHub REST access is intentionally limited and should not be treated as an unlimited indexing channel.

## Heavy ML boundary

The edge Worker validates requests, retrieves knowledge, invokes models and coordinates jobs. Large pandas/scikit-learn/LightGBM/CatBoost/XGBoost workloads belong in the separate `ml-service/` boundary.

## Security

No arbitrary shell, filesystem, browser, deployment or remote-command tools are exposed. Future tools must be authenticated, allow-listed, bounded and audited.