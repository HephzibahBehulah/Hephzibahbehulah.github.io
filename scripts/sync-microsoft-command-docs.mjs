import fs from "node:fs/promises";
import path from "node:path";
import {execFileSync} from "node:child_process";
const root=path.resolve(".cyber-os-source");
await fs.rm(root,{recursive:true,force:true});
await fs.mkdir(root,{recursive:true});
execFileSync("git",["clone","--depth=1","--filter=blob:none","--sparse","https://github.com/MicrosoftDocs/windowsserverdocs.git",path.join(root,"windows")],{stdio:"inherit"});
execFileSync("git",["-C",path.join(root,"windows"),"sparse-checkout","set","WindowsServerDocs/administration/windows-commands"],{stdio:"inherit"});
execFileSync("git",["clone","--depth=1","--filter=blob:none","--sparse","https://github.com/MicrosoftDocs/PowerShell-Docs.git",path.join(root,"powershell")],{stdio:"inherit"});
execFileSync("git",["-C",path.join(root,"powershell"),"sparse-checkout","set","reference/5.1","reference/7.4","reference/7.5","reference/7.6","reference/7.7"],{stdio:"inherit"});
async function walk(dir,arr){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p,arr);else if(e.isFile()&&e.name.endsWith(".md"))arr.push(p)}}
const all=[];await walk(path.join(root,"windows","WindowsServerDocs","administration","windows-commands"),all);
function parseWindows(p,s){const name=path.basename(p,".md");const title=(s.match(/^#\s+(.+)$/m)||[])[1]||name;const desc=(s.match(/^description\s*\|\s*(.+)$/mi)||[])[1]||"Windows command reference.";return {id:"ms-windows-"+name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),name:title,command:name,category:"Windows command",summary:desc.replace(/\`/g,"").trim(),source:"Microsoft Windows Server documentation",sourceUrl:"https://learn.microsoft.com/windows-server/administration/windows-commands/",verification:"source-backed"}}
const windows=[];
for(const p of all)windows.push(parseWindows(p,await fs.readFile(p,"utf8")));
const ps=[];await walk(path.join(root,"powershell"),ps);
function parsePS(p,s){const name=(s.match(/^#\s+(.+)$/m)||[])[1]||path.basename(p,".md");const module=(s.match(/^Module:\s*(.+)$/mi)||[])[1]||"PowerShell";const desc=(s.match(/^Gets?\s+.+$/m)||s.match(/^The\s+.+$/m)||[])[0]||"PowerShell reference.";return {id:"ms-powershell-"+name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),name,category:"PowerShell",module,summary:desc.replace(/\`/g,"").trim(),source:"Microsoft PowerShell documentation",sourceUrl:"https://learn.microsoft.com/powershell/",verification:"source-backed"}}
const powershell=[];
for(const p of ps)if(p.includes(path.sep+"reference"+path.sep))powershell.push(parsePS(p,await fs.readFile(p,"utf8")));
await fs.mkdir("cyber-os/data/generated",{recursive:true});
await fs.writeFile("cyber-os/data/generated/windows-commands.json",JSON.stringify({source:"Microsoft Windows Server documentation",count:windows.length,records:windows},null,2)+"
");
await fs.writeFile("cyber-os/data/generated/powershell.json",JSON.stringify({source:"Microsoft PowerShell documentation",count:powershell.length,records:powershell},null,2)+"
");
console.log("Windows:",windows.length,"PowerShell:",powershell.length);