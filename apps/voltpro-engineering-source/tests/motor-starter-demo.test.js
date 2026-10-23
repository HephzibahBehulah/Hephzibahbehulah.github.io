const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

test("motor-starter demo wires each phase through the matching contactor pole and shows PE",()=>{
  const source=fs.readFileSync(path.join(__dirname,"../simulator.js"),"utf8");
  const start=source.indexOf("function demoMotor()");
  const end=source.indexOf("function demoLogic()",start);
  const demo=source.slice(start,end);
  assert.ok(start>=0&&end>start);
  for(const connection of [
    'b:k.id+":2"','b:k.id+":4"','b:k.id+":6"',
    'b:m.id+":0"','b:m.id+":1"','b:m.id+":2"',
    'a:pe.id+":0",b:m.id+":6"'
  ])assert.ok(demo.includes(connection),"missing connection "+connection);
  assert.ok(demo.includes("Motor winding-end links (U2/V2/W2) must be configured from the nameplate"));
  assert.ok(!demo.endsWith("run()}"),"incomplete motor topology must not auto-run");
});
