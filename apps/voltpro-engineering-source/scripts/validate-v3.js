const fs=require("node:fs"),cp=require("node:child_process"),path=require("node:path");
function read(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function fail(m){throw new Error("VoltPRo validation: "+m)}
for(const dir of ["platform","engine","tests"]){for(const f of fs.readdirSync(dir).filter(x=>x.endsWith(".js"))){const r=cp.spawnSync(process.execPath,["--check",path.join(dir,f)],{stdio:"inherit"});if(r.status!==0)fail("syntax error in "+path.join(dir,f))}}
for(const p of ["data/challenges.json","data/tutorials.json","data/faults.json","data/component-schema.json","data/component-models.v3.json","data/component-schema.v4.json","data/component-models.v4.json","data/components.v4.json","data/project-schema.v5.json"])read(p);
const models=read("data/component-models.v4.json"),schema=read("data/component-schema.v4.json"),registry=read("data/components.v4.json");
if(models.format!=="voltpro-component-models"||models.version!==4||!Array.isArray(models.components)||models.components.length<10)fail("v4 component model contract");
if(schema.type!=="object"||!schema.required?.includes("version")||!schema.required?.includes("symbols")||!schema.required?.includes("simulation"))fail("v4 component schema contract");
if(registry.format!=="voltpro-components"||registry.version!==4||!Array.isArray(registry.components)||registry.components.length<10)fail("v4 component registry");
for(const x of registry.components){for(const k of ["id","version","name","standards","symbols","assets","pins","parameters","simulation","documentation","tags"])if(x[k]===undefined)fail("component missing "+k+": "+x.id);if(!x.symbols.iecSvg||!x.symbols.ansiSvg)fail("symbol references: "+x.id);for(const asset of [x.symbols.iecSvg,x.symbols.ansiSvg,x.assets.panelImage])if(!fs.existsSync(asset))fail("missing asset: "+asset+" for "+x.id)}
const manifest=read("pwa.webmanifest");if(!manifest.name||!manifest.start_url||!Array.isArray(manifest.icons)||manifest.icons.length<2)fail("PWA manifest");
console.log("VoltPRo v4 data, module and PWA validation: OK");