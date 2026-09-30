import fs from "node:fs/promises";
import path from "node:path";
import {execFileSync} from "node:child_process";
const root=path.resolve(".cyber-os-source/man-pages");
await fs.rm(root,{recursive:true,force:true});
await fs.mkdir(path.dirname(root),{recursive:true});
execFileSync("git",["clone","--depth=1","https://git.kernel.org/pub/scm/docs/man-pages/man-pages.git",root],{stdio:"inherit"});
const records=[];
async function walk(dir){
 for(const e of await fs.readdir(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name);
  if(e.isDirectory())await walk(p);
  else if(e.isFile()&&/\.(1|2|3|4|5|6|7|8|man)$/.test(e.name)){
   const m=e.name.match(/^(.*)\.(1|2|3|4|5|6|7|8|man)$/);const name=m[1],section=m[2];
   records.push({id:"linux-man-"+name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+section,name,command:name,section,category:"Linux man page",summary:"Linux manual-page reference for "+name+" (section "+section+").",source:"Linux man-pages project",sourceUrl:"https://man7.org/linux/man-pages/",verification:"source-backed"});
  }
 }
}
await walk(root);
const unique=[...new Map(records.map(x=>[x.id,x])).values()];
const dest="cyber-os/data/generated/linux-manpages.json";
await fs.mkdir(path.dirname(dest),{recursive:true});
await fs.writeFile(dest,JSON.stringify({source:"Linux man-pages project",count:unique.length,records:unique},null,2)+"\n");
console.log("Linux man pages:",unique.length);