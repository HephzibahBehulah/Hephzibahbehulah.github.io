/* VoltPRo canonical project contract. Pure JavaScript: Node CommonJS + browser global. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VoltProCanonicalProject = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const FORMAT = "voltpro";
  const VERSION = 1;
  const DOMAINS = new Set(["dc", "ac", "ac1", "ac3", "three-phase", "three_phase", "control", "signal", "logic", "data", "pneumatic", "hydraulic", "mechanical", "thermal", "optical", "unknown"]);
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const nonempty = value => typeof value === "string" && value.trim().length > 0;
  const stableId = (value, label) => {
    if (!nonempty(value) || !/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value)) throw new Error(label + " must be a stable id matching [A-Za-z][A-Za-z0-9_.-]{0,63}");
    return value;
  };
  const terminalKey = (deviceId, localId) => stableId(deviceId, "device id") + ":" + (nonempty(localId) && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(localId) ? localId : (() => { throw new Error("terminal id must be a stable local identifier"); })());
  const endpointKey = endpoint => {
    if (typeof endpoint === "string") return endpoint;
    if (object(endpoint) && nonempty(endpoint.deviceId) && nonempty(endpoint.terminalId)) return terminalKey(endpoint.deviceId, endpoint.terminalId);
    return "";
  };
  function inferDomain(type, terminal) {
    const d = terminal && terminal.domain;
    if (typeof d === "string" && DOMAINS.has(d)) return d;
    const t = String(type || "").toLowerCase();
    if (t.includes("threephase") || t.includes("three_phase") || t.includes("motor")) return "ac3";
    if (t.includes("acsource") || t.includes("ac_source")) return "ac";
    if (t.includes("plc") || t.includes("logic")) return "logic";
    return "dc";
  }
  function terminalsFor(raw) {
    if (Array.isArray(raw.terminals) && raw.terminals.length) return raw.terminals.map((t, i) => {
      if (typeof t === "string") {
        const local = t.includes(":") ? t.split(":").pop() : t;
        return { id: local, label: local, type: "electrical", domain: inferDomain(raw.type, null) };
      }
      const id = t.id || t.terminalId || String(i);
      return { ...clone(t), id, label: t.label || id, type: t.type || "electrical", domain: t.domain || inferDomain(raw.type, t) };
    });
    if (Array.isArray(raw.pins) && raw.pins.length) return raw.pins.map((p, i) => {
      const id = typeof p === "string" ? p.split(":").pop() : (p.id || p.name || String(i));
      return { id, label: typeof p === "string" ? id : (p.label || p.name || id), type: typeof p === "string" ? "electrical" : (p.type || "electrical"), domain: typeof p === "object" && p.domain ? p.domain : inferDomain(raw.type, null) };
    });
    return [{ id: "1", label: "1", type: "electrical", domain: inferDomain(raw.type, null) }, { id: "2", label: "2", type: "electrical", domain: inferDomain(raw.type, null) }];
  }
  function migrate(raw) {
    if (!object(raw)) throw new Error("Project must be a JSON object");
    const sourceVersion = Number(raw.formatVersion ?? raw.version ?? 1);
    if (!Number.isInteger(sourceVersion) || sourceVersion < 1) throw new Error("Invalid project format version");
    if (sourceVersion > VERSION && raw.format === FORMAT) throw new Error("Unsupported future canonical project version: " + sourceVersion);
    const legacy = Array.isArray(raw.components) && !Array.isArray(raw.devices);
    const rawDevices = Array.isArray(raw.devices) ? raw.devices : (Array.isArray(raw.components) ? raw.components : []);
    const known = new Set(["format","formatVersion","version","metadata","settings","workspace","workspaceConfig","devices","components","wires","nets","panel","plc","firmware","simulation","faults","history","results","simulationResults","extensions"]);
    const deviceKnown = new Set(["id","ref","type","model","kind","modelVersion","version","label","position","x","y","rotation","terminals","pins","parameters","props","operatingState","state","extensions","simulation"]);
    const wireKnown = new Set(["id","from","to","a","b","label","number","colour","color","routing","segments","points","domain","crossSection","cross_section","material","phase","electrical","extensions"]);

    const devices = rawDevices.map((d, i) => {
      if (!object(d)) throw new Error("Device at index " + i + " must be an object");
      const id = d.id || d.ref || "D" + String(i + 1).padStart(3, "0");
      const type = d.type || d.model || d.kind || "unknown";
      return {
        id, type, modelVersion: d.modelVersion || d.version || "1.0.0",
        label: d.label || d.ref || id,
        position: { x: Number(d.position?.x ?? d.x ?? 0), y: Number(d.position?.y ?? d.y ?? 0) },
        rotation: Number(d.rotation ?? 0),
        terminals: terminalsFor({ ...d, type }),
        parameters: clone(d.parameters || d.props || {}),
        operatingState: clone(d.operatingState || d.state || {}),
        extensions: { ...(clone(d.extensions || {})), preservedUnknownFields: { ...(d.extensions?.preservedUnknownFields || {}), ...Object.fromEntries(Object.entries(d).filter(([k]) => !deviceKnown.has(k))) } }
      };
    });
    const resolveLegacyEndpoint = (endpoint) => {
      if (typeof endpoint !== "string") return endpointKey(endpoint);
      const match = endpoint.match(/^([^:]+):(\d+)$/);
      if (!match) return endpoint;
      const device = devices.find(d => d.id === match[1]);
      if (!device) return endpoint;
      const terminal = device.terminals[Number(match[2])];
      return terminal ? terminalKey(device.id, terminal.id) : endpoint;
    };
    const rawWires = Array.isArray(raw.wires) ? raw.wires : [];
    const wires = rawWires.map((w, i) => {
      if (!object(w)) throw new Error("Wire at index " + i + " must be an object");
      const from = resolveLegacyEndpoint(w.from ?? w.a);
      const to = resolveLegacyEndpoint(w.to ?? w.b);
      return {
        id: w.id || "W" + String(i + 1).padStart(3, "0"),
        from, to, label: w.label ?? w.number ?? "",
        colour: w.colour ?? w.color ?? null,
        routing: clone(w.routing || w.segments || w.points || []),
        domain: w.domain || "dc",
        electrical: { crossSection: w.crossSection ?? w.cross_section ?? null, material: w.material ?? null, phase: w.phase ?? null },
        extensions: { ...(clone(w.extensions || {})), preservedUnknownFields: { ...(w.extensions?.preservedUnknownFields || {}), ...Object.fromEntries(Object.entries(w).filter(([k]) => !wireKnown.has(k))) } }
      };
    });
    const unknown = {};
    Object.keys(raw).forEach(k => { if (!known.has(k)) unknown[k] = clone(raw[k]); });
    return {
      format: FORMAT, formatVersion: VERSION,
      metadata: { id: raw.metadata?.id || raw.id || "project", name: raw.metadata?.name || raw.name || "Untitled Circuit", author: raw.metadata?.author || "", createdAt: raw.metadata?.createdAt || raw.metadata?.created || null, updatedAt: raw.metadata?.updatedAt || raw.metadata?.updated || null, sourceFormatVersion: sourceVersion },
      workspace: { mode: raw.workspace?.mode || (typeof raw.workspace === "string" ? raw.workspace : null) || raw.workspaceConfig?.mode || "schematic", grid: Number(raw.workspace?.grid ?? raw.settings?.grid ?? 20), units: raw.workspace?.units || raw.settings?.units || "SI", symbolStandard: raw.workspace?.symbolStandard || raw.settings?.symbolStandard || "IEC", viewport: clone(raw.workspace?.viewport || { zoom: 1, pan: { x: 0, y: 0 } }) },
      devices, wires,
      nets: { policy: "derived", snapshot: null },
      panel: clone(raw.panel || { rails: [], items: [], width: 600, height: 400 }),
      plc: clone(raw.plc || { programs: [], ioMappings: [] }),
      simulation: { configuration: clone(raw.simulation?.configuration || raw.simulation || { mode: "dc" }), resultsMetadata: clone(raw.simulation?.resultsMetadata || raw.results?.metadata || raw.simulationResults?.metadata || null) },
      extensions: { ...clone(raw.extensions || {}), preservedUnknownFields: { ...(raw.extensions?.preservedUnknownFields || {}), ...unknown }, legacyEnvelope: legacy ? { originalVersion: sourceVersion } : clone(raw.extensions?.legacyEnvelope || null) }
    };
  }
  function validate(project) {
    const errors = [];
    if (!object(project)) return { valid: false, errors: [{ code: "PROJECT_TYPE", path: "$", message: "Project must be an object" }] };
    if (project.format !== FORMAT || project.formatVersion !== VERSION) errors.push({ code: "FORMAT_VERSION", path: "$.formatVersion", message: "Expected canonical VoltPRo format version " + VERSION });
    if (!Array.isArray(project.devices)) errors.push({ code: "DEVICES_TYPE", path: "$.devices", message: "devices must be an array" });
    if (!Array.isArray(project.wires)) errors.push({ code: "WIRES_TYPE", path: "$.wires", message: "wires must be an array" });
    const deviceIds = new Set(), terminalIds = new Map();
    for (const [i, d] of (Array.isArray(project.devices) ? project.devices : []).entries()) {
      const p = "$.devices[" + i + "]";
      if (!object(d)) { errors.push({ code: "DEVICE_TYPE", path: p, message: "Device must be an object" }); continue; }
      if (!nonempty(d.id) || !/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(d.id)) errors.push({ code: "DEVICE_ID", path: p + ".id", message: "Invalid or missing stable device id" });
      else if (deviceIds.has(d.id)) errors.push({ code: "DUPLICATE_DEVICE_ID", path: p + ".id", message: "Duplicate device id: " + d.id });
      else deviceIds.add(d.id);
      if (!nonempty(d.type)) errors.push({ code: "DEVICE_TYPE_ID", path: p + ".type", message: "Device type is required" });
      if (!Number.isFinite(d.position?.x) || !Number.isFinite(d.position?.y)) errors.push({ code: "POSITION", path: p + ".position", message: "Position x/y must be finite numbers" });
      if (!Number.isFinite(d.rotation)) errors.push({ code: "ROTATION", path: p + ".rotation", message: "Rotation must be finite" });
      if (!Array.isArray(d.terminals) || !d.terminals.length) { errors.push({ code: "TERMINALS_MISSING", path: p + ".terminals", message: "Every device must define at least one terminal" }); continue; }
      const locals = new Set();
      for (const [j, t] of d.terminals.entries()) {
        const tp = p + ".terminals[" + j + "]";
        if (!object(t) || !nonempty(t.id) || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(t.id)) { errors.push({ code: "TERMINAL_ID", path: tp + ".id", message: "Terminal requires a stable local id" }); continue; }
        if (locals.has(t.id)) errors.push({ code: "DUPLICATE_TERMINAL_ID", path: tp + ".id", message: "Duplicate terminal id " + d.id + ":" + t.id });
        locals.add(t.id);
        if (!nonempty(t.type)) errors.push({ code: "TERMINAL_TYPE", path: tp + ".type", message: "Terminal type is required" });
        if (!DOMAINS.has(t.domain)) errors.push({ code: "UNSUPPORTED_DOMAIN", path: tp + ".domain", message: "Unsupported terminal domain: " + t.domain });
        const key = d.id + ":" + t.id;
        if (terminalIds.has(key)) errors.push({ code: "DUPLICATE_TERMINAL_KEY", path: tp, message: "Duplicate terminal key " + key });
        terminalIds.set(key, { deviceId: d.id, terminalId: t.id, domain: t.domain });
      }
    }
    const wireIds = new Set();
    for (const [i, w] of (Array.isArray(project.wires) ? project.wires : []).entries()) {
      const p = "$.wires[" + i + "]";
      if (!object(w)) { errors.push({ code: "WIRE_TYPE", path: p, message: "Wire must be an object" }); continue; }
      if (!nonempty(w.id) || !/^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(w.id)) errors.push({ code: "WIRE_ID", path: p + ".id", message: "Invalid or missing stable wire id" });
      else if (wireIds.has(w.id)) errors.push({ code: "DUPLICATE_WIRE_ID", path: p + ".id", message: "Duplicate wire id: " + w.id });
      else wireIds.add(w.id);
      const from = endpointKey(w.from), to = endpointKey(w.to);
      if (!from || !terminalIds.has(from)) errors.push({ code: "MISSING_TERMINAL", path: p + ".from", message: "Wire source does not resolve to an existing terminal: " + String(from) });
      if (!to || !terminalIds.has(to)) errors.push({ code: "MISSING_TERMINAL", path: p + ".to", message: "Wire destination does not resolve to an existing terminal: " + String(to) });
      if (from && to && from === to) errors.push({ code: "WIRE_SELF_LOOP", path: p, message: "Wire endpoints must be different terminals" });
      if (!DOMAINS.has(w.domain)) errors.push({ code: "UNSUPPORTED_DOMAIN", path: p + ".domain", message: "Unsupported wire domain: " + w.domain });
      if (!Array.isArray(w.routing)) errors.push({ code: "WIRE_ROUTING", path: p + ".routing", message: "Wire routing must be an array of points" });
      else w.routing.forEach((pt, j) => { if (!object(pt) || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) errors.push({ code: "WIRE_ROUTING_POINT", path: p + ".routing[" + j + "]", message: "Routing points require finite x/y coordinates" }); });
      if (from && to && terminalIds.has(from) && terminalIds.has(to)) {
        const a = terminalIds.get(from).domain, b = terminalIds.get(to).domain;
        if (a !== w.domain || b !== w.domain) errors.push({ code: "DOMAIN_MISMATCH", path: p + ".domain", message: "Wire domain must match both endpoint terminal domains" });
      }
    }
    if (!object(project.panel)) errors.push({ code: "PANEL_TYPE", path: "$.panel", message: "panel must be an object" });
    if (!object(project.plc)) errors.push({ code: "PLC_TYPE", path: "$.plc", message: "plc must be an object containing programs and I/O mappings" });
    if (!object(project.simulation)) errors.push({ code: "SIMULATION_TYPE", path: "$.simulation", message: "simulation must be an object" });
    return { valid: errors.length === 0, errors };
  }
  function resolveNets(project) {
    const check = validate(project);
    if (!check.valid) { const e = new Error("Cannot resolve nets: project validation failed"); e.validation = check; throw e; }
    const parent = new Map();
    const find = x => { if (!parent.has(x)) parent.set(x, x); if (parent.get(x) !== x) parent.set(x, find(parent.get(x))); return parent.get(x); };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) { if (ra < rb) parent.set(rb, ra); else parent.set(ra, rb); } };
    project.devices.forEach(d => d.terminals.forEach(t => find(d.id + ":" + t.id)));
    project.wires.forEach(w => union(endpointKey(w.from), endpointKey(w.to)));
    const groups = new Map();
    for (const id of parent.keys()) { const r = find(id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(id); }
    return [...groups.values()].map(members => members.sort()).sort((a, b) => a[0].localeCompare(b[0])).map((members, i) => ({ id: "N" + String(i + 1).padStart(4, "0"), members, domain: project.devices.flatMap(d => d.terminals.map(t => ({ key: d.id + ":" + t.id, domain: t.domain }))).find(t => t.key === members[0])?.domain || "unknown" }));
  }
  function serialize(project) {
    const copy = clone(project);
    const result = validate(copy);
    if (!result.valid) { const e = new Error("Cannot serialize invalid project"); e.validation = result; throw e; }
    // Derived voltages/currents never become editable source data.
    if (copy.simulation && object(copy.simulation)) delete copy.simulation.nodeVoltages;
    return JSON.stringify(copy, null, 2);
  }
  function deserialize(input) {
    const raw = typeof input === "string" ? JSON.parse(input) : clone(input);
    const project = raw?.format === FORMAT && raw?.formatVersion === VERSION ? raw : migrate(raw);
    const result = validate(project);
    if (!result.valid) { const e = new Error("Invalid VoltPRo project"); e.validation = result; throw e; }
    return project;
  }
  function createDevice({ id, type, modelVersion = "1.0.0", label, position = { x: 0, y: 0 }, rotation = 0, terminals, parameters = {}, operatingState = {} }) {
    return { id, type, modelVersion, label: label || id, position: clone(position), rotation, terminals: clone(terminals || terminalsFor({ type })), parameters: clone(parameters), operatingState: clone(operatingState), extensions: {} };
  }
  return { FORMAT, VERSION, DOMAINS: [...DOMAINS], terminalKey, migrate, validate, resolveNets, serialize, deserialize, createDevice };
});
