import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCatalogProject, projectPackageToDocument } from '../src/project-studio.mjs';

test('catalogue project imports every page as populated editable canvas sheets', () => {
  const pkg = generateCatalogProject(123456, 5);
  const doc = projectPackageToDocument(pkg);
  assert.equal(pkg.project.catalogId, 'VP-00123457');
  assert.equal(doc.sheets.length, 5);
  assert.equal(doc.activeSheetId, doc.sheets[0].id);
  assert.ok(doc.sheets.every(sheet => sheet.parts.length >= 5));
  assert.ok(doc.sheets.some(sheet => sheet.wires.length > 0));
  assert.ok(doc.sheets.every(sheet => sheet.parts.some(part => part.type === 'text-note')));
  const ids = doc.sheets.flatMap(sheet => [...sheet.parts.map(part => part.id), ...sheet.wires.map(wire => wire.id)]);
  assert.equal(new Set(ids).size, ids.length);
});

test('100 and 500 sheet imports preserve page counts and populate every sheet', () => {
  for (const count of [100, 500]) {
    const pkg = generateCatalogProject(9999999, count);
    const doc = projectPackageToDocument(pkg);
    assert.equal(doc.sheets.length, count);
    assert.ok(doc.sheets.every(sheet => sheet.parts.length >= 5));
    assert.equal(new Set(doc.sheets.map(sheet => sheet.id)).size, count);
    assert.ok(doc.sheets[count - 1].name.includes(pkg.pages[count - 1].sheetNumber));
  }
});

test('large imported packages give repeated drawing families unique detail sheet titles', () => { const doc = projectPackageToDocument(generateCatalogProject(321, 100)); assert.equal(new Set(doc.sheets.map(sheet => sheet.name)).size, 100); assert.ok(doc.sheets.every(sheet => sheet.parts.some(part => part.type === 'text-note'))); });
