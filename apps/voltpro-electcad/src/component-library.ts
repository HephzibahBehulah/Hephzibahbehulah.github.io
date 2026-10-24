import type { ComponentKind } from './editor-model';

export type SimulationModel = 'voltage'|'ground'|'resistor'|'capacitor'|'inductor'|'diode'|'bjt'|'switch'|'unsupported';
export type LibraryComponent = { id: ComponentKind; label: string; prefix: string; defaultValue: string; category: string; model: SimulationModel; pins: number; description: string };
const raw: Array<[ComponentKind,string,string,string,string,SimulationModel]> = [
  [
    "power",
    "DC voltage source",
    "V",
    "24 V DC",
    "Sources",
    "voltage"
  ],
  [
    "ground",
    "Ground reference",
    "GND",
    "0",
    "Sources",
    "ground"
  ],
  [
    "resistor",
    "Resistor",
    "R",
    "1 kΩ",
    "Passive",
    "resistor"
  ],
  [
    "variable-resistor",
    "Variable resistor",
    "RV",
    "10 kΩ",
    "Passive",
    "resistor"
  ],
  [
    "potentiometer",
    "Potentiometer",
    "RV",
    "10 kΩ",
    "Passive",
    "resistor"
  ],
  [
    "capacitor",
    "Capacitor",
    "C",
    "100 nF",
    "Passive",
    "capacitor"
  ],
  [
    "polarized-capacitor",
    "Polarized capacitor",
    "C",
    "10 µF",
    "Passive",
    "capacitor"
  ],
  [
    "inductor",
    "Inductor",
    "L",
    "10 mH",
    "Passive",
    "inductor"
  ],
  [
    "transformer",
    "Transformer",
    "T",
    "1:1",
    "Passive",
    "unsupported"
  ],
  [
    "lamp",
    "Signal lamp",
    "H",
    "24 V",
    "Output",
    "unsupported"
  ],
  [
    "led",
    "LED",
    "D",
    "Red · 2 V",
    "Semiconductors",
    "diode"
  ],
  [
    "diode",
    "Diode",
    "D",
    "1N4148",
    "Semiconductors",
    "diode"
  ],
  [
    "zener-diode",
    "Zener diode",
    "ZD",
    "5.1 V",
    "Semiconductors",
    "diode"
  ],
  [
    "bridge-rectifier",
    "Bridge rectifier",
    "BR",
    "Generic bridge",
    "Semiconductors",
    "unsupported"
  ],
  [
    "npn-transistor",
    "NPN transistor",
    "Q",
    "2N2222",
    "Semiconductors",
    "bjt"
  ],
  [
    "pnp-transistor",
    "PNP transistor",
    "Q",
    "2N2907",
    "Semiconductors",
    "bjt"
  ],
  [
    "nmos",
    "N-channel MOSFET",
    "Q",
    "Generic NMOS",
    "Semiconductors",
    "unsupported"
  ],
  [
    "pmos",
    "P-channel MOSFET",
    "Q",
    "Generic PMOS",
    "Semiconductors",
    "unsupported"
  ],
  [
    "op-amp",
    "Operational amplifier",
    "U",
    "Ideal op-amp",
    "ICs",
    "unsupported"
  ],
  [
    "comparator",
    "Comparator",
    "U",
    "LM393",
    "ICs",
    "unsupported"
  ],
  [
    "switch",
    "Normally-open switch",
    "S",
    "NO",
    "Control",
    "switch"
  ],
  [
    "push-button-no",
    "Push button NO",
    "S",
    "NO momentary",
    "Control",
    "switch"
  ],
  [
    "push-button-nc",
    "Push button NC",
    "S",
    "NC momentary",
    "Control",
    "switch"
  ],
  [
    "selector-switch",
    "Selector switch",
    "S",
    "2-position",
    "Control",
    "switch"
  ],
  [
    "relay-coil",
    "Relay coil",
    "K",
    "24 V DC",
    "Control",
    "unsupported"
  ],
  [
    "contactor-coil",
    "Contactor coil",
    "K",
    "24 V AC",
    "Control",
    "unsupported"
  ],
  [
    "relay-contact-no",
    "Relay contact NO",
    "K",
    "NO",
    "Control",
    "switch"
  ],
  [
    "relay-contact-nc",
    "Relay contact NC",
    "K",
    "NC",
    "Control",
    "switch"
  ],
  [
    "changeover-contact",
    "Changeover contact",
    "K",
    "SPDT",
    "Control",
    "switch"
  ],
  [
    "thermal-overload",
    "Thermal overload contact",
    "F",
    "95-96",
    "Protection",
    "switch"
  ],
  [
    "circuit-breaker",
    "Circuit breaker 1P",
    "QF",
    "B16",
    "Protection",
    "switch"
  ],
  [
    "fuse",
    "Fuse",
    "F",
    "2 A",
    "Protection",
    "switch"
  ],
  [
    "motor",
    "Motor",
    "M",
    "0.37 kW",
    "Actuators",
    "unsupported"
  ],
  [
    "three-phase-motor",
    "Three-phase motor",
    "M",
    "400 V · 3~",
    "Actuators",
    "unsupported"
  ],
  [
    "terminal",
    "Terminal",
    "X",
    "1",
    "Connections",
    "unsupported"
  ],
  [
    "connector",
    "Connector",
    "J",
    "2-pin",
    "Connections",
    "unsupported"
  ],
  [
    "cable",
    "Cable",
    "W",
    "3G1.5 mm²",
    "Connections",
    "unsupported"
  ],
  [
    "plc-input",
    "PLC digital input",
    "I",
    "DI",
    "Automation",
    "unsupported"
  ],
  [
    "plc-output",
    "PLC digital output",
    "Q",
    "DO",
    "Automation",
    "unsupported"
  ],
  [
    "sensor",
    "Sensor",
    "B",
    "24 V",
    "Automation",
    "unsupported"
  ],
  [
    "proximity-sensor",
    "Proximity sensor",
    "B",
    "PNP NO",
    "Automation",
    "unsupported"
  ],
  [
    "limit-switch",
    "Limit switch",
    "S",
    "NO",
    "Automation",
    "switch"
  ],
  [
    "emergency-stop",
    "Emergency stop",
    "S",
    "NC safety",
    "Automation",
    "switch"
  ],
  [
    "socket",
    "Socket outlet",
    "X",
    "230 V",
    "Installation",
    "unsupported"
  ],
  [
    "junction",
    "Junction",
    "J",
    "Connection node",
    "Connections",
    "unsupported"
  ],
  [
    "voltage-source-ac",
    "AC voltage source",
    "V",
    "230 V AC · 50 Hz",
    "Sources",
    "unsupported"
  ],
  [
    "three-phase-source",
    "Three-phase supply boundary",
    "X",
    "Supply inputs required",
    "Industrial",
    "unsupported"
  ],
  [
    "current-source",
    "Current source",
    "I",
    "1 mA",
    "Sources",
    "unsupported"
  ],
  [
    "battery",
    "Battery",
    "BT",
    "12 V",
    "Sources",
    "voltage"
  ],
  [
    "speaker",
    "Speaker",
    "LS",
    "8 Ω",
    "Output",
    "unsupported"
  ],
  [
    "buzzer",
    "Buzzer",
    "BZ",
    "24 V",
    "Output",
    "unsupported"
  ],
  [
    "antenna",
    "Antenna",
    "ANT",
    "RF",
    "RF",
    "unsupported"
  ],
  [
    "voltmeter",
    "Voltmeter",
    "P",
    "V",
    "Measurement",
    "unsupported"
  ],
  [
    "ammeter",
    "Ammeter",
    "P",
    "A",
    "Measurement",
    "unsupported"
  ],
  [
    "voltage-regulator",
    "Voltage regulator",
    "U",
    "7805",
    "ICs",
    "unsupported"
  ],
  [
    "logic-gate-and",
    "AND gate",
    "U",
    "2-input",
    "Logic",
    "unsupported"
  ],
  [
    "logic-gate-or",
    "OR gate",
    "U",
    "2-input",
    "Logic",
    "unsupported"
  ],
  [
    "logic-gate-not",
    "NOT gate",
    "U",
    "Inverter",
    "Logic",
    "unsupported"
  ],
  [
    "logic-gate-xor",
    "XOR gate",
    "U",
    "2-input",
    "Logic",
    "unsupported"
  ],
  [
    "clock",
    "Clock source",
    "X",
    "1 MHz",
    "Logic",
    "unsupported"
  ],
  [
    "crystal",
    "Crystal resonator",
    "Y",
    "16 MHz",
    "Passive",
    "unsupported"
  ],
  [
    "microcontroller",
    "Microcontroller",
    "U",
    "MCU",
    "ICs",
    "unsupported"
  ],
  [
    "opto-coupler",
    "Optocoupler",
    "U",
    "PC817",
    "Semiconductors",
    "unsupported"
  ],
  [
    "photodiode",
    "Photodiode",
    "D",
    "Photodiode",
    "Semiconductors",
    "diode"
  ],
  [
    "thermistor",
    "Thermistor",
    "RT",
    "10 kΩ NTC",
    "Passive",
    "resistor"
  ],
  [
    "varistor",
    "Varistor",
    "RV",
    "275 V AC",
    "Protection",
    "unsupported"
  ],
  [
    "earth-leakage-breaker",
    "RCD / earth-leakage breaker",
    "FI",
    "30 mA",
    "Protection",
    "switch"
  ],
  [
    "surge-protector",
    "Surge protection device",
    "SPD",
    "Type 2",
    "Protection",
    "unsupported"
  ],
  [
    "rectifier",
    "Rectifier diode block",
    "BR",
    "Generic",
    "Semiconductors",
    "unsupported"
  ],
  [
    "solenoid",
    "Solenoid",
    "Y",
    "24 V DC",
    "Actuators",
    "unsupported"
  ],
  [
    "heater",
    "Heating element",
    "E",
    "1 kW",
    "Actuators",
    "unsupported"
  ],
  [
    "fan",
    "Fan",
    "M",
    "230 V AC",
    "Actuators",
    "unsupported"
  ],
  [
    "residual-current-device",
    "Residual-current device",
    "FI",
    "30 mA",
    "Protection",
    "switch"
  ],
  [
    "terminal-block",
    "Terminal block",
    "X",
    "1",
    "Connections",
    "unsupported"
  ],
  [
    "ferrule",
    "Ferrule",
    "E",
    "1.5 mm²",
    "Connections",
    "unsupported"
  ],
  [
    "shield",
    "Cable shield",
    "SH",
    "Shield",
    "Connections",
    "unsupported"
  ],
  [
    "net-label",
    "Net label",
    "NET",
    "NET1",
    "Connections",
    "unsupported"
  ],
  [
    "text-note",
    "Text note",
    "TXT",
    "Note",
    "Annotations",
    "unsupported"
  ],
  [
    "fuse-holder",
    "Fuse holder",
    "F",
    "Holder",
    "Protection",
    "unsupported"
  ],
  [
    "isolator",
    "Isolator switch",
    "QS",
    "3P",
    "Protection",
    "switch"
  ],
  [
    "contactor-main",
    "Main contactor",
    "K",
    "3P",
    "Control",
    "switch"
  ],
  [
    "switch-disconnector",
    "Switch disconnector",
    "QS",
    "3P",
    "Protection",
    "switch"
  ],
  [
    "encoder",
    "Rotary encoder",
    "B",
    "A/B/Z",
    "Automation",
    "unsupported"
  ],
  [
    "pressure-switch",
    "Pressure switch",
    "B",
    "NO",
    "Automation",
    "switch"
  ],
  [
    "temperature-sensor",
    "Temperature sensor",
    "B",
    "PT100",
    "Automation",
    "unsupported"
  ],
  [
    "flow-sensor",
    "Flow sensor",
    "B",
    "Pulse",
    "Automation",
    "unsupported"
  ],
  [
    "level-sensor",
    "Level sensor",
    "B",
    "24 V",
    "Automation",
    "unsupported"
  ],
  [
    "dc-dc-converter",
    "DC-DC converter",
    "U",
    "24 V → 5 V",
    "Power electronics",
    "unsupported"
  ],
  [
    "ac-dc-converter",
    "AC-DC converter",
    "U",
    "230 V → 24 V",
    "Power electronics",
    "unsupported"
  ],
  [
    "battery-pack",
    "Battery pack",
    "BT",
    "48 V",
    "Sources",
    "voltage"
  ],
  [
    "solar-panel",
    "Solar panel",
    "PV",
    "400 W",
    "Power electronics",
    "unsupported"
  ],
  [
    "inverter",
    "Inverter",
    "U",
    "DC → AC",
    "Power electronics",
    "unsupported"
  ],
  [
    "generator",
    "Generator",
    "G",
    "3 kVA",
    "Sources",
    "unsupported"
  ],
  [
    "alternator",
    "Alternator",
    "G",
    "AC",
    "Sources",
    "unsupported"
  ],
  [
    "busbar",
    "Busbar",
    "BB",
    "L1/L2/L3/N/PE",
    "Connections",
    "unsupported"
  ],
  [
    "transformer-current",
    "Current transformer",
    "TA",
    "100/5 A",
    "Passive",
    "unsupported"
  ],
  [
    "transformer-voltage",
    "Voltage transformer",
    "TV",
    "400/230 V",
    "Passive",
    "unsupported"
  ],
  [
    "relay-solid-state",
    "Solid-state relay",
    "K",
    "24 V",
    "Control",
    "unsupported"
  ],
  [
    "timer-relay",
    "Timer relay",
    "KT",
    "0–10 s",
    "Control",
    "unsupported"
  ],
  [
    "motor-starter",
    "Motor starter",
    "Q",
    "DOL",
    "Control",
    "unsupported"
  ],
  [
    "soft-starter",
    "Soft starter",
    "U",
    "3-phase",
    "Power electronics",
    "unsupported"
  ],
  [
    "vfd",
    "Variable-frequency drive",
    "U",
    "VFD",
    "Power electronics",
    "unsupported"
  ],
  [
    "plc",
    "PLC CPU",
    "A",
    "CPU",
    "Automation",
    "unsupported"
  ],
  [
    "io-module",
    "PLC I/O module",
    "A",
    "16 DI / 16 DO",
    "Automation",
    "unsupported"
  ],
  [
    "safety-relay",
    "Safety relay",
    "K",
    "Dual-channel",
    "Automation",
    "unsupported"
  ],
  [
    "selector-3-position",
    "3-position selector",
    "S",
    "0-1-2",
    "Control",
    "switch"
  ],
  [
    "diac",
    "DIAC",
    "D",
    "Generic DIAC",
    "Semiconductors",
    "unsupported"
  ],
  [
    "triac",
    "TR",
    "T",
    "Generic TRIAC",
    "Semiconductors",
    "unsupported"
  ],
  [
    "scr",
    "SCR / thyristor",
    "T",
    "Generic SCR",
    "Semiconductors",
    "unsupported"
  ],
  [
    "igbt",
    "IGBT",
    "Q",
    "Generic IGBT",
    "Semiconductors",
    "unsupported"
  ],
  [
    "n-channel-jfet",
    "N-channel JFET",
    "Q",
    "Generic JFET",
    "Semiconductors",
    "unsupported"
  ],
  [
    "p-channel-jfet",
    "P-channel JFET",
    "Q",
    "Generic JFET",
    "Semiconductors",
    "unsupported"
  ],
  [
    "darlington-transistor",
    "Darlington transistor",
    "Q",
    "TIP120",
    "Semiconductors",
    "unsupported"
  ],
  [
    "phototransistor",
    "Phototransistor",
    "Q",
    "NPN photo",
    "Semiconductors",
    "unsupported"
  ],
  [
    "crystal-oscillator",
    "Crystal oscillator",
    "X",
    "16 MHz",
    "Logic",
    "unsupported"
  ],
  [
    "potentiometer-trimmer",
    "Trimmer potentiometer",
    "RV",
    "10 kΩ",
    "Passive",
    "resistor"
  ],
  [
    "capacitor-variable",
    "Variable capacitor",
    "C",
    "5–50 pF",
    "Passive",
    "capacitor"
  ],
  [
    "inductor-core",
    "Core inductor",
    "L",
    "10 mH",
    "Passive",
    "inductor"
  ],
  [
    "ferrite-bead",
    "Ferrite bead",
    "FB",
    "600 Ω @ 100 MHz",
    "Passive",
    "unsupported"
  ],
  [
    "ferrite-core-transformer",
    "Ferrite transformer",
    "T",
    "HF",
    "Passive",
    "unsupported"
  ],
  [
    "fuse-resettable",
    "Resettable fuse",
    "F",
    "PTC",
    "Protection",
    "unsupported"
  ],
  [
    "circuit-breaker-3p",
    "Three-pole circuit breaker",
    "QF",
    "C16 · 3P",
    "Protection",
    "switch"
  ],
  [
    "contactor-3p",
    "Three-pole contactor",
    "K",
    "3P",
    "Control",
    "switch"
  ],
  [
    "thermal-relay",
    "Thermal overload relay",
    "F",
    "2.5–4 A",
    "Protection",
    "switch"
  ],
  [
    "terminal-ground",
    "Ground terminal",
    "XPE",
    "PE",
    "Connections",
    "ground"
  ],
  [
    "test-point",
    "Test point",
    "TP",
    "TP1",
    "Measurement",
    "unsupported"
  ],
  [
    "measurement-probe",
    "Measurement probe",
    "P",
    "Probe",
    "Measurement",
    "unsupported"
  ],
  [
    "shield-ground",
    "Shield ground",
    "SH",
    "Shield",
    "Connections",
    "ground"
  ],
  [
    "chassis-ground",
    "Chassis ground",
    "CH",
    "Chassis",
    "Sources",
    "ground"
  ],
  [
    "analog-ground",
    "Analog ground",
    "AGND",
    "0",
    "Sources",
    "ground"
  ],
  [
    "digital-ground",
    "Digital ground",
    "DGND",
    "0",
    "Sources",
    "ground"
  ],
  [
    "no-connect",
    "No-connect marker",
    "NC",
    "NC",
    "Connections",
    "unsupported"
  ],
  [
    "bus-tap",
    "Bus tap",
    "BT",
    "Tap",
    "Connections",
    "unsupported"
  ],
  [
    "wire-crossing",
    "Wire crossing",
    "WC",
    "Crossing",
    "Connections",
    "unsupported"
  ],
  [
    "wire-label",
    "Wire label",
    "NET",
    "NET1",
    "Connections",
    "unsupported"
  ],
  [
    "net-port",
    "Net port",
    "PORT",
    "PORT1",
    "Connections",
    "unsupported"
  ],
  [
    "off-page-connector",
    "Off-page connector",
    "XREF",
    "To sheet",
    "Connections",
    "unsupported"
  ]
];

export const componentLibrary: LibraryComponent[] = raw.map(([id,label,prefix,defaultValue,category,model])=>({
  id,label,prefix,defaultValue,category,model,
  pins: ['ground','terminal-ground','shield-ground','chassis-ground','analog-ground','digital-ground'].includes(id)?1:
    id==='three-phase-source'||id==='three-phase-motor'?4:
    ['circuit-breaker-3p','thermal-relay'].includes(id)?6:
    id==='contactor-3p'?8:
    ['op-amp','comparator','microcontroller','plc','io-module','plc-input','plc-output'].includes(id)?3:
    ['nmos','pmos','npn-transistor','pnp-transistor','darlington-transistor','igbt','scr','triac','n-channel-jfet','p-channel-jfet'].includes(id)?3:2,
  description: `${label}. Editable schematic symbol and properties. Simulation support: ${model==='unsupported'?'not implemented':model}.`
}));

export const componentById = (id: string) => componentLibrary.find(item=>item.id===id);
export const componentCategories = [...new Set(componentLibrary.map(item=>item.category))];

export function searchComponents(query: string, category?: string): LibraryComponent[] {
  const q=query.trim().toLocaleLowerCase();
  return componentLibrary.filter(item=>(!category||item.category===category)&&(!q||[item.label,item.id,item.prefix,item.defaultValue,item.category].some(v=>v.toLocaleLowerCase().includes(q))));
}

/** Parametric family generator. This provides arbitrarily many named catalog variants without duplicating hand-authored source rows. */
export function getFamilyVariant(family:string,index:number,total=1000000):LibraryComponent|null {
  const base=componentById(family);
  if(!base||!Number.isInteger(index)||index<0||index>=Math.max(1,Math.min(1000000,Math.floor(total))))return null;
  let value=base.defaultValue;
  if(base.model==='resistor'){
    const exponent=-3+(index/Math.max(1,total-1))*12;
    const ohms=Math.pow(10,exponent);
    value=ohms>=1e6?(ohms/1e6).toPrecision(5)+' MΩ':ohms>=1e3?(ohms/1e3).toPrecision(5)+' kΩ':ohms>=1?ohms.toPrecision(5)+' Ω':(ohms*1e3).toPrecision(5)+' mΩ';
  } else if(base.model==='capacitor') {
    const farads=Math.pow(10,-12+(index/Math.max(1,total-1))*9);
    value=farads>=1e-6?(farads*1e6).toPrecision(5)+' µF':farads>=1e-9?(farads*1e9).toPrecision(5)+' nF':(farads*1e12).toPrecision(5)+' pF';
  } else if(['power','battery','voltage-source-ac'].includes(base.id)) {
    const volts=1+(index/Math.max(1,total-1))*9999;value=volts.toPrecision(5)+' V DC';
  } else if(['fuse','circuit-breaker','circuit-breaker-3p','thermal-relay'].includes(base.id)) {
    const amps=0.1+(index/Math.max(1,total-1))*999.9;value=amps.toPrecision(5)+' A';
  } else if(['motor','three-phase-motor','fan','heater'].includes(base.id)) {
    const kw=0.01+(index/Math.max(1,total-1))*999.99;value=kw.toPrecision(5)+' kW';
  } else if(['inductor','inductor-core'].includes(base.id)) {
    const henries=Math.pow(10,-6+(index/Math.max(1,total-1))*8);value=henries>=1?henries.toPrecision(5)+' H':henries>=1e-3?(henries*1e3).toPrecision(5)+' mH':(henries*1e6).toPrecision(5)+' µH';
  }
  return {...base,label:`${base.label} · parametric ${index+1}`,defaultValue:value,description:`${base.description} Parametric variant ${index+1} of ${total}; verify ratings and manufacturer data before engineering use.`};
}
export function generateFamilyVariants(family:string,count=1000):LibraryComponent[] {
  const safeCount=Math.max(0,Math.min(10000,Math.floor(count)));
  return Array.from({length:safeCount},(_,index)=>getFamilyVariant(family,index,safeCount)).filter((item):item is LibraryComponent=>item!==null);
}
