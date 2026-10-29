import { componentById } from './component-library';
import { connectablePins, decodeDocument, type ComponentKind, type Document, type Component, type Wire } from './editor-model';
import { buildIndustrialMachineProject } from './machine-control-project.mjs';

type Starter = {
  id: string;
  title: string;
  description: string;
  source: ComponentKind;
  sourceValue: string;
  devices: Array<{ type: ComponentKind; value: string }>;
  scope: string;
};

const starters: Starter[] = [
  { id: 'divider', title: 'Voltage divider', description: 'A two-resistor reference from a 24 V source.', source: 'power', sourceValue: '24 V DC', devices: [{ type: 'resistor', value: '10 kΩ' }, { type: 'resistor', value: '10 kΩ' }], scope: 'DC · editable' },
  { id: 'led', title: 'LED indicator', description: 'A current-limiting resistor and LED on a 5 V rail.', source: 'power', sourceValue: '5 V DC', devices: [{ type: 'resistor', value: '220 Ω' }, { type: 'led', value: 'Red · 2 V' }], scope: 'DC · editable' },
  { id: 'rc-filter', title: 'RC low-pass filter', description: 'A resistor and capacitor for a first-order filter study.', source: 'power', sourceValue: '5 V DC', devices: [{ type: 'resistor', value: '1 kΩ' }, { type: 'capacitor', value: '100 nF' }], scope: 'RC concept · editable' },
  { id: 'rectifier', title: 'Bridge rectifier', description: 'An AC source, bridge symbol, and resistive load.', source: 'voltage-source-ac', sourceValue: '12 V AC', devices: [{ type: 'bridge-rectifier', value: 'Bridge rectifier' }, { type: 'resistor', value: '1 kΩ' }], scope: 'AC model not included' },
  { id: 'transistor', title: 'Transistor switch', description: 'A base resistor, NPN device, and indicator load.', source: 'power', sourceValue: '12 V DC', devices: [{ type: 'resistor', value: '4.7 kΩ' }, { type: 'npn-transistor', value: 'NPN · model required' }, { type: 'led', value: 'Red LED' }], scope: 'Device model required' },
  { id: 'relay', title: 'Relay driver', description: 'A control switch, relay coil, and indicator path.', source: 'power', sourceValue: '24 V DC', devices: [{ type: 'switch', value: 'Open' }, { type: 'relay-coil', value: '24 V coil' }, { type: 'lamp', value: 'Signal lamp' }], scope: 'Control concept · editable' },
  { id: 'motor-starter', title: 'Motor starter', description: 'Protective device, contactor coil, and motor symbols.', source: 'power', sourceValue: '24 V DC control', devices: [{ type: 'circuit-breaker', value: 'Q1 · rating required' }, { type: 'contactor-coil', value: '24 V coil' }, { type: 'motor', value: 'M1 · data required' }], scope: 'Preliminary · verify ratings' },
  { id: 'sensor-input', title: '24 V sensor input', description: 'A sensor signal path into a PLC input symbol.', source: 'power', sourceValue: '24 V DC', devices: [{ type: 'sensor', value: '24 V sensor' }, { type: 'plc-input', value: 'I0.0' }], scope: 'PLC symbol · model required' },
  { id: 'op-amp', title: 'Op-amp stage', description: 'An input resistor, amplifier symbol, and feedback resistor.', source: 'power', sourceValue: '12 V DC', devices: [{ type: 'resistor', value: '10 kΩ' }, { type: 'op-amp', value: 'Op-amp · model required' }, { type: 'resistor', value: '100 kΩ' }], scope: 'Nonlinear model required' },
  { id: 'charger', title: 'Charger concept', description: 'An AC source, rectifier diode, series resistor, and battery.', source: 'voltage-source-ac', sourceValue: '12 V AC', devices: [{ type: 'diode', value: 'Rectifier diode' }, { type: 'resistor', value: '100 Ω' }, { type: 'battery', value: '12 V · charging model required' }], scope: 'Preliminary · not a charger design' },
];

function buildStarter(starter: Starter): Document {
  const nodes = [{ type: starter.source, value: starter.sourceValue }, ...starter.devices];
  const counts = new Map<string, number>();
  const parts: Component[] = nodes.map((node, index) => {
    const definition = componentById(node.type);
    const prefix = definition?.prefix || 'X';
    const count = (counts.get(prefix) || 0) + 1;
    counts.set(prefix, count);
    return { id: `starter-${starter.id}-p${index + 1}`, type: node.type, x: 160 + index * 180, y: 200, ref: `${prefix}${count}`, value: node.value };
  });
  const wires: Wire[] = [];
  const pins = parts.map(connectablePins);
  const route = (from: number, fromPin: number, to: number, toPin: number, id: string): Wire => ({ id, x1: pins[from][fromPin].x, y1: pins[from][fromPin].y, x2: pins[to][toPin].x, y2: pins[to][toPin].y, startTerminalId: `pin:${parts[from].id}:${fromPin}`, endTerminalId: `pin:${parts[to].id}:${toPin}` });
  if (pins.length > 1 && pins[0].length >= 2 && pins[1].length >= 2) wires.push(route(0, 1, 1, 0, `starter-${starter.id}-w1`));
  for (let index = 1; index < pins.length - 1; index++) {
    if (pins[index].length >= 2 && pins[index + 1].length >= 2) wires.push(route(index, 1, index + 1, 0, `starter-${starter.id}-w${wires.length + 1}`));
  }
  if (pins.length > 1 && pins[pins.length - 1].length >= 2 && pins[0].length >= 2) wires.push(route(pins.length - 1, 1, 0, 0, `starter-${starter.id}-w${wires.length + 1}`));
  const sheet = { id: 'sheet-1', name: '01 — ' + starter.title, parts, wires };
  return decodeDocument({
    schemaVersion: 3,
    projectName: starter.title,
    activeSheetId: sheet.id,
    metadata: { projectNumber: `VP-${starter.id.toUpperCase()}`, organisation: '', client: '', engineer: '', revision: 'A', standard: '', description: starter.description },
    sheets: [sheet],
  });
}

type Props = { locale: 'en' | 'de' | 'yo' | 'pcm'; onClose: () => void; onSelect: (doc: Document) => void };
export default function StarterProjects({ locale, onClose, onSelect }: Props) {
  const copy = locale === 'de'
    ? { title: 'Deine Ideen. Ein echter Schaltplan.', intro: 'Wähle einen editierbaren Startpunkt oder beginne mit einem leeren Blatt.', blank: 'Leer beginnen', note: 'Die Vorlagen sind editierbare Konzepte. Bauteilmodelle und technische Werte müssen vor der Nutzung geprüft werden.' }
    : locale === 'yo'
      ? { title: 'Èrò rẹ. Àwòrán itanna gidi.', intro: 'Yan àpẹẹrẹ tí o lè ṣàtúnṣe tàbí bẹ̀rẹ̀ pẹ̀lú ìwé òfo.', blank: 'Bẹ̀rẹ̀ ní òfo', note: 'Àwọn àpẹẹrẹ yìí jẹ́ ìpìlẹ̀ tí a lè ṣàtúnṣe; ṣàyẹ̀wò àwọn iye àti àwòṣe ẹ̀rọ.' }
      : locale === 'pcm'
        ? { title: 'Your idea. Real schematic.', intro: 'Pick one editable starter or begin with empty sheet.', blank: 'Start blank', note: 'These are editable concepts. Check component models and engineering values before use.' }
        : { title: 'Your ideas. A real schematic.', intro: 'Choose an editable starter or begin with an empty sheet.', blank: 'Start blank', note: 'These are editable concepts. Verify component models and engineering values before use.' };
  return <div className="starter-overlay" role="presentation"><section className="starter-picker" role="dialog" aria-modal="true" aria-label="Starter schematics">
    <div className="starter-picker-head"><div><span>VOLTPRO ELECTCAD · STARTER LIBRARY</span><h2>{copy.title}</h2><p>{copy.intro}</p></div><button className="tiny-btn" aria-label="Close starter library" onClick={onClose}>×</button></div>
    <div className="starter-grid"><button className="starter-card starter-card-featured" onClick={() => onSelect(decodeDocument(buildIndustrialMachineProject()))}>
      <span className="starter-card-number">DE</span><strong>Industrial machine motor control</strong><span>Three-sheet 3-phase power, 24 V control concept and PLC feedback schematic. Every drawn conductor has explicit terminal references.</span><small>Germany / EU target · editable · ratings and standards need engineering verification</small>
    </button>{starters.map((starter, index) => <button className="starter-card" key={starter.id} onClick={() => onSelect(buildStarter(starter))}>
      <span className="starter-card-number">{String(index + 1).padStart(2, '0')}</span><strong>{starter.title}</strong><span>{starter.description}</span><small>{starter.scope} · {starter.devices.length + 2} symbols</small>
    </button>)}</div>
    <div className="starter-picker-foot"><span>{copy.note}</span><button className="outline-btn" onClick={onClose}>{copy.blank}</button></div>
  </section></div>;
}
