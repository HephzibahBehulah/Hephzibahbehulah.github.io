import fs from "node:fs/promises";
import path from "node:path";
const URL="https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json";
const OUT=path.resolve("cyber-os/data/generated/mitre-enterprise.json");
const bundle=await (await fetch(URL,{headers:{"user-agent":"Cyber-OS-MITRE-Sync/1.0"}})).json();
const wanted=new Set(["attack-pattern","course-of-action","intrusion-set","malware","tool","campaign","software"]);
const records=(bundle.objects||[]).filter(x=>wanted.has(x.type)&&!x.revoked&&!x.x_mitre_deprecated).map(x=>({
 id:x.id,name:x.name||x.id,category:x.type,
 summary:x.description?String(x.description).replace(/\s+/g," ").slice(0,700):"MITRE ATT&CK record.",
 source:"MITRE ATT&CK Enterprise",sourceUrl:"https://attack.mitre.org/",
 sourceVersion:"enterprise-attack",verification:"source-backed",
 modified:x.modified||"",platforms:x.x_mitre_platforms||[],
 externalId:(x.external_references||[]).find(r=>r.source_name==="mitre-attack")?.external_id||""
}));
await fs.mkdir(path.dirname(OUT),{recursive:true});
await fs.writeFile(OUT,JSON.stringify({source:"MITRE ATT&CK Enterprise",sourceUrl:"https://attack.mitre.org/",generatedAt:new Date().toISOString(),count:records.length,records},null,2)+"\n");
console.log("MITRE records:",records.length);