export const MAX_SCOPE_SAMPLES = 5001;
export const MAX_SCOPE_SIGNALS = 64;

export function createSimulatorScopeCapture(project, transient, capturedAt = Date.now()) {
  if (!transient?.ok || !Array.isArray(transient.samples) || transient.samples.length < 2 || transient.samples.length > MAX_SCOPE_SAMPLES) {
    throw new Error(transient?.error || 'Simulator transient capture is unavailable or exceeds the oscilloscope record limit.');
  }
  const samples = transient.samples;
  const times = samples.map(sample => Number(sample.t));
  if (times.some((t, i) => !Number.isFinite(t) || (i > 0 && t <= times[i - 1]))) throw new Error('Simulator capture timestamps must increase.');
  const dt = times[1] - times[0];
  for (let i = 2; i < times.length; i++) if (Math.abs((times[i] - times[i - 1]) - dt) > Math.max(1e-12, dt * 0.001)) throw new Error('Simulator samples are not uniformly spaced.');
  const aliases = new Map();
  const terminalNodes = transient.terminalNodes || {};
  for (const component of project.components || []) {
    const id = String(component.id || '');
    const pins = Array.isArray(component.pins) ? component.pins : [];
    const label = String(component.props?.label || component.name || component.type || id).slice(0, 80);
    for (let i = 0; i < pins.length; i++) {
      const node = Number(terminalNodes[pins[i]]);
      if (!Number.isInteger(node) || node < 0) continue;
      const pinName = String(component.terminalNames?.[i] || 'terminal ' + (i + 1)).slice(0, 40);
      if (!aliases.has(node)) aliases.set(node, []);
      aliases.get(node).push(label + ' · ' + pinName);
    }
  }
  const nodeIds = [...new Set(samples.flatMap(sample => (sample.nodeVoltages || []).map(item => Number(item.node)).filter(node => Number.isInteger(node) && node > 0)))].sort((a,b)=>a-b);
  const nodeValues = new Map(nodeIds.map(node => [node, []]));
  for (const sample of samples) {
    const values = new Map((sample.nodeVoltages || []).map(item => [Number(item.node), Number(item.voltage)]));
    for (const node of nodeIds) {
      const value = values.get(node);
      if (!Number.isFinite(value)) throw new Error('Simulator capture contains an invalid node voltage.');
      nodeValues.get(node).push(value);
    }
  }
  const signals = [{id:'node:0',name:'Ground reference · 0 V',values:times.map(()=>0)}];
  for (const node of nodeIds.slice(0, MAX_SCOPE_SIGNALS - 1)) {
    const named = aliases.get(node) || [];
    signals.push({id:'node:' + node,name:'Node ' + node + (named.length ? ' · ' + [...new Set(named)].slice(0,3).join(' / ') : ' · voltage'),values:nodeValues.get(node)});
  }
  const source = (project.components || []).find(component => /^(battery|dcsource|voltage_source|ac_source|acsource|threephase|controlsource)$/i.test(String(component.type||'')));
  const sourceNode = source?.pins?.[0] ? Number(terminalNodes[source.pins[0]]) : NaN;
  const first = Number.isInteger(sourceNode) && signals.some(signal => signal.id === 'node:' + sourceNode) ? 'node:' + sourceNode : signals[1]?.id || signals[0].id;
  const second = signals.find(signal => signal.id !== first && signal.id !== 'node:0')?.id || first;
  const capture = {type:'voltpro-simulator-scope-capture',version:1,capturedAt,analysis:transient.analysis||'Transient analysis (MNA)',sampleRate:1/dt,times,signals,defaults:[first,second],omittedSignals:Math.max(0,nodeIds.length-(MAX_SCOPE_SIGNALS-1))};
  return normalizeSimulatorScopeCapture(capture);
}

export function normalizeSimulatorScopeCapture(input) {
  if (!input || input.type !== 'voltpro-simulator-scope-capture' || input.version !== 1) throw new Error('Unsupported simulator capture format.');
  if (!Array.isArray(input.times) || input.times.length < 2 || input.times.length > MAX_SCOPE_SAMPLES || !Array.isArray(input.signals) || !input.signals.length || input.signals.length > MAX_SCOPE_SIGNALS) throw new Error('Simulator capture exceeds supported scope limits.');
  const times = input.times.map(Number);
  if (times.some((t,i)=>!Number.isFinite(t)||(i>0&&t<=times[i-1]))) throw new Error('Simulator capture timestamps are invalid.');
  const dt=times[1]-times[0];for(let i=2;i<times.length;i++)if(Math.abs((times[i]-times[i-1])-dt)>Math.max(1e-12,dt*.001))throw new Error('Simulator capture timestamps are not uniform.');
  const ids=new Set(),signals=input.signals.map(signal=>{const id=String(signal.id||'');if(!id||ids.has(id)||!Array.isArray(signal.values)||signal.values.length!==times.length)throw new Error('Simulator signal is malformed.');ids.add(id);const values=signal.values.map(Number);if(values.some(value=>!Number.isFinite(value)))throw new Error('Simulator signal contains a non-finite voltage.');return{id,name:String(signal.name||id).slice(0,180),values};});
  const defaults=Array.isArray(input.defaults)&&input.defaults.length===2?input.defaults.map(String):[signals[0].id,signals[0].id];
  if(defaults.some(id=>!ids.has(id)))throw new Error('Default simulator channels reference missing signals.');
  return {type:input.type,version:1,capturedAt:Number.isFinite(Number(input.capturedAt))?Number(input.capturedAt):Date.now(),analysis:String(input.analysis||'MNA transient capture').slice(0,100),sampleRate:1/dt,times,signals,defaults,omittedSignals:Math.max(0,Number(input.omittedSignals)||0)};
}
