/** @typedef {{id:string,data:{kind:string,tag:string,label:string,sheet?:string},position:{x:number,y:number}}} Device */
/** @typedef {{nodes:Device[],sheets?:{id:string,name:string}[]}} Project */

const INPUT_KINDS = new Set(['no', 'nc', 'selector', 'breaker', 'overloadNC', 'overloadNO']);
const OUTPUT_KINDS = new Set(['coil', 'lamp']);

const address = (prefix, index) => `%${prefix}${Math.floor(index / 8)}.${index % 8}`;

/**
 * Assign deterministic, project-local IEC-style addresses to physical points.
 * These addresses are a logical teaching map; they do not identify a vendor CPU.
 * @param {Project} project
 */
export function resolveIoMap(project) {
  const sheets = project.sheets || [{ id: 'main', name: 'Main' }];
  const sheetName = new Map(sheets.map(sheet => [sheet.id, sheet.name]));
  const occurrences = new Map();
  for (const node of project.nodes) {
    const list = occurrences.get(node.data.tag) || [];
    list.push(node);
    occurrences.set(node.data.tag, list);
  }
  let inputIndex = 0;
  let outputIndex = 0;
  return project.nodes.map(node => {
    const kind = node.data.kind;
    const direction = INPUT_KINDS.has(kind) ? 'input' : OUTPUT_KINDS.has(kind) ? 'output' : null;
    const pointIndex = direction === 'input' ? inputIndex++ : direction === 'output' ? outputIndex++ : null;
    const sheetId = node.data.sheet || sheets[0]?.id || 'main';
    const tagged = occurrences.get(node.data.tag) || [];
    return {
      node,
      direction,
      address: direction === 'input' ? address('I', pointIndex) : direction === 'output' ? address('Q', pointIndex) : null,
      sheetId,
      sheetName: sheetName.get(sheetId) || sheetId,
      references: tagged.filter(reference => reference.id !== node.id),
    };
  });
}

/** @typedef {{id:string,description:string,quantity:number,channelsUsed:number,capacity:number|null,addressRange:string,tags:string[]}} BomLine */

/**
 * Build an educational, vendor-neutral PLC hardware configuration from the I/O map.
 * Each logical byte is represented as one generic eight-channel module.
 * @param {Project} project
 * @returns {BomLine[]}
 */
export function buildHardwareBom(project) {
  const rows = resolveIoMap(project);
  const modules = new Map();
  for (const row of rows) {
    if (!row.direction || !row.address) continue;
    const [, prefix, byte] = row.address.match(/^%([IQ])(\d+)\.(\d+)$/) || [];
    if (!prefix) continue;
    const direction = prefix === 'I' ? 'input' : 'output';
    const key = `${direction}-${byte}`;
    const module = modules.get(key) || {
      id: `${direction === 'input' ? 'DI' : 'DO'}-${String(Number(byte) + 1).padStart(2, '0')}`,
      description: direction === 'input' ? 'Generic 8-channel digital input module · training model' : 'Generic 8-channel digital output module · training model',
      quantity: 1,
      channelsUsed: 0,
      capacity: 8,
      firstAddress: row.address,
      lastAddress: row.address,
      tags: [],
    };
    module.channelsUsed++;
    module.lastAddress = row.address;
    module.tags.push(row.node.data.tag);
    modules.set(key, module);
  }
  return [
    { id: 'CPU-01', description: 'VoltPro virtual PLC CPU · generic teaching model; no vendor selected', quantity: 1, channelsUsed: 0, capacity: null, addressRange: '—', tags: [] },
    ...[...modules.values()].map(({ firstAddress, lastAddress, ...line }) => ({ ...line, addressRange: firstAddress === lastAddress ? firstAddress : `${firstAddress} – ${lastAddress}` })),
  ];
}

