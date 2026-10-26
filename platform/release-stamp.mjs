import fs from 'node:fs';
import path from 'node:path';
// Put identity in the built HTML so every deploy entry point carries it,
// including Cloudflare Git builds that do not pass GitHub workflow variables.
export function stampRelease(directory, commit) {
 if(!/^[a-f0-9]{40}$/i.test(commit))throw Error('A valid Git commit is required to stamp the release');
 let count=0;
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){walk(file);continue;}
  if(!entry.name.endsWith('.html'))continue;
  const html=fs.readFileSync(file,'utf8');
  if(!/<head\b[^>]*>/i.test(html))continue;
  const clean=html.replace(/<meta\b(?=[^>]*\bname=["']hb-release["'])[^>]*>/gi,'');
  fs.writeFileSync(file,clean.replace(/<head\b[^>]*>/i,head=>head+'<meta name="hb-release" content="'+commit+'">'));
  count++;
 }}
 walk(directory);if(!count)throw Error('Release contains no stampable HTML pages');return count;
}
