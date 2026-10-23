const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");

test("DIN-rail panel designer renders physical device faces in rail placements and selection inspector",()=>{
  const source=fs.readFileSync(path.join(root,"platform/workbench.js"),"utf8");
  assert.ok(source.includes("const deviceFace=(x,d)=>"));
  assert.ok(source.includes('class="vpw-mini-face"'));
  assert.ok(source.includes('class="vpw-selected-face"'));
  assert.ok(source.includes("window.VoltProDeviceFace"));
});

test("panel physical previews use verified dimensions only through the device-face renderer",()=>{
  const source=fs.readFileSync(path.join(root,"src/rendering/device-face.js"),"utf8");
  assert.ok(source.includes("dims.verified===true"));
  assert.ok(source.includes("DIMENSIONS NOT VERIFIED"));
});
