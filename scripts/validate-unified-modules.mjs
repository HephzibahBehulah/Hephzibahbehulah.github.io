import fs from 'node:fs';
import path from 'node:path';

const exists = p => fs.existsSync(p);
const requiredVolt = ['index.html','simulator.html','breadboard.html','engineering.html','academy-workbench.html','simulator.js','engine/voltpro-engine.js','service-worker.js','pwa.webmanifest','components/index.json'];
for (const name of requiredVolt) if (!exists('apps/voltpro/' + name)) throw Error('Missing VoltPRo module: ' + name);
for (const name of ['index.html','app.js','style.css','data.json','tools/registry.json','learning/paths.json','labs/registry.json','quizzes/questions.json']) if (!exists('apps/pentesting/' + name)) throw Error('Missing cyber module: ' + name);
for (const file of ['index.html','admin.html','admin-tools.html','cyber-os/index.html','worker-openai.js','worker-public-v2.js']) if (!exists(file)) throw Error('Existing platform file missing: ' + file);
const data = JSON.parse(fs.readFileSync('apps/pentesting/data.json','utf8'));
if (data.tools.length !== 154 || data.resources.length !== 183 || data.paths.length !== 9 || data.labs.length !== 4 || data.questions.length !== 70) throw Error('Unexpected cybersecurity catalogue change');
if (!fs.readFileSync('index.html','utf8').includes('id="unified-platform"')) throw Error('Unified navigation missing');
if (fs.readFileSync('apps/pentesting/app.js','utf8').includes("register('./sw.js')")) throw Error('Incomplete service-worker activation in cybersecurity module');
for (const root of ['apps/voltpro','apps/pentesting']) {
  const walk = d => { for (const ent of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,ent.name); if(ent.isDirectory()) walk(p); else if(/\.json$/.test(p)) JSON.parse(fs.readFileSync(p,'utf8')); } };
  walk(root);
}
for (const file of ['index.html','simulator.html','breadboard.html','engineering.html','academy-workbench.html']) {
  const html = fs.readFileSync('apps/voltpro/'+file,'utf8');
  const ref = /(?:src|href)\s*=\s*["']([^"'#]+)["']/g;
  let match;
  while ((match = ref.exec(html))) {
    const target = match[1].split('?')[0];
    if (/^(?:https?:|data:|mailto:|\/)/.test(target)) continue;
    const candidate=path.normalize(path.join('apps/voltpro',target));
    if (!candidate.startsWith(path.normalize('apps/voltpro'))) throw Error('Unsafe relative path '+target);
    if (!exists(candidate)) throw Error(file+' references missing file: '+target);
  }
}
console.log('Unified module manifests, curated data, and primary relative assets OK');
