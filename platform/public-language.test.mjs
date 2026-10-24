import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');

test('release keeps Simulator, Breadboard and PLC UI available to translation',()=>{
  const build=read('platform/build.mjs');
  assert.doesNotMatch(build,/translate=["']no["']/);
  assert.match(build,/voltpro-plc/);
  assert.match(build,/simulator\.html/);
  assert.match(build,/breadboard\.html/);
  assert.match(build,/shared,'language-system\.js'/);
  assert.match(build,/shared,'data\/translations'/);
  assert.match(read('platform/router.mjs'),/\/_hb\/language-system\.js/);
});

test('all supported language dictionaries cover common and engineering UI terms',()=>{
  const locales=['de','yo','pid'];
  const dictionaries=locales.map(locale=>JSON.parse(read(`data/translations/${locale}.json`)));
  for(const dictionary of dictionaries){
    assert.ok(Object.keys(dictionary).length>=220);
    for(const key of ['language selector','save changes','search components','run simulation','ladder logic','verification code']){
      assert.ok(dictionary[key],`missing translation for ${key}`);
    }
  }
});

test('live translation tracks dynamic UI changes and accessibility attributes',()=>{
  const source=read('js/language-system.js');
  assert.match(source,/characterData:true/);
  assert.match(source,/attributeFilter:\['placeholder','aria-label','title'\]/);
  assert.match(source,/el\.closest\('\[translate="no"\]'\)/);
  assert.doesNotMatch(source,/\[role="status"\]/);
});
