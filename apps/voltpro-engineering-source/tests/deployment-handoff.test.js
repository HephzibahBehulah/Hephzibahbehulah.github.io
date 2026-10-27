const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const app=path.resolve(__dirname,"..");
const root=path.resolve(app,"../..");
const doc=fs.readFileSync(path.join(app,"docs/DEPLOYMENT-HANDOFF.md"),"utf8");
const deploy=fs.readFileSync(path.join(root,"platform/cloudflare-build-deploy.mjs"),"utf8");

test("future deployment agents keep Docker image rollout in the GitHub pipeline",()=>{
 assert.match(doc,/workflow owns updates to the Sandbox Durable Object image/i);
 assert.match(doc,/GITHUB_TOKEN is not used/i);
 assert.match(deploy,/--containers-rollout=none/);
 assert.doesNotMatch(deploy,/wrangler deploy(?!.*containers-rollout)/s);
});