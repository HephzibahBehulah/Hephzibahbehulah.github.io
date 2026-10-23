import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {copySharedAssets} from './release-assets.mjs';

test('release copies shared JavaScript, CSS, and favicon into the output',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'hb-release-'));
 const output=path.join(root,'dist');
 fs.mkdirSync(path.join(root,'js','nested'),{recursive:true});
 fs.mkdirSync(path.join(root,'css'),{recursive:true});
 fs.mkdirSync(output);
 fs.writeFileSync(path.join(root,'js','nested','app.js'),'export {};');
 fs.writeFileSync(path.join(root,'css','site.css'),'body{}');
 fs.writeFileSync(path.join(root,'favicon.ico'),Buffer.from([0,0,1,0,0,0]));
 copySharedAssets(root,output);
 assert.equal(fs.readFileSync(path.join(output,'js','nested','app.js'),'utf8'),'export {};');
 assert.equal(fs.readFileSync(path.join(output,'css','site.css'),'utf8'),'body{}');
 assert.deepEqual(fs.readFileSync(path.join(output,'favicon.ico')),Buffer.from([0,0,1,0,0,0]));
 fs.rmSync(root,{recursive:true,force:true});
});
