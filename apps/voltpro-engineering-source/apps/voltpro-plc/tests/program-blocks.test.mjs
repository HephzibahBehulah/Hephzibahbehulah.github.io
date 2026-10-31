import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgramBlock, createProgramCall, normalizeProgramStructure, validateProgramStructure } from '../src/program-blocks.mjs';
import { validate } from '../src/model.ts';

const project = () => ({ version: 1, name: 'Plant', mode: 'ladder', nodes: [], edges: [], sheets: [{ id: 'main', name: 'Main' }] });

test('legacy multi-sheet PLC documents normalize into one Main and named subroutine blocks', () => {
  const result = normalizeProgramStructure({ ...project(), sheets: [{ id: 'main', name: 'Main' }, { id: 'power', name: 'Power Sequence' }] });
  assert.deepEqual(result.programBlocks.map(({ kind, sheetId }) => [kind, sheetId]), [['main', 'main'], ['subroutine', 'power']]);
  assert.deepEqual(result.programCalls, []);
  assert.deepEqual(validateProgramStructure(result), []);
  assert.deepEqual(validate(result), []);
});

test('program blocks require one Main, unique sheet ownership, and a configured interrupt trigger', () => {
  const base = normalizeProgramStructure(project());
  assert.match(validateProgramStructure({ ...base, programBlocks: [] }).join(' '), /Main|1–100/);
  const interrupt = createProgramBlock(base, { id: 'irq', sheetId: 'irq_sheet', name: 'Overload trip', kind: 'interrupt', trigger: 'Overload input rising edge' });
  assert.deepEqual(validateProgramStructure(interrupt), []);
  assert.deepEqual(validate(interrupt), []);
  assert.match(validateProgramStructure({ ...interrupt, programBlocks: interrupt.programBlocks.map(block => block.id === 'irq' ? { ...block, trigger: '' } : block) }).join(' '), /needs an event description/);
  assert.match(validateProgramStructure({ ...interrupt, programBlocks: [...interrupt.programBlocks, { ...interrupt.programBlocks[1], id: 'irq_copy' }] }).join(' '), /only one PLC program block/);
});

test('calls resolve across blocks, target only subroutines, and reject recursion or duplicates', () => {
  const first = createProgramBlock(normalizeProgramStructure(project()), { id: 'sequence', sheetId: 'sequence_sheet', name: 'Sequence' });
  const second = createProgramBlock(first, { id: 'cleanup', sheetId: 'cleanup_sheet', name: 'Cleanup' });
  const call = createProgramCall(second, { id: 'call_main_sequence', fromBlockId: 'main', toBlockId: 'sequence' });
  assert.deepEqual(validateProgramStructure(call), []);
  assert.deepEqual(validate(call), []);
  assert.match(validateProgramStructure({ ...call, programCalls: [...call.programCalls, { id: 'recursive', fromBlockId: 'sequence', toBlockId: 'main' }] }).join(' '), /must originate from Main or a subroutine and target a subroutine/);
  const cyclic = { ...call, programCalls: [...call.programCalls, { id: 'to_cleanup', fromBlockId: 'sequence', toBlockId: 'cleanup' }, { id: 'back_to_sequence', fromBlockId: 'cleanup', toBlockId: 'sequence' }] };
  assert.match(validateProgramStructure(cyclic).join(' '), /Recursive PLC program-block calls/);
  assert.ok(validate(cyclic).some(message => /Recursive PLC program-block calls/.test(message)));
  assert.throws(() => createProgramCall(call, { id: 'duplicate', fromBlockId: 'main', toBlockId: 'sequence' }), /Duplicate program call/);
});
