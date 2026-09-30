import fs from "node:fs/promises";
import path from "node:path";
const urls=["https://www.rfc-editor.org/in-notes/rfc-index.xml","https://www.rfc-editor.org/in-notes/rfc-index.txt"];
let text="";
for(const u of urls){try{const r=await fetch(u);if(r.ok){text=await r.text();if(text.length>1000)break}}catch{}}
if(!text)throw new Error("RFC index unavailable");
const records=[];
if(text.trim().startsWith("<")){
 for(const m of text.matchAll(/<rfc-entry[^>]*>[\s\S]*?<doc-id>RFC\s*([0-9]+)<\/doc-id>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<date[^>]*>[\s\S]*?<month>(.*?)<\/month>[\s\S]*?<year>(\d+)<\/year>[\s\S]*?<\/rfc-entry>/g)){
  records.push({id:"rfc-"+m[1],name:"RFC "+m[1],rfc:m[1],category:"RFC documentation",summary:m[2].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),date:m[3]+" "+m[4],source:"RFC Editor",sourceUrl:"https://www.rfc-editor.org/rfc/rfc"+m[1],verification:"source-backed"});
 }
}
const unique=[...new Map(records.map(x=>[x.id,x])).values()];
const dest="cyber-os/data/generated/rfc-index.json";
await fs.mkdir(path.dirname(dest),{recursive:true});
await fs.writeFile(dest,JSON.stringify({source:"RFC Editor",count:unique.length,records:unique},null,2)+"\n");
console.log("RFC records:",unique.length);