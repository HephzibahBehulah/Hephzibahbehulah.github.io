import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {generateSeo,publicUrl} from './seo.mjs';

test('build adds descriptions, social tags, favicon and LearningResource metadata',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'hb-seo-'));
 try{
  fs.mkdirSync(path.join(root,'_apps/engineering'),{recursive:true});
  fs.writeFileSync(path.join(root,'_apps/engineering/index.html'),'<html><head><title>VoltPro Engineering Academy</title></head><body><h1>Explore engineering</h1></body></html>');
  const urls=generateSeo(root);
  const html=fs.readFileSync(path.join(root,'_apps/engineering/index.html'),'utf8');
  assert.match(html,/<meta name="description" content=/);
  assert.match(html,/<meta property="og:title"/);
  assert.match(html,/<meta property="og:description"/);
  assert.match(html,/<link rel="icon" href="https:\/\/hephzibahbehulah\.com\/favicon\.ico">/);
  assert.match(html,/<meta property="og:url" content="https:\/\/engineering\.hephzibahbehulah\.com\/">/);
  assert.match(html,/<script type="application\/ld\+json">.*"@type":"LearningResource"/);
  assert.ok(urls.includes('https://engineering.hephzibahbehulah.com/'));
  assert.match(fs.readFileSync(path.join(root,'robots.txt'),'utf8'),/Sitemap: https:\/\/hephzibahbehulah\.com\/sitemap\.xml/);
  assert.match(fs.readFileSync(path.join(root,'_apps/engineering/robots.txt'),'utf8'),/Sitemap: https:\/\/engineering\.hephzibahbehulah\.com\/sitemap\.xml/);
  assert.match(fs.readFileSync(path.join(root,'_apps/engineering/sitemap.xml'),'utf8'),/<loc>https:\/\/engineering\.hephzibahbehulah\.com\/<\/loc>/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('sitemap omits private pages and uses the public app host routes',()=>{
 assert.equal(publicUrl('admin.html'),null);
 assert.equal(publicUrl('_apps/engineering/voltpro-plc/index.html'),'https://engineering.hephzibahbehulah.com/voltpro-plc/');
});

test('generated sitemap excludes account and administrator entry points',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'hb-seo-private-'));
 try{
  for(const name of ['index.html','admin.html','account.html'])fs.writeFileSync(path.join(root,name),'<html><head><title>'+name+'</title></head></html>');
  generateSeo(root);
  const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  assert.match(sitemap,/https:\/\/hephzibahbehulah\.com\//);
  assert.doesNotMatch(sitemap,/admin|account/i);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
