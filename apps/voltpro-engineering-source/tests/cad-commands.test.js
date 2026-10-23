const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function load(){const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/cad/commands.js','utf8'),ctx);return ctx.window.VoltProCadCommands}
test('CAD position snaps to grid',()=>{const c=load();assert.equal(JSON.stringify(c.move({id:'A'},23,41,20).position),JSON.stringify({x:20,y:40}))});
test('rotation wraps at 360 degrees',()=>{const c=load();assert.equal(c.rotate({id:'A',rotation:270},90).rotation,0)})
