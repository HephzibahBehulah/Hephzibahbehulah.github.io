const ID = /^[A-Za-z0-9_-]{1,80}$/;
const NAME_LIMIT = 80;

/** Preserve legacy PLC projects while giving each drawing sheet a program owner. */
export function normalizeProgramStructure(project) {
  const sheets = Array.isArray(project?.sheets) && project.sheets.length
    ? project.sheets.map(sheet => ({ ...sheet }))
    : [{ id: 'main', name: 'Main' }];
  const mainSheet = sheets.find(sheet => sheet?.id === 'main') || sheets[0] || { id: 'main', name: 'Main' };
  const programBlocks = Array.isArray(project?.programBlocks)
    ? project.programBlocks.map(block => ({ ...block }))
    : [
        { id: 'main', name: 'Main', kind: 'main', sheetId: mainSheet?.id || 'main' },
        ...sheets.filter(sheet => sheet !== mainSheet).map((sheet, index) => ({
          id: 'sub_' + String(index + 1),
          name: String(sheet.name || ('Subroutine ' + String(index + 1))).slice(0, NAME_LIMIT),
          kind: 'subroutine',
          sheetId: sheet.id,
        })),
      ];
  return { ...project, sheets, programBlocks, programCalls: Array.isArray(project?.programCalls) ? project.programCalls.map(call => ({ ...call })) : [] };
}

export function validateProgramStructure(value) {
  const project = value && typeof value === 'object' ? value : {};
  if (project.programBlocks === undefined && project.programCalls === undefined) return [];
  const errors = [];
  const blocks = project.programBlocks;
  const calls = project.programCalls;
  const sheets = Array.isArray(project.sheets) && project.sheets.length ? project.sheets : [{ id: 'main', name: 'Main' }];
  if (!Array.isArray(blocks) || !blocks.length || blocks.length > 100) return ['PLC program blocks must contain 1–100 blocks.'];
  if (!Array.isArray(calls) || calls.length > 500) errors.push('PLC program calls must contain at most 500 references.');
  const blockIds = new Set();
  const sheetOwners = new Set();
  const byId = new Map();
  let mainCount = 0;
  for (const block of blocks) {
    if (!block || typeof block !== 'object' || !ID.test(block.id || '') || blockIds.has(block.id)) {
      errors.push('PLC program block IDs must be unique valid identifiers.');
      continue;
    }
    blockIds.add(block.id);
    byId.set(block.id, block);
    if (!['main', 'subroutine', 'interrupt'].includes(block.kind)) errors.push('PLC program block ' + block.id + ' has an invalid type.');
    if (block.kind === 'main') mainCount++;
    if (typeof block.name !== 'string' || !block.name.trim() || block.name.length > NAME_LIMIT) errors.push('PLC program block ' + block.id + ' needs a name of 1–' + NAME_LIMIT + ' characters.');
    if (!ID.test(block.sheetId || '') || !sheets.some(sheet => sheet?.id === block.sheetId)) errors.push('PLC program block ' + block.id + ' must reference an existing drawing sheet.');
    if (sheetOwners.has(block.sheetId)) errors.push('Drawing sheet ' + block.sheetId + ' can belong to only one PLC program block.');
    sheetOwners.add(block.sheetId);
    if (block.kind === 'interrupt' && (typeof block.trigger !== 'string' || !block.trigger.trim() || block.trigger.length > 80)) errors.push('Interrupt block ' + block.id + ' needs an event description of at most 80 characters.');
  }
  if (mainCount !== 1) errors.push('A PLC project must have exactly one Main program block.');
  for (const sheet of sheets) if (!sheetOwners.has(sheet?.id)) errors.push('Drawing sheet ' + (sheet?.id || '(unknown)') + ' must be assigned to a program block.');
  if (!Array.isArray(calls)) return [...new Set(errors)];
  const callIds = new Set();
  const pairs = new Set();
  const graph = new Map();
  for (const call of calls) {
    if (!call || typeof call !== 'object' || !ID.test(call.id || '') || callIds.has(call.id)) {
      errors.push('PLC program call IDs must be unique valid identifiers.');
      continue;
    }
    callIds.add(call.id);
    const from = byId.get(call.fromBlockId), to = byId.get(call.toBlockId);
    if (!from || !to) { errors.push('Program call ' + call.id + ' must reference existing source and target blocks.'); continue; }
    if (from.id === to.id) errors.push('Program block ' + from.name + ' cannot call itself.');
    if (!['main', 'subroutine'].includes(from.kind) || to.kind !== 'subroutine') errors.push('Program call ' + call.id + ' must originate from Main or a subroutine and target a subroutine.');
    const pair = from.id + '\0' + to.id;
    if (pairs.has(pair)) errors.push('Duplicate program call from ' + from.name + ' to ' + to.name + '.');
    pairs.add(pair);
    if (!graph.has(from.id)) graph.set(from.id, []);
    graph.get(from.id).push(to.id);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const target of graph.get(id) || []) if (visit(target)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  if ([...byId.keys()].some(visit)) errors.push('Recursive PLC program-block calls are not allowed.');
  return [...new Set(errors)];
}

export function createProgramBlock(project, { id, sheetId, name, kind = 'subroutine', trigger } = {}) {
  const normalized = normalizeProgramStructure(project);
  if (!['subroutine', 'interrupt'].includes(kind)) throw new Error('New PLC program blocks must be subroutines or interrupts.');
  const block = { id, sheetId, name: String(name || '').trim(), kind, ...(kind === 'interrupt' ? { trigger: String(trigger || '').trim() } : {}) };
  const next = { ...normalized, sheets: [...normalized.sheets, { id: sheetId, name: block.name }], programBlocks: [...normalized.programBlocks, block] };
  const errors = validateProgramStructure(next);
  if (errors.length) throw new Error(errors.join(' '));
  return next;
}

export function createProgramCall(project, { id, fromBlockId, toBlockId } = {}) {
  const normalized = normalizeProgramStructure(project);
  const next = { ...normalized, programCalls: [...normalized.programCalls, { id, fromBlockId, toBlockId }] };
  const errors = validateProgramStructure(next);
  if (errors.length) throw new Error(errors.join(' '));
  return next;
}
