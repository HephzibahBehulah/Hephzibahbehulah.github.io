import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=path.join(root,'apps/voltpro-engineering-source/apps/voltpro-plc');
const html=fs.readFileSync(path.join(app,'index.html'),'utf8');

test('VoltPro PLC loads all twelve companion scripts with valid local paths',()=>{
 const scripts=[...html.matchAll(/<script\b([^>]*)>/gi)].map(match=>match[1]);
 const external=scripts.filter(attrs=>!attrs.includes('src="/src/main.tsx"'));
 assert.equal(external.length,12);
 for(const attrs of scripts){
  const src=attrs.match(/\bsrc="([^"]+)"/)?.[1];
  assert.ok(src,'Every PLC script must have a source.');
  const local=src.startsWith('/')?path.join(app,src.slice(1)):path.resolve(app,src.split('?')[0]);
  assert.ok(fs.existsSync(local),'Missing PLC module: '+src);
  if(src.endsWith('/voltpro-brand.js?v=20261031a'))assert.match(attrs,/\bdefer\b/);
  else assert.match(attrs,/type="module"/);
 }
 const styles=[...html.matchAll(/<link\b([^>]*\brel="stylesheet"[^>]*)>/gi)].map(match=>match[1]);
 assert.equal(styles.length,3);
 for(const attrs of styles){
  const href=attrs.match(/\bhref="([^"]+)"/)?.[1];
  assert.ok(href&&fs.existsSync(path.resolve(app,href.split('?')[0])),'Missing PLC stylesheet: '+href);
 }
});
