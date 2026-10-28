const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

test("simulator recovery binds to the published simulator state and project loader",()=>{
  const source=fs.readFileSync(path.join(__dirname,"..","simulator.js"),"utf8");
  const integration=source.slice(source.indexOf("// Recovery snapshots"));
  assert.match(integration,/const ui=window\.VoltProUI,sim=window\.VoltProSimulator/);
  assert.match(integration,/mode:sim\.state\.mode,components:sim\.state\.components,wires:sim\.state\.wires/);
  assert.match(integration,/await sim\.loadProject\(data\)/);
  assert.doesNotMatch(integration,/ui\\.state|ui\\.loadProject/);
});
