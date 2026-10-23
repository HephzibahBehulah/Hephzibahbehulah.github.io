const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.join(process.cwd(),"components");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"index.json"),"utf8"));
assert.equal(manifest.totalRecords,768,"component manifest count");
let total=0;
for(const file of manifest.files){
 const full=path.join(process.cwd(),file);
 assert.ok(fs.existsSync(full),`missing component family: ${file}`);
 const family=JSON.parse(fs.readFileSync(full,"utf8"));
 assert.equal(family.format,"voltpro-component-family");
 assert.equal(family.count,family.components.length);
 total+=family.components.length;
 for(const c of family.components){
  assert.ok(c.id&&c.name&&c.category);
  assert.ok(Array.isArray(c.terminals)&&c.terminals.length>=2);
  assert.ok(c.parameters&&typeof c.parameters==="object");
  assert.ok(c.symbol&&c.panelModel&&c.electricalModel&&c.behaviorModel);
  assert.ok(Array.isArray(c.faultModes));
 }
}
assert.equal(total,manifest.totalRecords);
console.log(`Validated ${total} component definitions across ${manifest.files.length} family databases.`);