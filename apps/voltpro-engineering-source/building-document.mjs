import { architectureErrors, wallsFromRooms, routeGeometryErrors } from './building-architecture.mjs';
import { CATALOG, catalogItem, PROFILES, importManufacturerCatalog } from "./building-catalog.mjs";
export const BUILDING_TYPES = Object.freeze(Object.fromEntries(CATALOG.filter(item=>item.kind==='device').map(item=>[item.id,item])));

export function createBuildingDocument(metadata = {}) {
  const floors = Number.isInteger(metadata.floors) && metadata.floors >= 1 && metadata.floors <= 300 ? metadata.floors : 1;
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
      revision: metadata.revision || "A",
      profile: PROFILES[metadata.profile] ? metadata.profile : "DE",
      floors,
      activeFloor: Number.isInteger(metadata.activeFloor) && metadata.activeFloor >= 1 && metadata.activeFloor <= floors ? metadata.activeFloor : 1
    },
    layers: { architecture: true, power: true, data: true },
    architectureVersion: 1,
    walls: [], openings: [], dimensions: [], risers: [], spaces: [], stairs: [], floorOutlines: [], circuits: [],
    designNotes: [],
    catalog: [],
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
  if(raw.catalog!==undefined&&!Array.isArray(raw.catalog))throw new TypeError('Project catalogue must be an array.');
  doc.catalog = (raw.catalog||[]).map(item=>importManufacturerCatalog({format:'voltpro.manufacturer-catalog',version:1,rights:item.rights||'Embedded project catalogue; permission statement must be verified',items:[{...item,familyId:item.familyId}]} )[0]);
  if(doc.catalog.length>5000||new Set(doc.catalog.map(item=>item.id)).size!==doc.catalog.length)throw new RangeError('Project catalogue contains too many or duplicate records.');
  if(raw.example!==undefined){if(!raw.example||typeof raw.example!=='object'||Array.isArray(raw.example)||JSON.stringify(raw.example).length>50000)throw new TypeError('Invalid example provenance.');doc.example=structuredClone(raw.example);}
  if(typeof raw.metadata?.exampleId==='string')doc.metadata.exampleId=raw.metadata.exampleId.slice(0,200);
  doc.designNotes=Array.isArray(raw.designNotes)?raw.designNotes.filter(note=>typeof note==='string').slice(0,40):[];
  doc.rooms = Array.isArray(raw.rooms) ? raw.rooms.map(room=>({...room,floor:Number.isInteger(room.floor)?room.floor:1})) : [];
  for(const key of ['walls','openings','dimensions','risers','spaces','stairs','floorOutlines','circuits']){if(raw[key]!==undefined&&!Array.isArray(raw[key]))throw new TypeError(key+' must be an array.');doc[key]=raw[key]||[];}
  if(raw.walls===undefined&&doc.rooms.length){doc.walls=wallsFromRooms(doc.rooms);doc.designNotes.push('Walls inferred from legacy room reference rectangles at an assumed 200 mm thickness. Verify construction and room clear dimensions.');}
  doc.nodes = raw.nodes.map((node, i) => ({
    ...node,
    id: String(node.id || `B${i + 1}`),
    tag: String(node.tag || ""),
    room: String(node.room || ""),
    voltage: String(node.voltage || catalogItem(node.type,doc.catalog)?.defaultVoltage || ""),
    floor: Number.isInteger(node.floor) ? node.floor : 1,
    quantity: Number.isFinite(node.quantity) && node.quantity > 0 ? node.quantity : 1,
    spec: node.spec && typeof node.spec === "object" ? node.spec : {},
    circuit: String(node.circuit || ""),
    mountingHeight: Number.isFinite(Number(node.mountingHeight)) ? Number(node.mountingHeight) : 0,
    x: Number(node.x),
    y: Number(node.y)
  }));
  doc.wires = raw.wires.map((wire, i) => ({ ...wire, id: String(wire.id || `W${i + 1}`) }));
  doc.layers = { ...doc.layers, ...(raw.layers || {}) };
  if (Number.isFinite(raw.gridMillimetres)) doc.gridMillimetres = raw.gridMillimetres;
  return doc;
}

export function validateBuildingDocument(doc) {
  const errors = [], warnings = [];
  if (!doc || doc.format !== "voltpro.buildingcad" || doc.version !== 2) errors.push("Document format/version is invalid.");
  if (doc?.units !== "mm" || !Number.isFinite(doc?.gridMillimetres) || doc.gridMillimetres <= 0) errors.push("Metric units and a positive grid interval are required.");
  if (!doc?.metadata?.name?.trim()) errors.push("Project name is required for the drawing title block.");
  if (!Number.isInteger(doc?.metadata?.floors) || doc.metadata.floors < 1 || doc.metadata.floors > 300) errors.push("Storey count must be an integer from 1 to 300.");
  if (!Number.isInteger(doc?.metadata?.activeFloor) || doc.metadata.activeFloor < 1 || doc.metadata.activeFloor > doc.metadata.floors) errors.push("Active floor must reference a declared storey.");
  if (!/^1:\d+$/.test(doc?.metadata?.scale || "")) errors.push("Drawing scale must use the 1:n form.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc?.metadata?.date || "")) errors.push("Issue date must use YYYY-MM-DD.");
  if (!doc?.metadata?.documentNumber?.trim()) warnings.push("Document number is not assigned.");
  if (!doc?.metadata?.drafter?.trim()) warnings.push("Drafter is not identified in the title block.");
  const ids = new Set(), tags = new Set();
  const allowedVoltages = {
    "distribution-board": ["230 V AC", "400 V AC"],
    "wall-switch": ["120 V AC", "230 V AC", "24 V DC"],
    "schuko-socket": ["230 V AC"],
    "ceiling-light": ["120 V AC", "230 V AC", "24 V DC"],
    "data-point": ["SELV / data"]
  };
  for (const room of doc?.rooms || []) {
    const floor = room.floor ?? 1;
    if (!Number.isInteger(floor) || floor < 1 || floor > doc.metadata.floors) errors.push(`${room.id || "Room"}: floor must reference a declared storey.`);
    if (!room.id || ids.has(room.id)) errors.push(`${room.id || "Room"}: missing or duplicate object ID.`);
    ids.add(room.id);
    if (!room.name?.trim() || ![room.x, room.y, room.width, room.height].every(Number.isFinite) || room.width < 1 || room.height < 1) errors.push(`${room.id}: invalid room boundary geometry.`);
  }
  for (const node of doc?.nodes || []) {
    const floor = node.floor ?? 1;
    if (!Number.isInteger(floor) || floor < 1 || floor > doc.metadata.floors) errors.push(`${node.id || "Device"}: floor must reference a declared storey.`);
    const item = catalogItem(node.type,doc.catalog);
    if (!item || item.kind === "route") errors.push(`${node.id}: unknown device type.`);
    if (!node.id || ids.has(node.id)) errors.push(`${node.id || "Device"}: missing or duplicate object ID.`);
    ids.add(node.id);
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 1 || node.y < 0) errors.push(`${node.id}: position must be on the metric plan grid.`);
    if (!node.name?.trim()) errors.push(`${node.id}: device name is empty.`);
    if (!(allowedVoltages[node.type] || [item?.defaultVoltage,"120 V AC","208 V AC","230 V AC","240 V AC","277 V AC","400 V AC","415 V AC","480 V AC","24 V DC","SELV / data","Protective conductor","Not energised"]).includes(node.voltage)) errors.push(`${node.id}: voltage is incompatible with ${node.type}.`);
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
    if (catalogItem(from.type,doc.catalog)?.system !== catalogItem(to.type,doc.catalog)?.system) errors.push(`${wire.id}: power and data systems cannot share a connection.`);
  }
  const circuits=new Set();for(const circuit of doc.circuits||[]){for(const key of ['boardId','overcurrentDeviceId','rcdId'])if(circuit[key]&&!doc.nodes.some(n=>n.id===circuit[key]))errors.push(`${circuit.id}: ${key} must reference a placed equipment instance ID.`);if(!circuit.id||circuits.has(circuit.id))errors.push('Missing/duplicate circuit identity.');circuits.add(circuit.id);for(const key of ['voltage','powerFactor','demandFactor','verifiedAmpacityA','faultKA','minimumSectionMM2','reactanceOhmPerKm','maxVoltageDropPercent'])if(circuit[key]!==undefined&&circuit[key]!==null&&(!Number.isFinite(circuit[key])||circuit[key]<0))errors.push(`${circuit.id}: invalid ${key}.`);if(circuit.powerFactor>1||circuit.demandFactor>1)errors.push(`${circuit.id}: factors must not exceed 1.`);}
  if(circuits.size)for(const object of [...doc.nodes,...doc.wires])if(object.circuit&&!circuits.has(object.circuit))errors.push(`${object.id}: circuit ${object.circuit} does not exist.`);
  errors.push(...architectureErrors(doc));
  for(const wire of doc.wires||[])errors.push(...routeGeometryErrors(doc,wire).map(message=>`${wire.id}: ${message}`));
  return { ok: errors.length === 0, errors, warnings, assessed: ["document-structure", "unique-ids", "reference-uniqueness", "system-separation", "basic-title-block-fields"], notAssessed: ["DIN EN 61082-1 clause-level document conformity", "IEC 60617 licensed symbol identity", "DIN EN IEC 81346 reference-designation profile", "DIN VDE 0100 installation design", "protective-device coordination", "voltage-drop limits"] };
}

export function routeBuildingConnection(start, end) {
  if (![start?.x, start?.y, end?.x, end?.y].every(Number.isFinite)) throw new TypeError("Connection endpoints must be finite grid positions.");
  if (start.x === end.x || start.y === end.y) return [start, end];
  const bendX = Math.round((start.x + end.x) / 2);
  return [start, { x: bendX, y: start.y }, { x: bendX, y: end.y }, end];
}
