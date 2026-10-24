const THREE_PHASE_OFFSETS = [
  { x: -38, y: -16 }, { x: -38, y: 0 }, { x: -38, y: 16 }, { x: 0, y: 38 }
];
const SIX_TERMINAL_OFFSETS = [
  { x: -38, y: -16 }, { x: -38, y: 0 }, { x: -38, y: 16 },
  { x: 38, y: -16 }, { x: 38, y: 0 }, { x: 38, y: 16 }
];
const CONTACTOR_OFFSETS = [...SIX_TERMINAL_OFFSETS, { x: -18, y: -28 }, { x: 18, y: -28 }];
const MCU_DIP28_OFFSETS = [
  ...Array.from({ length: 14 }, (_, index) => ({ x: -42, y: -65 + index * 10 })),
  ...Array.from({ length: 14 }, (_, index) => ({ x: 42, y: 65 - index * 10 }))
];
const PLC_IO_OFFSETS = [
  ...Array.from({ length: 8 }, (_, index) => ({ x: -42, y: -42 + index * 12 })),
  ...Array.from({ length: 8 }, (_, index) => ({ x: 42, y: 42 - index * 12 }))
];
const OPAMP_OFFSETS = [
  { x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: 0 },
  { x: 0, y: -38 }, { x: 0, y: 38 }
];
const POTENTIOMETER_OFFSETS = [
  { x: -38, y: 0 }, { x: 38, y: 0 }, { x: 0, y: -24 }
];
const CHANGEOVER_OFFSETS = [
  { x: -38, y: 0 }, { x: 38, y: -14 }, { x: 38, y: 14 }
];

const FIXED_OFFSETS = {
  ground: [{ x: 0, y: -10 }], 'terminal-ground': [{ x: 0, y: -10 }],
  'shield-ground': [{ x: 0, y: -10 }], 'chassis-ground': [{ x: 0, y: -10 }],
  'analog-ground': [{ x: 0, y: -10 }], 'digital-ground': [{ x: 0, y: -10 }],
  terminal: [{ x: 0, y: 0 }],
  'terminal-block': [{ x: -38, y: -18 }, { x: -38, y: -6 }, { x: -38, y: 6 }, { x: -38, y: 18 },
    { x: 38, y: -18 }, { x: 38, y: -6 }, { x: 38, y: 6 }, { x: 38, y: 18 }],
  connector: [{ x: -38, y: 0 }, { x: 38, y: 0 }], 'test-point': [{ x: 0, y: 0 }],
  'net-port': [{ x: 0, y: 0 }], 'off-page-connector': [{ x: 0, y: 0 }],
  junction: [{ x: 0, y: 0 }], 'bus-tap': [{ x: 0, y: 0 }],
  'net-label': [{ x: 0, y: 0 }], 'wire-label': [{ x: 0, y: 0 }],
  power: [{ x: -38, y: 0 }, { x: 38, y: 0 }],
  battery: [{ x: -38, y: 0 }, { x: 38, y: 0 }],
  'voltage-source-ac': [{ x: -38, y: 0 }, { x: 38, y: 0 }],
  'current-source': [{ x: -38, y: 0 }, { x: 38, y: 0 }],
  'variable-resistor': POTENTIOMETER_OFFSETS, potentiometer: POTENTIOMETER_OFFSETS,
  'potentiometer-trimmer': POTENTIOMETER_OFFSETS, 'capacitor-variable': POTENTIOMETER_OFFSETS,
  'changeover-contact': CHANGEOVER_OFFSETS, 'selector-switch': CHANGEOVER_OFFSETS,
  'selector-3-position': [{ x: -38, y: 0 }, { x: 38, y: -20 }, { x: 38, y: 0 }, { x: 38, y: 20 }],
  'voltage-regulator': [{ x: -10, y: 38 }, { x: 0, y: 38 }, { x: 10, y: 38 }],
  'three-phase-source': THREE_PHASE_OFFSETS, 'three-phase-motor': THREE_PHASE_OFFSETS,
  'circuit-breaker-3p': SIX_TERMINAL_OFFSETS, 'thermal-relay': SIX_TERMINAL_OFFSETS,
  'contactor-3p': CONTACTOR_OFFSETS.map((pin, index) => index < 6 ? pin : { ...pin, y: -48 }),
  'npn-transistor': [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  'pnp-transistor': [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  nmos: [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  pmos: [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  igbt: [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  scr: [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  triac: [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  'n-channel-jfet': [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  'p-channel-jfet': [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  'darlington-transistor': [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }],
  'op-amp': OPAMP_OFFSETS, comparator: OPAMP_OFFSETS,
  'logic-gate-and': [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: 0 }],
  'logic-gate-or': [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: 0 }],
  'logic-gate-not': [{ x: -38, y: 0 }, { x: 38, y: 0 }],
  'logic-gate-xor': [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: 0 }],
  'bridge-rectifier': [{ x: -38, y: -14 }, { x: -38, y: 14 }, { x: 38, y: -14 }, { x: 38, y: 14 }],
  transformer: [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: -12 }, { x: 38, y: 12 }],
  'transformer-current': [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: -12 }, { x: 38, y: 12 }],
  'transformer-voltage': [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: -12 }, { x: 38, y: 12 }],
  'opto-coupler': [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: -12 }, { x: 38, y: 12 }],
  microcontroller: MCU_DIP28_OFFSETS, plc: PLC_IO_OFFSETS, 'io-module': PLC_IO_OFFSETS
};

export function terminalOffsets(type) {
  if (['text-note', 'wire-crossing', 'shield', 'ferrule'].includes(type)) return [];
  return FIXED_OFFSETS[type] || [{ x: -38, y: 0 }, { x: 38, y: 0 }];
}

export function terminalCount(type) { return terminalOffsets(type).length; }

export const terminalId = (componentId, index) => `pin:${componentId}:${index}`;

export function terminalLabel(type, index) {
  const labels = {
    power: ['+', '−'], battery: ['+', '−'], 'voltage-source-ac': ['L', 'N'], 'current-source': ['+', '−'],
    resistor: ['1', '2'], capacitor: ['1', '2'], diode: ['A', 'K'], led: ['A', 'K'],
    'zener-diode': ['A', 'K'], 'polarized-capacitor': ['+', '−'],
    'variable-resistor': ['1', '2', 'W'], potentiometer: ['1', '2', 'W'],
    'changeover-contact': ['COM', 'NC', 'NO'], 'selector-switch': ['COM', '1', '2'],
    'voltage-regulator': ['IN', 'GND', 'OUT'],
    'npn-transistor': ['B', 'C', 'E'], 'pnp-transistor': ['B', 'C', 'E'],
    nmos: ['G', 'D', 'S'], pmos: ['G', 'D', 'S'],
    'three-phase-source': ['L1', 'L2', 'L3', 'PE'],
    'circuit-breaker-3p': ['L1', 'L2', 'L3', 'T1', 'T2', 'T3'],
    'contactor-3p': ['L1', 'L2', 'L3', 'T1', 'T2', 'T3', 'A1', 'A2'],
    'thermal-relay': ['L1', 'L2', 'L3', 'T1', 'T2', 'T3'],
    'three-phase-motor': ['U1', 'V1', 'W1', 'PE'],
    'op-amp': ['+IN', '−IN', 'OUT', 'V+', 'V−'], comparator: ['+IN', '−IN', 'OUT', 'V+', 'V−'],
    'bridge-rectifier': ['~1', '~2', '+', '−'],
    transformer: ['PRI-1', 'PRI-2', 'SEC-1', 'SEC-2'],
    'transformer-current': ['P1', 'P2', 'S1', 'S2'],
    'transformer-voltage': ['PRI-1', 'PRI-2', 'SEC-1', 'SEC-2'],
    'opto-coupler': ['A', 'K', 'C', 'E'],
    microcontroller: Array.from({ length: 28 }, (_, pin) => String(pin + 1)),
    plc: [...Array.from({ length: 8 }, (_, pin) => 'DI' + (pin + 1)), ...Array.from({ length: 8 }, (_, pin) => 'DO' + (pin + 1))],
    'io-module': [...Array.from({ length: 8 }, (_, pin) => 'DI' + (pin + 1)), ...Array.from({ length: 8 }, (_, pin) => 'DO' + (pin + 1))],
    'terminal-block': ['1', '2', '3', '4', '5', '6', '7', '8']
  };
  return labels[type]?.[index] || String(index + 1);
}

export function connectablePins(part) {
  const type = part.type;
  const offsets = terminalOffsets(type);
  const rotation = (part.rotation || 0) * Math.PI / 180;
  return offsets.map(({ x, y }) => {
    const mirroredX = part.mirrorX ? -x : x;
    return {
      x: part.x + Math.round(mirroredX * Math.cos(rotation) - y * Math.sin(rotation)),
      y: part.y + Math.round(mirroredX * Math.sin(rotation) + y * Math.cos(rotation))
    };
  });
}
