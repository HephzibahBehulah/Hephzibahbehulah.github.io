# Production build handoff

GitHub Actions and Cloudflare Workers Builds both receive pushes to main, but they have separate responsibilities.

GitHub Actions runs docker build --tag adigun-private-sandbox:ci . and then performs the full Wrangler deploy. This workflow owns updates to the Sandbox Durable Object image.

Cloudflare Workers Builds runs the release validation and deploys the Worker code and static assets using node platform/cloudflare-build-deploy.mjs. That checked-in wrapper passes --containers-rollout=none, because this account’s Workers Builds environment cannot start Docker. It leaves the Sandbox image to the full GitHub deploy.

Keep the Worker build connected to main. Keep its build command at node platform/release.mjs and deploy command at node platform/cloudflare-build-deploy.mjs. The deployment contract is checked by platform/check-deployment-contract.mjs, which is part of the release builder.

When a build fails, check the last failing stage first. A completed release build followed by “Docker CLI could not be launched” means the Worker Build deploy command is attempting a container image build. It does not indicate a bad GitHub token. GitHub’s GITHUB_TOKEN is not used by platform/release.mjs; the runtime secret cannot be read back from Cloudflare and should not be rotated without separate evidence.