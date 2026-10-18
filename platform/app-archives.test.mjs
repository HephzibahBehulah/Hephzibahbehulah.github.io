import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveDirectory,extractArchive,digest} from './app-archives.mjs';
test('release archives are deterministic, preserve bytes and reject damaged archives',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hb-release-')),source=path.join(dir,'source');
 fs.mkdirSync(path.join(source,'nested'),{recursive:true});fs.writeFileSync(path.join(source,'nested/runtime.wasm'),Buffer.from([0,97,115,109,255]));
 const archive=archiveDirectory(source);assert.equal(digest(archive),digest(archiveDirectory(source)));
 assert.equal(extractArchive(archive,path.join(dir,'restored')),1);assert.deepEqual(fs.readFileSync(path.join(dir,'restored/nested/runtime.wasm')),Buffer.from([0,97,115,109,255]));
 const damaged=Buffer.from(archive);damaged[0]^=1;assert.throws(()=>extractArchive(damaged,path.join(dir,'bad')),/checksum/);assert.equal(fs.existsSync(path.join(dir,'bad')),false);
 assert.throws(()=>extractArchive(archive,path.join(dir,'restored')),/existing/);
});
