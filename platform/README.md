# Platform release

The repository builds the main website, private admin surfaces, shared account services, and cybersecurity workspace. The former engineering suite and `/tools` shell are not part of the release.

## Local validation

Run `node platform/release.mjs` from the repository root. It checks the deployment contract, runs retained platform tests, checks browser scripts, builds the cybersecurity workspace, and produces the integrated Worker assets.

## Deployment ownership

GitHub Actions deploys the production Worker from `main`. Cloudflare Workers Builds is validation-only. See `deployment/cloudflare-build.json` and `platform/check-deployment-contract.mjs`.
