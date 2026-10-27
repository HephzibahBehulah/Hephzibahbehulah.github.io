"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

test("demo project library docks in the Inspector and never overlays the canvas",()=>{
 const source=fs.readFileSync(path.join(root,"platform/demo-library.js"),"utf8");
 assert.doesNotThrow(()=>new Function(source));
 assert.match(source,/getElementById\("inspectorPanel"\)/);
 assert.match(source,/setPanel\?\.\("right",true\)/);
 assert.match(source,/root\.parentElement!==panel\)panel\.append\(root\)/);
 assert.match(source,/#vpDemoLibrary\{position:relative;width:100%;height:100%/);
 assert.doesNotMatch(source,/#vpDemoLibrary\{position:fixed/);
 assert.match(source,/function close\(\)[\s\S]*?node\.hidden=panel\._demoLibraryHidden\.get\(node\)/);
});

