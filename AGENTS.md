# Production deployment rules

Read this before changing the Worker, Dockerfile, Wrangler configuration, or deployment workflows.

- HephzibahBehulah/Hephzibahbehulah.github.io is the source of truth. Production deploys use main.
- GitHub Actions is the sole production deployment pipeline for the Worker, assets, and Sandbox container image. It has Docker available, builds the pinned image, then performs the full Wrangler deploy.
- Cloudflare Workers Builds may run release validation from main, but it must not deploy Worker code or assets. Keep its Deploy command set to node platform/cloudflare-build-deploy.mjs; the checked-in wrapper is intentionally validation-only. This prevents a delayed build from overwriting a newer GitHub Actions production release.
- Do not add a second production deploy command to Cloudflare Workers Builds. GitHub Actions is the single writer for production Worker code and assets.
- Do not rotate GITHUB_TOKEN to troubleshoot Docker. The release builder does not consume that token; inspect build logs and the container deployment path first.
- deployment/cloudflare-build.json records the dashboard contract. platform/check-deployment-contract.mjs validates the repo side; run it through node platform/release.mjs.
- A green GitHub check is not sufficient by itself. Verify the GitHub production release validation and confirm the production Worker is Ready for the same main commit before declaring deployment complete.
- Do not change the container scheduling policy or registry-image strategy without updating this contract and validating a full production rollout.