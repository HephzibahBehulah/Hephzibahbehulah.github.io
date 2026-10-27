import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const result = spawnSync(isWindows ? "npx.cmd" : "npx", ["wrangler", "deploy", "--containers-rollout=none"], {
  stdio: "inherit",
  shell: isWindows
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);