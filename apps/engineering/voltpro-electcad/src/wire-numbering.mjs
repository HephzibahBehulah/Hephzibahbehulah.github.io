export function assignWireReferences(wires, prefix = 'W') {
  if (!Array.isArray(wires)) throw new TypeError('Wire list must be an array.');
  if (typeof prefix !== 'string' || !/^[A-Z][A-Z0-9-]{0,5}$/.test(prefix)) throw new TypeError('Wire reference prefix must be a short uppercase identifier.');
  return wires.map((wire, index) => ({ ...wire, ref: prefix + String(index + 1).padStart(3, '0') }));
}

export function formatSheetZoneReference(sheetNumber, zone) {
  const sheet = String(sheetNumber ?? '').trim();
  const location = String(zone ?? '').trim();
  if (!sheet || !location) return '';
  return 'Sheet ' + sheet + ' / Zone ' + location;
}
