const COLLECTIONS = Object.freeze({
  nodes: 'device', rooms: 'room', walls: 'wall', openings: 'opening',
  dimensions: 'dimension', wires: 'cable route', circuits: 'circuit'
});
const MAX_ENTRIES = 300;
const COALESCE_MS = 1500;
const KEY = 'voltpro-building-audit:v1';

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, '0');
}

export function snapshotBuildingAudit(document) {
  const entities = {};
  const counts = {};
  for (const [collection, label] of Object.entries(COLLECTIONS)) {
    const values = Array.isArray(document?.[collection]) ? document[collection] : [];
    counts[label] = values.length;
    for (const [index, value] of values.entries()) {
      const id = typeof value?.id === 'string' && value.id ? value.id : `index-${index}`;
      entities[`${collection}:${id}`] = hash(JSON.stringify(value));
    }
  }
  const metadata = document?.metadata && typeof document.metadata === 'object' ? document.metadata : {};
  return { project: String(metadata.name || 'Untitled project').slice(0, 80), counts, entities, metadata: hash(JSON.stringify(metadata)) };
}

export function makeBuildingAuditEntry(before, after, { id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, at = new Date().toISOString() } = {}) {
  if (!before || !after || !/^[\w-]{8,80}$/.test(String(id)) || !Number.isFinite(Date.parse(at))) return null;
  if (before.metadata === after.metadata && JSON.stringify(before.entities) === JSON.stringify(after.entities)) return null;
  const changes = { added: 0, removed: 0, modified: 0 };
  for (const key of new Set([...Object.keys(before.entities), ...Object.keys(after.entities)])) {
    const oldValue = before.entities[key], newValue = after.entities[key];
    if (oldValue === undefined) changes.added++;
    else if (newValue === undefined) changes.removed++;
    else if (oldValue !== newValue) changes.modified++;
  }
  if (!changes.added && !changes.removed && !changes.modified) changes.modified = 1;
  const detail = [changes.added && `${changes.added} object${changes.added === 1 ? '' : 's'} added`, changes.removed && `${changes.removed} removed`, changes.modified && `${changes.modified} changed`].filter(Boolean).join(', ');
  return { id: String(id), at: new Date(at).toISOString(), project: after.project, summary: detail || 'Project details changed', changes, counts: after.counts };
}

export function appendBuildingAudit(entries, entry, now = Date.now()) {
  const result = Array.isArray(entries) ? entries.filter(item => item && typeof item.id === 'string' && typeof item.at === 'string').slice(-MAX_ENTRIES) : [];
  if (!entry) return result;
  const previous = result.at(-1);
  if (previous && previous.project === entry.project && now - Date.parse(previous.at) >= 0 && now - Date.parse(previous.at) <= COALESCE_MS) {
    for (const key of ['added', 'removed', 'modified']) previous.changes[key] += entry.changes[key];
    previous.at = entry.at;
    previous.summary = [previous.changes.added && `${previous.changes.added} object${previous.changes.added === 1 ? '' : 's'} added`, previous.changes.removed && `${previous.changes.removed} removed`, previous.changes.modified && `${previous.changes.modified} changed`].filter(Boolean).join(', ');
    previous.counts = entry.counts;
  } else result.push(entry);
  return result.slice(-MAX_ENTRIES);
}

export function loadBuildingAudit(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.filter(item => item && typeof item.id === 'string' && typeof item.at === 'string' && typeof item.summary === 'string').slice(-MAX_ENTRIES) : [];
  } catch { return []; }
}

export function saveBuildingAudit(storage, entries) {
  try { storage?.setItem(KEY, JSON.stringify((Array.isArray(entries) ? entries : []).slice(-MAX_ENTRIES))); return true; }
  catch { return false; }
}
