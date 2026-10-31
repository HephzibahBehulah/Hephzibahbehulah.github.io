const NON_MATERIAL_TYPES = new Set(['net-label', 'text-note', 'wire-crossing', 'wire-label', 'no-connect']);
const text = value => typeof value === 'string' ? value.trim() : '';
const number = value => typeof value === 'number' && Number.isFinite(value);

function sourceStatus(manufacturer, partNumber) {
  return manufacturer && partNumber
    ? 'Owner-supplied identity; not independently verified'
    : 'Manufacturer and order code incomplete; sourcing verification required';
}

export function routeGeometryLength(wire) {
  if (!wire || !['x1', 'y1', 'x2', 'y2'].every(key => number(wire[key]))) {
    throw new TypeError('A wire route requires finite start and end coordinates.');
  }
  const horizontal = Math.abs(wire.x2 - wire.x1);
  const vertical = Math.abs(wire.y2 - wire.y1);
  return { horizontal, vertical, total: horizontal + vertical };
}

export function buildManufacturingSchedule(sheets) {
  if (!Array.isArray(sheets)) throw new TypeError('A sheet list is required.');
  const grouped = new Map();
  const cableRuns = [];
  let wireIndex = 0;

  for (const sheet of sheets) {
    if (!sheet || !Array.isArray(sheet.parts) || !Array.isArray(sheet.wires)) {
      throw new TypeError('Every sheet must contain component and wire lists.');
    }
    const sheetName = text(sheet.name) || text(sheet.id) || 'Unnamed sheet';
    for (const part of sheet.parts) {
      if (!part || NON_MATERIAL_TYPES.has(part.type)) continue;
      const type = text(part.type) || 'unspecified';
      const value = text(part.value);
      const manufacturer = text(part.manufacturer);
      const partNumber = text(part.partNumber);
      const tolerance = number(part.tolerance) ? part.tolerance : '';
      const electricalValue = number(part.electricalValue) ? part.electricalValue : '';
      const key = JSON.stringify([type, value, manufacturer, partNumber, tolerance, electricalValue]);
      let item = grouped.get(key);
      if (!item) {
        item = { type, value, manufacturer, partNumber, tolerance, electricalValue, quantity: 0, references: [], sheets: new Set() };
        grouped.set(key, item);
      }
      item.quantity++;
      if (text(part.ref)) item.references.push(text(part.ref));
      item.sheets.add(sheetName);
    }
    for (const wire of sheet.wires) {
      wireIndex++;
      const route = routeGeometryLength(wire);
      const allowance = number(wire.lengthAllowance) && wire.lengthAllowance >= 0 ? wire.lengthAllowance : 0;
      const manufacturer = text(wire.manufacturer);
      const partNumber = text(wire.partNumber);
      cableRuns.push({
        sheet: sheetName,
        reference: text(wire.ref) || `W${String(wireIndex).padStart(3, '0')}`,
        id: text(wire.id),
        net: text(wire.label),
        cableType: text(wire.cableType),
        conductorSize: text(wire.gauge),
        cores: number(wire.cores) ? wire.cores : '',
        color: text(wire.color),
        start: { x: wire.x1, y: wire.y1 },
        end: { x: wire.x2, y: wire.y2 },
        horizontal: route.horizontal,
        vertical: route.vertical,
        geometryLength: route.total,
        userAllowance: allowance || '',
        geometryPlusAllowance: allowance ? route.total + allowance : '',
        manufacturer,
        partNumber,
        sourcingStatus: sourceStatus(manufacturer, partNumber),
        lengthStatus: 'Orthogonal drawing geometry only; verify installed route, slack, bends, and termination tails.'
      });
    }
  }

  const deviceItems = [...grouped.values()].map(item => ({
    ...item,
    references: item.references.sort(),
    sheets: [...item.sheets].sort(),
    sourcingStatus: sourceStatus(item.manufacturer, item.partNumber)
  })).sort((a, b) => a.type.localeCompare(b.type) || a.value.localeCompare(b.value) || a.partNumber.localeCompare(b.partNumber));

  return {
    deviceItems,
    cableRuns,
    totals: {
      deviceQuantity: deviceItems.reduce((sum, item) => sum + item.quantity, 0),
      cableRunCount: cableRuns.length,
      cableGeometryLength: cableRuns.reduce((sum, run) => sum + run.geometryLength, 0)
    },
    notes: [
      'Component identities are user-entered or generic drawing descriptions; this schedule does not assert manufacturer validation, availability, or procurement suitability.',
      'Cable lengths are derived from orthogonal drawing coordinates. They are not installed or cut lengths and exclude surveyed routing, slack, bends, termination tails, and installation allowances unless a user-entered allowance is shown.'
    ]
  };
}
