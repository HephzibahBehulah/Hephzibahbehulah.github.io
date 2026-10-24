import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'STATUS.txt');
const outputPath = path.join(root, 'gaps.json');
const columns = ['Gap ID', 'Tool', 'Capability', 'Current status', 'Blocker type', 'Owner action required', 'Acceptance test name'];
const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/);
const tableRows = lines.filter(line => /^\|[^|]+\|/.test(line) && !/^\|\s*-+\s*\|/.test(line));
if (tableRows.shift()?.split('|').slice(1, -1).map(cell => cell.trim()).join('|') !== columns.join('|')) throw new Error('STATUS.txt gap register header is invalid.');
const rows = tableRows.map((line, index) => {
  const values = line.split('|').slice(1, -1).map(cell => cell.trim());
  if (values.length !== columns.length || values.some(value => !value)) throw new Error(`Malformed STATUS.txt row ${index + 1}.`);
  const [id, tool, capability, status, blockers, owner, acceptanceTest] = values;
  if (!['PLC', 'Simulator', 'ElectCAD', 'Breadboard', 'Building'].includes(tool)) throw new Error(`${id}: unknown tool.`);
  if (!['DRC', 'Wire Numbering', 'BOM', 'Multi-Sheet', 'History', 'Smart Wire'].includes(capability)) throw new Error(`${id}: unknown capability.`);
  if (!['Complete', 'Partial', 'Not Started'].includes(status)) throw new Error(`${id}: unknown status.`);
  return { gapId:id, tool, capability, currentStatus:status, blockerType:blockers.split(';').map(value => value.trim()), ownerActionRequired:owner, acceptanceTestName:acceptanceTest };
});
if (rows.length !== 30 || new Set(rows.map(row => row.gapId)).size !== rows.length) throw new Error('Gap register must contain 30 unique capability rows.');
const output = JSON.stringify({ schemaVersion:1, source:'STATUS.txt', updatedAt:'2026-10-24', gaps:rows }, null, 2) + '\n';
const testDirectory = path.join(root, 'platform', 'acceptance', 'gaps');
const testFiles = new Map(['PLC', 'Simulator', 'ElectCAD', 'Breadboard', 'Building'].map(tool => [tool, path.join(testDirectory, `${tool.toLowerCase()}-gaps.test.mjs`)]));
for (const [tool, file] of testFiles) {
  const cases = rows.filter(row => row.tool === tool).map(row => `test.todo(${JSON.stringify(row.acceptanceTestName)});`);
  if (cases.length !== 6) throw new Error(`${tool} must have six gap acceptance tests.`);
  const source = `import { test } from 'node:test';\n\n${cases.join('\n')}\n`;
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== source) throw new Error(`Acceptance scaffold is stale: ${path.relative(root, file)}.`);
  } else {
    fs.mkdirSync(testDirectory, { recursive:true });
    fs.writeFileSync(file, source);
  }
}
if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== output) throw new Error('gaps.json is stale; run node platform/generate-gaps.mjs.');
  console.log(`Verified ${rows.length} gap rows and 30 acceptance test scaffolds against STATUS.txt.`);
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`Generated ${rows.length} gap rows and 30 acceptance test scaffolds from STATUS.txt.`);
}
