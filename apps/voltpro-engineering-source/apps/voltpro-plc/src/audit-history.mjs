export const AUDIT_STORAGE_KEY = 'voltpro-plc-audit-v1';
export const AUDIT_LIMIT = 300;
const COALESCE_MS = 2000;

const deviceName = node => String(node?.data?.tag || node?.id || 'device');
const serializableDevice = node => {
  if (!node) return null;
  const data = Object.fromEntries(Object.entries(node.data || {}).filter(([name]) => !['active', 'input', 'elapsed'].includes(name)));
  return { id: node.id, data };
};
const wireName = (wire, nodes) => `${deviceName(nodes.get(wire.source))}.${wire.sourceHandle || '?'} ↔ ${deviceName(nodes.get(wire.target))}.${wire.targetHandle || '?'}`;

/** @typedef {{version:number,name:string,mode:string,nodes:{id:string,data:{tag?:string,[key:string]:unknown}}[],edges:{id:string,source:string,target:string,sourceHandle?:string|null,targetHandle?:string|null}[],sheets?:unknown[],faults?:unknown}} Project */

/**
 * Summarizes electrical or logic edits without storing the project contents.
 * Canvas-only position and display-grid edits are excluded.
 * @param {Project} before
 * @param {Project} after
 * @param {{id?:string,at?:string}} [meta]
 */
export function makeAuditEntry(before, after, meta = {}) {
  const changes = [];
  const groupKeys = [];
  const oldNodes = new Map((before.nodes || []).map(node => [node.id, node]));
  const newNodes = new Map((after.nodes || []).map(node => [node.id, node]));
  for (const id of new Set([...oldNodes.keys(), ...newNodes.keys()])) {
    const oldNode = oldNodes.get(id), newNode = newNodes.get(id);
    if (!oldNode) { changes.push(`Added device ${deviceName(newNode)}.`); groupKeys.push(`node:${id}`); }
    else if (!newNode) { changes.push(`Removed device ${deviceName(oldNode)}.`); groupKeys.push(`node:${id}`); }
    else if (JSON.stringify(serializableDevice(oldNode)) !== JSON.stringify(serializableDevice(newNode))) {
      changes.push(`Updated device ${deviceName(newNode)}.`);
      groupKeys.push(`node:${id}`);
    }
  }
  const oldEdges = new Map((before.edges || []).map(edge => [edge.id, edge]));
  const newEdges = new Map((after.edges || []).map(edge => [edge.id, edge]));
  const oldNodeNames = new Map((before.nodes || []).map(node => [node.id, node]));
  const newNodeNames = new Map((after.nodes || []).map(node => [node.id, node]));
  for (const id of new Set([...oldEdges.keys(), ...newEdges.keys()])) {
    const oldEdge = oldEdges.get(id), newEdge = newEdges.get(id);
    if (!oldEdge) { changes.push(`Connected ${wireName(newEdge, newNodeNames)}.`); groupKeys.push(`wire:${id}`); }
    else if (!newEdge) { changes.push(`Removed connection ${wireName(oldEdge, oldNodeNames)}.`); groupKeys.push(`wire:${id}`); }
    else if (JSON.stringify(oldEdge) !== JSON.stringify(newEdge)) { changes.push(`Changed connection ${wireName(newEdge, newNodeNames)}.`); groupKeys.push(`wire:${id}`); }
  }
  if (before.name !== after.name) { changes.push(`Renamed project to ${String(after.name || 'Untitled project')}.`); groupKeys.push('project:name'); }
  if (JSON.stringify(before.sheets || []) !== JSON.stringify(after.sheets || [])) { changes.push('Changed the PLC drawing sheets.'); groupKeys.push('project:sheets'); }
  if (JSON.stringify(before.faults || {}) !== JSON.stringify(after.faults || {})) { changes.push('Changed commissioning fault injection settings.'); groupKeys.push('project:faults'); }
  if (!changes.length) return null;
  const at = meta.at || new Date().toISOString();
  const id = meta.id || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return { id, at, groupKey: [...new Set(groupKeys)].sort().join('|'), summary: changes.join(' '), changes };
}

/** @param {unknown} value */
export function normalizeAudit(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(entry => entry && typeof entry.id === 'string' && typeof entry.at === 'string' && typeof entry.summary === 'string' && Array.isArray(entry.changes) && entry.changes.every(change => typeof change === 'string')).slice(-AUDIT_LIMIT);
}

/** @param {string|null} value */
export function parseAudit(value) {
  try { return normalizeAudit(JSON.parse(value || '[]')); } catch { return []; }
}

/** @param {Array} entries @param {object} entry @param {number} [nowMs] */
export function appendAudit(entries, entry, nowMs = Date.now()) {
  const current = normalizeAudit(entries);
  const previous = current.at(-1);
  if (previous && previous.groupKey && previous.groupKey === entry.groupKey && nowMs - Date.parse(previous.at) <= COALESCE_MS) {
    return [...current.slice(0, -1), { ...entry, id: previous.id }].slice(-AUDIT_LIMIT);
  }
  return [...current, entry].slice(-AUDIT_LIMIT);
}

/** @param {Storage} storage */
export function loadAudit(storage) {
  try { return parseAudit(storage?.getItem(AUDIT_STORAGE_KEY)); } catch { return []; }
}

/** @param {Storage} storage @param {object[]} entries */
export function saveAudit(storage, entries) {
  try { storage?.setItem(AUDIT_STORAGE_KEY, JSON.stringify(normalizeAudit(entries))); return Boolean(storage); } catch { return false; }
}

