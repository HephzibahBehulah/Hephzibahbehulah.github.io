# ADIGUN Deployment Safety

## Purpose

This file records the rollback discipline for the production Worker and AI Lab.

## Known-good source baseline

- Baseline commit: `c90a74f4641cd6371187d820c07a228acc05ff15`
- Baseline message: `Fix Worker syntax error blocking Cloudflare deployment`
- Snapshot branch: `production-known-good`
- Baseline meaning: preserved source snapshot for emergency rollback. Cloudflare deployment status must be verified independently before treating a snapshot as a production deployment.

## Current main

The `main` branch may move forward only through small, reviewable changes. Do not rewrite history to hide a regression.

## Change discipline

1. Inspect the current file before editing.
2. Make the smallest possible patch.
3. Never replace a large production file when a targeted edit is sufficient.
4. Run the repository CI/static validation after every production-facing change.
5. Verify the live application after deployment.
6. Only then promote a verified commit to the known-good snapshot.
7. Keep the previous known-good source snapshot intact until the new version has been verified.

## Rollback discipline

If a release regresses production:

- Stop further feature changes.
- Identify the last independently verified production commit.
- Restore from that exact commit rather than reconstructing files manually.
- Re-run CI and verify the live Worker before making additional changes.

## Current deployment limitation

`.github/workflows/platform-validation.yml` builds the consolidated applications and runs `npx wrangler deploy`. The source build no longer downloads application archives from production hosts. The latest deployment attempt completed the build and stopped at Wrangler authentication because `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` were empty in the workflow environment. Those Cloudflare credentials must be configured as GitHub Actions secrets before a production deployment can succeed; a source-only change cannot replace Cloudflare account authentication.

## Regression checklist

- AI Lab page loads.
- `/api/health` responds successfully.
- Normal AI Lab chat works.
- Markdown renders as Markdown, not visible escape characters.
- LaTeX remains intact.
- Current/time/weather/news questions require live web evidence.
- Current job/vacancy searches use verified live sources.
- ADIGUN does not introduce itself on every normal answer.
- Public AI Lab does not enter the private admin route.
- ADIGUN Control remains protected by Cloudflare Access.
- HELP/LIST/COMMANDS routing remains functional.
- No secrets are exposed.
- No unrelated production files are changed.

## Rule

A change is not considered production-good merely because GitHub CI is green. It must also pass live regression verification.


## Hosting portability

The application is designed to keep the browser-facing API contract independent from the current hosting provider. Cloudflare-specific Worker, binding and Access configuration is treated as a runtime adapter.

When changing hosts, deploy the replacement in parallel, preserve the current runtime for rollback, keep the relative `/api/*` contract stable, move secrets through the new provider's secret manager, and switch traffic only after functional verification.

See `ARCHITECTURE.md` and `deployment/PORTABILITY.md` for the source-of-truth architecture and migration procedure.
