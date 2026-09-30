import fs from "node:fs/promises";
import path from "node:path";

const SOURCE="https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.csv";
const OUT=path.resolve("cyber-os/data/ports/iana-service-names.json");

const text=await (await fetch(SOURCE,{headers:{"user-agent":"Cyber-OS-IANA-Sync/1.0"}})).text();
if(!text.includes("Service Name")||!text.includes("Port Number")||!text.includes("Transport Protocol"))throw new Error("IANA CSV did not contain the expected registry header.");

function parseCSV(s){
 const rows=[];let row=[],cell="",quoted=false;
 for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
  if(c==='"'){if(quoted&&n==='"'){cell+='"';i++;}else quoted=!quoted;continue;}
  if(c===','&&!quoted){row.push(cell);cell="";continue;}
  if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);cell="";if(row.some(Boolean))rows.push(row);row=[];continue;}
  cell+=c;
 }
 if(cell.length||row.length){row.push(cell);if(row.some(Boolean))rows.push(row);}
 return rows;
}
const rows=parseCSV(text);
const header=rows.shift().map(x=>x.trim().toLowerCase());
const idx=n=>header.indexOf(n);
const out=rows.map(r=>({
 id:`iana-${(r[idx("service name")]||"reserved").toLowerCase()}-${r[idx("port number")]||"na"}-${(r[idx("transport protocol")]||"na").toLowerCase()}`.replace(/[^a-z0-9-]+/g,"-"),
 name:r[idx("service name")]||"Reserved/Unassigned",
 category:"port",
 summary:r[idx("description")]||"IANA service-name and transport-protocol port registration.",
 port:r[idx("port number")]||null,
 transport:(r[idx("transport protocol")]||"").toLowerCase(),
 source:"IANA Service Name and Transport Protocol Port Number Registry",
 sourceUrl:"https://www.iana.org/assignments/service-names-port-numbers/",
 reference:r[idx("reference")]||"",
 registrationDate:r[idx("registration date")]||"",
 modificationDate:r[idx("modification date")]||"",
 assignmentNotes:r[idx("assignment notes")]||"",
 verification:"source-backed",
 verifiedAt:new Date().toISOString().slice(0,10)
})).filter(x=>x.port||x.name!=="Reserved/Unassigned");
const unique=[...new Map(out.map(x=>[x.id,x])).values()];
await fs.mkdir(path.dirname(OUT),{recursive:true});
await fs.writeFile(OUT,JSON.stringify({source:"IANA",sourceUrl:"https://www.iana.org/assignments/service-names-port-numbers/",generatedAt:new Date().toISOString(),count:unique.length,records:unique},null,2)+"\n");
console.log(`Wrote ${unique.length} IANA port records to ${OUT}`);