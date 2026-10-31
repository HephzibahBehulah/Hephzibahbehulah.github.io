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
  const dictionaries=locales.map(locale=>JSON.parse(read(`packages/shared-data/data/translations/${locale}.json`)));
  for(const dictionary of dictionaries){
    assert.ok(Object.keys(dictionary).length>=220);
    for(const key of ['language selector','save changes','search components','run simulation','ladder logic','verification code']){
      assert.ok(dictionary[key],`missing translation for ${key}`);
    }
  }
});

test('shared account sign-in, onboarding, and recovery copy is translated',()=>{
  const keys=[
    'your hephzibah behulah account',
    'one account for the main website, voltpro academy and cyber learning',
    'password',
    'use your email and password, then verify the code sent to your inbox.',
    'sessions end after five hours without activity. use sign out when you finish, particularly on a shared computer.'
  ];
  const source=read('platform/account.html').toLowerCase();
  for(const key of keys) assert.ok(source.includes(key),`account page is missing ${key}`);
  for(const locale of ['de','yo','pid']){
    const dictionary=JSON.parse(read(`packages/shared-data/data/translations/${locale}.json`));
    for(const key of keys) assert.ok(dictionary[key],`${locale} is missing ${key}`);
    assert.match(dictionary[keys[0]],/HEPHZIBAH BEHULAH/);
  }
});

test('live translation tracks dynamic UI changes and accessibility attributes',()=>{
  const source=read('packages/shared-i18n/language-system.js');
  assert.match(source,/characterData:true/);
  assert.match(source,/attributeFilter:\['placeholder','aria-label','title'\]/);
  assert.match(source,/el\.closest\('\[translate="no"\]'\)/);
  assert.doesNotMatch(source,/\[role="status"\]/);
});
