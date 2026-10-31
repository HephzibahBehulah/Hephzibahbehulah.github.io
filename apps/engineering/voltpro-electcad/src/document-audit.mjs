const MAX_ENTRIES = 300;
const COALESCE_MS = 1500;

export function summarizeDocumentSnapshot(snapshot) {
  const document = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
  const sheets = Array.isArray(document?.sheets) ? document.sheets : [];
  return {
    sheets: sheets.length,
    devices: sheets.reduce((count, sheet) => count + (Array.isArray(sheet.parts) ? sheet.parts.length : 0), 0),
    wires: sheets.reduce((count, sheet) => count + (Array.isArray(sheet.wires) ? sheet.wires.length : 0), 0),
  };
}

export function documentAuditKey(projectName) {
  return `voltpro-electcad-audit:${encodeURIComponent(String(projectName || 'Untitled electrical project').trim().toLowerCase())}`;
}

export function readDocumentAudit(projectName, storage = globalThis.localStorage) {
  try {
    const entries = JSON.parse(storage?.getItem(documentAuditKey(projectName)) || '[]');
    return Array.isArray(entries) ? entries.filter(entry => entry && Number.isFinite(entry.at)).slice(-MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function recordDocumentAudit(projectName, beforeSnapshot, afterSnapshot, options = {}) {
  const storage = options.storage ?? globalThis.localStorage;
  if (!storage) return [];
  const before = summarizeDocumentSnapshot(beforeSnapshot);
  const after = summarizeDocumentSnapshot(afterSnapshot);
  const entry = {
    at: Number.isFinite(options.at) ? options.at : Date.now(),
    project: String(projectName || 'Untitled electrical project').slice(0, 120),
    before,
    after,
    changes: {
      sheets: after.sheets - before.sheets,
      devices: after.devices - before.devices,
      wires: after.wires - before.wires,
    },
  };
  const entries = readDocumentAudit(projectName, storage);
  const previous = entries.at(-1);
  if (previous && entry.at - previous.at <= COALESCE_MS) {
    const initial = previous.before;
    entries[entries.length - 1] = {
      ...entry,
      at: previous.at,
      before: initial,
      changes: {
        sheets: entry.after.sheets - initial.sheets,
        devices: entry.after.devices - initial.devices,
        wires: entry.after.wires - initial.wires,
      },
    };
  } else {
    entries.push(entry);
  }
  const bounded = entries.slice(-MAX_ENTRIES);
  storage.setItem(documentAuditKey(projectName), JSON.stringify(bounded));
  return bounded;
}

export function exportDocumentAudit(projectName, entries = readDocumentAudit(projectName)) {
  return JSON.stringify({ schemaVersion: 1, project: String(projectName || 'Untitled electrical project'), exportedAt: new Date().toISOString(), entries }, null, 2);
}
