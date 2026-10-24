export const BUILDING_TYPES = Object.freeze({
  "distribution-board": { label: "Distribution board", system: "power", defaultVoltage: "230 V AC" },
  "wall-switch": { label: "Wall switch", system: "power", defaultVoltage: "230 V AC" },
  "schuko-socket": { label: "Socket outlet", system: "power", defaultVoltage: "230 V AC" },
  "ceiling-light": { label: "Luminaire outlet", system: "power", defaultVoltage: "230 V AC" },
  "data-point": { label: "Data outlet", system: "data", defaultVoltage: "SELV / data" }
});

export function createBuildingDocument(metadata = {}) {
  return {
    format: "voltpro.buildingcad",
    version: 2,
    units: "mm",
    gridMillimetres: 200,
    metadata: {
      name: metadata.name || "Residential electrical plan",
      date: metadata.date || new Date().toISOString().slice(0, 10),
      scale: metadata.scale || "1:50",
      drafter: metadata.drafter || "",
      documentNumber: metadata.documentNumber || "",
      revision: metadata.revision || "A"
    },
    layers: { architecture: true, power: true, data: true },
    rooms: [],
    nodes: [],
    wires: []
  };
}

export function recoverBuildingDocument(raw) {
  if (!raw || typeof raw !== "object") throw new TypeError("Project file must contain a JSON object.");
  if (raw.format !== "voltpro-buildingcad" && raw.format !== "voltpro.buildingcad") throw new TypeError("This is not a VoltPro BuildingCAD project.");
  if (!Number.isInteger(raw.version) || raw.version > 2 || raw.version < 1) throw new RangeError("Unsupported BuildingCAD project version.");
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.wires)) throw new TypeError("Project is missing its device or connection list.");
  const doc = createBuildingDocument(raw.metadata || {});
  doc.rooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  doc.nodes = raw.nodes.map((node, i) => ({
    ...node,
    id: String(node.id || `B${i + 1}`),
    tag: String(node.tag || ""),
    room: String(node.room || ""),
    voltage: String(node.voltage || BUILDING_TYPES[node.type]?.defaultVoltage || ""),
    circuit: String(node.circuit || ""),
    mountingHeight: Number.isFinite(Number(node.mountingHeight)) ? Number(node.mountingHeight) : 0,
    x: Number(node.x),
    y: Number(node.y)
  }));
  doc.wires = raw.wires.map((wire, i) => ({ ...wire, id: String(wire.id || `W${i + 1}`) }));
  doc.layers = { ...doc.layers, ...(raw.layers || {}) };
  if (raw.version === 1 && Number.isFinite(raw.gridMillimetres)) doc.gridMillimetres = raw.gridMillimetres;
  return doc;
}

export function validateBuildingDocument(doc) {
  const errors = [], warnings = [];
  if (!doc || doc.format !== "voltpro.buildingcad" || doc.version !== 2) errors.push("Document format/version is invalid.");
  if (doc?.units !== "mm" || !Number.isFinite(doc?.gridMillimetres) || doc.gridMillimetres <= 0) errors.push("Metric units and a positive grid interval are required.");
  if (!doc?.metadata?.name?.trim()) errors.push("Project name is required for the drawing title block.");
  if (!/^1:\d+$/.test(doc?.metadata?.scale || "")) errors.push("Drawing scale must use the 1:n form.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc?.metadata?.date || "")) errors.push("Issue date must use YYYY-MM-DD.");
  if (!doc?.metadata?.documentNumber?.trim()) warnings.push("Document number is not assigned.");
  if (!doc?.metadata?.drafter?.trim()) warnings.push("Drafter is not identified in the title block.");
  const ids = new Set(), tags = new Set();
  const allowedVoltages = {
    "distribution-board": ["230 V AC", "400 V AC"],
    "wall-switch": ["230 V AC", "24 V DC"],
    "schuko-socket": ["230 V AC"],
    "ceiling-light": ["230 V AC", "24 V DC"],
    "data-point": ["SELV / data"]
  };
  for (const room of doc?.rooms || []) {
    if (!room.id || ids.has(room.id)) errors.push(`${room.id || "Room"}: missing or duplicate object ID.`);
    ids.add(room.id);
    if (!room.name?.trim() || ![room.x, room.y, room.width, room.height].every(Number.isInteger) || room.width < 1 || room.height < 1) errors.push(`${room.id}: invalid room boundary geometry.`);
  }
  for (const node of doc?.nodes || []) {
    if (!BUILDING_TYPES[node.type]) errors.push(`${node.id}: unknown device type.`);
    if (!node.id || ids.has(node.id)) errors.push(`${node.id || "Device"}: missing or duplicate object ID.`);
    ids.add(node.id);
    if (!Number.isInteger(node.x) || !Number.isInteger(node.y) || node.x < 1 || node.y < 0) errors.push(`${node.id}: position must be on the metric plan grid.`);
    if (!node.name?.trim()) errors.push(`${node.id}: device name is empty.`);
    if (!allowedVoltages[node.type]?.includes(node.voltage)) errors.push(`${node.id}: voltage is incompatible with ${node.type}.`);
    if (!Number.isFinite(node.mountingHeight) || node.mountingHeight < 0 || node.mountingHeight > 6000) errors.push(`${node.id}: mounting height must be 0–6000 mm.`);
    if (!node.room?.trim()) warnings.push(`${node.id}: assign a room before issuing the drawing.`);
    if (!node.tag?.trim()) warnings.push(`${node.id}: reference designation is not assigned.`);
    else if (tags.has(node.tag)) errors.push(`${node.id}: duplicate reference designation ${node.tag}.`);
    else tags.add(node.tag);
  }
  const wireIds = new Set();
  for (const wire of doc?.wires || []) {
    if (!wire.id || wireIds.has(wire.id)) errors.push(`${wire.id || "Connection"}: missing or duplicate connection ID.`);
    wireIds.add(wire.id);
    const from = doc.nodes.find(node => node.id === wire.from), to = doc.nodes.find(node => node.id === wire.to);
    if (!from || !to) { errors.push(`${wire.id}: connection endpoint does not exist.`); continue; }
    if (BUILDING_TYPES[from.type].system !== BUILDING_TYPES[to.type].system) errors.push(`${wire.id}: power and data systems cannot share a connection.`);
  }
  return { ok: errors.length === 0, errors, warnings, assessed: ["document-structure", "unique-ids", "reference-uniqueness", "system-separation", "basic-title-block-fields"], notAssessed: ["DIN EN 61082-1 clause-level document conformity", "IEC 60617 licensed symbol identity", "DIN EN IEC 81346 reference-designation profile", "DIN VDE 0100 installation design", "protective-device coordination", "voltage-drop limits"] };
}

export function routeBuildingConnection(start, end) {
  if (![start?.x, start?.y, end?.x, end?.y].every(Number.isInteger)) throw new TypeError("Connection endpoints must be integer grid positions.");
  if (start.x === end.x || start.y === end.y) return [start, end];
  const bendX = Math.round((start.x + end.x) / 2);
  return [start, { x: bendX, y: start.y }, { x: bendX, y: end.y }, end];
}
