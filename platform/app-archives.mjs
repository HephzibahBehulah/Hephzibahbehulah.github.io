import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const digest=data=>crypto.createHash('sha256').update(data).digest('hex');
function header(name,size){
 const h=Buffer.alloc(512),slash=name.lastIndexOf('/');
 let base=name,prefix='';if(Buffer.byteLength(base)>100){prefix=name.slice(0,slash);base=name.slice(slash+1);}
 if(Buffer.byteLength(base)>100||Buffer.byteLength(prefix)>155)throw Error('Archive path too long');
 h.write(base,0,100);h.write('0000644\0',100);h.write('0000000\0',108);h.write('0000000\0',116);h.write(size.toString(8).padStart(11,'0')+'\0',124);h.write('00000000000\0',136);h.fill(32,148,156);h[156]=48;h.write('ustar\0',257);h.write('00',263);h.write(prefix,345,155);
 h.write([...h].reduce((a,b)=>a+b,0).toString(8).padStart(6,'0')+'\0 ',148);return h;
}
export function archiveDirectory(directory){
 const chunks=[];
 function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){if(e.name==='releases')continue;const file=path.join(dir,e.name);if(e.isDirectory())visit(file);else if(e.isFile()){const data=fs.readFileSync(file),name=path.relative(directory,file).replaceAll('\\','/');chunks.push(header(name,data.length),data,Buffer.alloc((512-data.length%512)%512));}else throw Error('Unsupported archive entry');}}
 visit(directory);chunks.push(Buffer.alloc(1024));return Buffer.concat(chunks);
}
export function extractArchive(data,destination){
 const root=path.resolve(destination);if(fs.existsSync(root))throw Error('Refusing to replace existing application source');
 const entries=[];let offset=0;
 while(offset+512<=data.length){const h=data.subarray(offset,offset+512);offset+=512;if(h.every(x=>x===0))break;
  const str=(start,length)=>h.subarray(start,start+length).toString('utf8').split('\0')[0];
  const saved=Number.parseInt(str(148,8).trim(),8),check=Buffer.from(h);check.fill(32,148,156);if(saved!==[...check].reduce((a,b)=>a+b,0))throw Error('Invalid archive checksum');
  const name=(str(345,155)?str(345,155)+'/':'')+str(0,100),size=Number.parseInt(str(124,12),8),target=path.resolve(root,name);
  if(h[156]!==48||!Number.isSafeInteger(size)||size<0||offset+size>data.length||name.includes('\\')||name.split('/').some(x=>x==='..'||x==='.')||!target.startsWith(root+path.sep))throw Error('Unsafe application archive');
  entries.push({target,data:data.subarray(offset,offset+size)});offset+=Math.ceil(size/512)*512;
 }
 if(!entries.length)throw Error('Empty application archive');
 for(const entry of entries){fs.mkdirSync(path.dirname(entry.target),{recursive:true});fs.writeFileSync(entry.target,entry.data);}
 return entries.length;
}
export function publishArchives(destination,lock){
 const releases={version:1,applications:{}};
 for(const app of ['engineering','cyber']){const dir=path.join(destination,'_apps',app),data=archiveDirectory(dir),sha256=digest(data),name=lock[app].commit+'.tar';if(data.length>25*1024*1024)throw Error('Application release exceeds asset size limit');fs.mkdirSync(path.join(dir,'releases'),{recursive:true});fs.writeFileSync(path.join(dir,'releases',name),data);releases.applications[app]={...lock[app],url:`https://${app}.hephzibahbehulah.com/releases/${name}`,sha256,bytes:data.length};}
 return releases;
}
export {digest};
