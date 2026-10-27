# Production deployment rules

Read this before changing the Worker, Dockerfile, Wrangler configuration, or deployment workflows.

- HephzibahBehulah/Hephzibahbehulah.github.io is the source of truth. Production deploys use main.
- GitHub Actions is the only pipeline that builds and rolls out the Sandbox container image. It has Docker available, builds the pinned image, then performs the full Wrangler deploy.
- Cloudflare Workers Builds is connected to main for release validation and Worker/assets updates. In this account it has no usable Docker CLI. Keep its Deploy command set to node platform/cloudflare-build-deploy.mjs; that wrapper uses wrangler deploy --containers-rollout=none and deliberately leaves the existing Sandbox image to the GitHub workflow.
- Do not replace the Cloudflare command with plain npx wrangler deploy; that attempts a Docker build and fails in this Workers Builds environment.
- Do not rotate GITHUB_TOKEN to troubleshoot Docker. The release builder does not consume that token; inspect build logs and the container deployment path first.
- deployment/cloudflare-build.json records the dashboard contract. platform/check-deployment-contract.mjs validates the repo side; run it through node platform/release.mjs.
- A green GitHub check is not sufficient by itself. Verify the matching Cloudflare build is green and the production Worker is Ready for the same main commit before declaring deployment complete.
- Do not change the container scheduling policy or registry-image strategy without updating this contract and validating a full production rollout.