export function auditWireColorConsistency(wires) {
  if (!Array.isArray(wires)) throw new TypeError('A wire list is required.');
  const labels = new Map();
  for (const wire of wires) {
    const label = String(wire?.label || '').trim();
    const color = String(wire?.color || '').trim().toLowerCase();
    if (!label || !color) continue;
    const key = label.toLocaleLowerCase();
    const record = labels.get(key) || { label, colors: new Set(), references: [] };
    record.colors.add(color);
    if (wire.ref) record.references.push(String(wire.ref));
    labels.set(key, record);
  }
  return [...labels.values()]
    .filter(record => record.colors.size > 1)
    .map(record => ({
      code: 'NET_COLOR_MISMATCH',
      severity: 'warning',
      label: record.label,
      colors: [...record.colors].sort(),
      references: record.references.sort(),
      basis: 'Project-local visual consistency advisory; not a wiring-colour standard check.'
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
