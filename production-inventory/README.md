# ADIGUN Production Inventory

This directory is the historical safety ledger for production-facing ADIGUN changes.

It complements `DEPLOYMENT_SAFETY.md` and the `production-known-good` branch.

## Purpose

The inventory records evidence for versions that have been reviewed, tested, deployed, or independently verified. It is deliberately conservative: a green GitHub CI result alone does not make a version production-good.

## Ledger fields

Every recorded version should include:

- Commit
- Date
- Purpose
- CI status
- Live verification
- Cloudflare deployment evidence
- Status
- Rollback branch/tag

## Status meanings

- **SOURCE BASELINE**: preserved source snapshot for rollback; production deployment has not been independently established.
- **DEPLOYED / VERIFIED**: deployment evidence exists and the relevant production behavior was independently checked.
- **CI VERIFIED / LIVE PENDING**: repository validation passed, but live production verification is still required.
- **ROLLBACK CANDIDATE**: explicitly preserved as the version to restore if a regression occurs.
- **RETIRED**: kept for historical evidence but no longer considered a rollback target.

## Rules

1. Never delete or rewrite historical entries to hide a regression.
2. Keep `production-known-good` untouched unless an independently verified replacement is promoted.
3. Record Cloudflare deployment evidence separately from GitHub CI evidence.
4. Do not call a version production-good merely because its commit exists or CI is green.
5. Add a new ledger entry whenever a production-facing version is independently verified.
6. If a release regresses, record the rollback in `ROLLBACK-LOG.md`.

## Current state

The current main branch is the commit that contains this inventory: `efefd6dfa009745cf70b781ac675a72abcd6af1f`.

The preserved rollback snapshot remains:

- Branch: `production-known-good`
- Commit: `c90a74f4641cd6371187d820c07a228acc05ff15`

Cloudflare deployment status must continue to be verified independently because the repository does not contain a workflow that performs `wrangler deploy`.
