function nextTag(prefix, used, counters) {
  let tag;
  do {
    const number = (counters[prefix] || 0) + 1;
    counters[prefix] = number;
    tag = `${prefix}-${String(number).padStart(3, '0')}`;
  } while (used.has(tag));
  used.add(tag);
  return tag;
}

export function assignMissingBuildingReferences(doc, referenceForType = () => 'EQ') {
  if (!doc || !Array.isArray(doc.nodes) || !Array.isArray(doc.wires)) throw new TypeError('A BuildingCAD document with equipment and route lists is required.');
  const used = new Set([...doc.nodes, ...doc.wires].map(item => String(item.tag || '').trim()).filter(Boolean));
  const counters = Object.create(null);
  let assignedEquipment = 0, assignedRoutes = 0;
  for (const node of doc.nodes) {
    if (String(node.tag || '').trim()) continue;
    const prefix = String(referenceForType(node.type) || 'EQ').trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 12) || 'EQ';
    node.tag = nextTag(prefix, used, counters);
    assignedEquipment++;
  }
  for (const wire of doc.wires) {
    if (String(wire.tag || '').trim()) continue;
    wire.tag = nextTag('CBL', used, counters);
    assignedRoutes++;
  }
  return { assignedEquipment, assignedRoutes };
}

export function buildingCircuitCrossReferences(doc) {
  const nodes = new Map((doc?.nodes || []).map(node => [node.id, node]));
  return (doc?.circuits || []).map(circuit => ({
    circuit: String(circuit.id || ''),
    label: String(circuit.label || circuit.id || ''),
    floor: circuit.floor || nodes.get(circuit.boardId)?.floor || 1,
    board: nodes.get(circuit.boardId)?.tag || nodes.get(circuit.boardId)?.id || 'Unassigned',
    overcurrentDevice: nodes.get(circuit.overcurrentDeviceId)?.tag || nodes.get(circuit.overcurrentDeviceId)?.id || 'Unassigned',
    rcd: nodes.get(circuit.rcdId)?.tag || nodes.get(circuit.rcdId)?.id || 'Unassigned',
    cableTags: (doc.wires || []).filter(wire => wire.circuit === circuit.id).map(wire => wire.tag || wire.id),
  }));
}
