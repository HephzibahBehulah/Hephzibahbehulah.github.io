import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const contract = JSON.parse(read("deployment/cloudflare-build.json"));
const wrangler = JSON.parse(read("wrangler.jsonc"));
const workflow = read(".github/workflows/platform-validation.yml");
const dockerfile = read("Dockerfile");
const deployScript = read(contract.cloudflare.deployScript);
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };

check(contract.cloudflare.productionBranch === "main", "Cloudflare production branch must remain main.");
check(contract.cloudflare.buildCommand === "node platform/release.mjs", "Cloudflare build command must run the verified release builder.");
check(contract.cloudflare.deployCommand === "node platform/cloudflare-build-deploy.mjs", "Cloudflare validation command must use the checked-in wrapper.");
check(contract.cloudflare.workerDeploymentOwner === "GitHub Actions", "GitHub Actions must be the only production Worker deploy owner.");
check(contract.cloudflare.cloudflareBuildsRole === "validation-only", "Cloudflare Workers Builds must remain validation-only.");
check(deployScript.includes("validation-only mode"), "Cloudflare build wrapper must identify itself as validation-only.");
check(!deployScript.includes("wrangler"), "Cloudflare Workers Builds must not deploy production Worker or assets.");
check(wrangler.containers?.some(item => item.class_name === "Sandbox" && item.scheduling_policy === "durable_object" && item.images?.sandbox?.dockerfile === "./Dockerfile"), "The Sandbox Durable Object must retain its declared Docker image.");
check(dockerfile.includes("cloudflare/sandbox:1.0.3"), "The Sandbox helper image must remain pinned.");
check(workflow.includes("docker build --tag adigun-private-sandbox:ci ."), "GitHub Actions must build the Sandbox image with Docker.");
check(workflow.includes("npx wrangler deploy --var"), "GitHub Actions must perform the full production Worker and container deploy.");
check(workflow.indexOf("docker build --tag adigun-private-sandbox:ci .") < workflow.indexOf("npx wrangler deploy --var"), "GitHub must build the image before deploying it.");
if (errors.length) {
  for (const error of errors) console.error("DEPLOYMENT CONTRACT ERROR: " + error);
  process.exit(1);
}
console.log("Verified deployment contract: GitHub Actions is the sole production deploy writer; Cloudflare Workers Builds is validation-only.");