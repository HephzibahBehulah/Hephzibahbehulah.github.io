import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const spec = fs.readFileSync(new URL('../apps/voltpro-engineering-source/docs/VOLTPRO-ENGINEERING-TOOLS-FUNCTIONAL-SPEC.md', import.meta.url), 'utf8');
const capabilities = ['DRC', 'Wire numbering', 'BOM', 'Multi-sheet', 'History', 'Smart Wire'];
const tools = [
  'VoltPro PLC',
  'VoltPro Simulator',
  'VoltPro ElectCAD',
  'VoltPro Breadboard',
  'VoltPro Electrical Building'
];

test('each tool documents each requested capability and its implementation gap', () => {
  const matrix = spec.split('## Six-capability implementation and gap register')[1];
  assert.ok(matrix, 'capability register exists');
  for (const tool of tools) {
    const start = matrix.indexOf(`### ${tool}`);
    assert.notEqual(start, -1, `${tool} section exists`);
    const end = matrix.indexOf('\n### ', start + 5);
    const section = matrix.slice(start, end === -1 ? matrix.indexOf('**Overall verification:**', start) : end);
    for (const capability of capabilities) {
      const row = section.split('\n').find(line => line.startsWith(`| ${capability} |`));
      assert.ok(row, `${tool} explicitly addresses ${capability}`);
      assert.match(row, /\*\*(?:Partial|Gap)\.?\*\*/, `${tool} labels ${capability} status`);
    }
  }
  assert.match(matrix, /requirements are \*\*not fully implemented\*\*/);
});
