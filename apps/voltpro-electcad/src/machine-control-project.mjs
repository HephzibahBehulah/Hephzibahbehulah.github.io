import { connectablePins, terminalId } from './terminal-geometry.mjs';

const part = (id, type, x, y, ref, value, rotation) => ({
  id, type, x, y, ref, value, ...(rotation === undefined ? {} : { rotation })
});

function connectedWire(id, parts, fromId, fromIndex, toId, toIndex, label) {
  const from = parts.find(item => item.id === fromId);
  const to = parts.find(item => item.id === toId);
  const start = connectablePins(from)[fromIndex];
  const end = connectablePins(to)[toIndex];
  if (!start || !end) throw new Error(`Invalid terminal pair for ${id}`);
  return {
    id, x1: start.x, y1: start.y, x2: end.x, y2: end.y,
    startTerminalId: terminalId(fromId, fromIndex),
    endTerminalId: terminalId(toId, toIndex), label
  };
}

function buildPowerSheet() {
  const parts = [
    part('supply-3ph', 'three-phase-source', 100, 230, 'X1', '3~ supply · voltage/frequency/earthing not entered'),
    part('breaker-3ph', 'circuit-breaker-3p', 300, 230, 'Q1', 'Protection device · exact part and ratings required'),
    part('contactor-3ph', 'contactor-3p', 500, 230, 'K1', 'Contactor · exact part and coil data required'),
    part('overload-3ph', 'thermal-relay', 700, 230, 'F1', 'Overload relay · motor setting not entered'),
    part('motor-3ph', 'three-phase-motor', 900, 230, 'M1', 'Motor · nameplate data required')
  ];
  const wires = [];
  const stages = [
    ['supply-3ph', 0, 'breaker-3ph', 0], ['breaker-3ph', 3, 'contactor-3ph', 0],
    ['contactor-3ph', 3, 'overload-3ph', 0], ['overload-3ph', 3, 'motor-3ph', 0]
  ];
  stages.forEach(([from, fromOffset, to, toOffset], stage) => {
    for (let phase = 0; phase < 3; phase++) {
      wires.push(connectedWire(`power-w${stage * 3 + phase + 1}`, parts, from, fromOffset + phase, to, toOffset + phase, `L${phase + 1}`));
    }
  });
  wires.push(connectedWire('power-pe', parts, 'supply-3ph', 3, 'motor-3ph', 3, 'PE · protective bonding design not checked'));
  return { id: 'sheet-power', name: '01 — Three-phase motor power', parts, wires };
}

function buildControlSheet() {
  const parts = [
    part('control-supply', 'power', 100, 220, 'G1', '24 V DC control supply · source data required', 90),
    part('safety-stop', 'emergency-stop', 300, 160, 'S0', 'NC contact · safety function not assessed'),
    part('stop-button', 'push-button-nc', 460, 160, 'S1', 'NC stop · contact data not entered'),
    part('start-button', 'push-button-no', 620, 160, 'S2', 'NO start · contact data not entered'),
    part('main-coil', 'contactor-coil', 800, 160, 'K1', 'Coil voltage and duty not entered'),
    part('holding-contact', 'relay-contact-no', 620, 300, 'K1.1', 'Auxiliary NO · contact mapping to verify')
  ];
  const wires = [
    connectedWire('control-w1', parts, 'control-supply', 1, 'safety-stop', 0, '+24V · illustrative'),
    connectedWire('control-w2', parts, 'safety-stop', 1, 'stop-button', 0, 'Stop chain · illustrative'),
    connectedWire('control-w3', parts, 'stop-button', 1, 'start-button', 0, 'Stop chain · illustrative'),
    connectedWire('control-w4', parts, 'start-button', 1, 'main-coil', 0, 'Coil command · illustrative'),
    connectedWire('control-w5', parts, 'main-coil', 1, 'control-supply', 0, '0V return · illustrative'),
    connectedWire('control-w6', parts, 'start-button', 0, 'holding-contact', 0, 'Holding branch · verify device mapping'),
    connectedWire('control-w7', parts, 'holding-contact', 1, 'start-button', 1, 'Holding branch · verify device mapping')
  ];
  return { id: 'sheet-control', name: '02 — 24 V control concept', parts, wires };
}

function buildIoSheet() {
  const parts = [
    part('io-supply', 'power', 100, 220, 'G2', '24 V DC · shared supply not confirmed', 90),
    part('io-contact', 'relay-contact-no', 340, 160, 'K1.2', 'Motor-run auxiliary · mapping to verify'),
    part('io-input', 'plc-input', 560, 160, 'I0.0', 'Motor-run feedback · PLC module not specified')
  ];
  const wires = [
    connectedWire('io-w1', parts, 'io-supply', 1, 'io-contact', 0, '+24V · illustrative'),
    connectedWire('io-w2', parts, 'io-contact', 1, 'io-input', 0, 'Run feedback · illustrative'),
    connectedWire('io-w3', parts, 'io-input', 1, 'io-supply', 0, 'M/0V · illustrative')
  ];
  return { id: 'sheet-io', name: '03 — PLC feedback interface', parts, wires };
}

export function buildIndustrialMachineProject() {
  return {
    schemaVersion: 3,
    projectName: 'Industrial machine motor starter · preliminary',
    activeSheetId: 'sheet-power',
    metadata: {
      projectNumber: 'VP-DE-MCS-001', organisation: '', client: '', engineer: '', revision: 'A',
      standard: 'Germany/EU target · applicable DIN EN/VDE editions not verified',
      description: 'Generic editable concept only. Enter supply data, motor nameplate, fault level, manufacturer part data, cable installation conditions, and safety requirements before engineering review.'
    },
    sheets: [buildPowerSheet(), buildControlSheet(), buildIoSheet()]
  };
}
