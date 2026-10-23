import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('src/component-library.ts','utf8');
const javascript=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('module','exports',javascript)(module,module.exports);
const {componentLibrary,componentCategories,searchComponents,getFamilyVariant,generateFamilyVariants}=module.exports;

test('catalogue has a broad unique component type set',()=>{
  assert.ok(componentLibrary.length>=130);
  assert.equal(new Set(componentLibrary.map(x=>x.id)).size,componentLibrary.length);
  assert.ok(componentCategories.length>=10);
});

test('catalogue search filters by category and text',()=>{
  assert.ok(searchComponents('resistor').some(x=>x.id==='resistor'));
  assert.ok(searchComponents('', 'Semiconductors').every(x=>x.category==='Semiconductors'));
});

test('million-range variants are addressed lazily without allocating the full family',()=>{
  const first=getFamilyVariant('resistor',0,1000000);
  const last=getFamilyVariant('resistor',999999,1000000);
  assert.ok(first && last);
  assert.notEqual(first.defaultValue,last.defaultValue);
  assert.equal(getFamilyVariant('resistor',1000000,1000000),null);
  assert.equal(generateFamilyVariants('resistor',12).length,12);
});
