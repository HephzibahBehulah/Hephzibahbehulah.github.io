const THREE_PHASE_OFFSETS = [
  { x: -38, y: -16 }, { x: -38, y: 0 }, { x: -38, y: 16 }, { x: 0, y: 38 }
];
const SIX_TERMINAL_OFFSETS = [
  { x: -38, y: -16 }, { x: -38, y: 0 }, { x: -38, y: 16 },
  { x: 38, y: -16 }, { x: 38, y: 0 }, { x: 38, y: 16 }
];
const CONTACTOR_OFFSETS = [...SIX_TERMINAL_OFFSETS, { x: -18, y: -28 }, { x: 18, y: -28 }];

export const terminalId = (componentId, index) => `pin:${componentId}:${index}`;

export function terminalLabel(type, index) {
  const labels = {
    'three-phase-source': ['L1', 'L2', 'L3', 'PE'],
    'circuit-breaker-3p': ['L1', 'L2', 'L3', 'T1', 'T2', 'T3'],
    'contactor-3p': ['L1', 'L2', 'L3', 'T1', 'T2', 'T3', 'A1', 'A2'],
    'thermal-relay': ['L1', 'L2', 'L3', 'T1', 'T2', 'T3'],
    'three-phase-motor': ['U1', 'V1', 'W1', 'PE']
  };
  return labels[type]?.[index] || String(index + 1);
}

export function connectablePins(part) {
  const type = part.type;
  if (['text-note', 'wire-crossing', 'cable', 'shield', 'ferrule', 'no-connect'].includes(type)) return [];
  let offsets;
  if (type.includes('ground')) offsets = [{ x: 0, y: -10 }];
  else if (['terminal', 'terminal-block', 'connector', 'test-point', 'net-port', 'off-page-connector', 'junction', 'bus-tap', 'net-label', 'wire-label'].includes(type)) offsets = [{ x: 0, y: 0 }];
  else if (['three-phase-source', 'three-phase-motor'].includes(type)) offsets = THREE_PHASE_OFFSETS;
  else if (['circuit-breaker-3p', 'thermal-relay'].includes(type)) offsets = SIX_TERMINAL_OFFSETS;
  else if (type === 'contactor-3p') offsets = CONTACTOR_OFFSETS;
  else if (['npn-transistor', 'pnp-transistor', 'nmos', 'pmos', 'igbt', 'scr', 'triac', 'n-channel-jfet', 'p-channel-jfet', 'darlington-transistor'].includes(type)) offsets = [{ x: -38, y: 0 }, { x: 38, y: -22 }, { x: 38, y: 22 }];
  else if (['op-amp', 'comparator', 'logic-gate-and', 'logic-gate-or', 'logic-gate-not', 'logic-gate-xor'].includes(type)) offsets = [{ x: -38, y: -12 }, { x: -38, y: 12 }, { x: 38, y: 0 }];
  else offsets = [{ x: -38, y: 0 }, { x: 38, y: 0 }];
  const rotation = (part.rotation || 0) * Math.PI / 180;
  return offsets.map(({ x, y }) => {
    const mirroredX = part.mirrorX ? -x : x;
    return {
      x: part.x + Math.round(mirroredX * Math.cos(rotation) - y * Math.sin(rotation)),
      y: part.y + Math.round(mirroredX * Math.sin(rotation) + y * Math.cos(rotation))
    };
  });
}
