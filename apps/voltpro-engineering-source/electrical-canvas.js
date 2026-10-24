import { GRID_MM, GRID_PX, PLAN_COLUMNS, PLAN_ROWS, columnLabel, routeOrthogonal, snapGrid } from "./electrical-engine.mjs";

const TYPES = [
  { type: "distribution-board", label: "Distribution board", symbol: "DB", voltage: "230 V" },
  { type: "wall-switch", label: "Wall switch", symbol: "S", voltage: "230 V" },
  { type: "schuko-socket", label: "Schuko socket", symbol: "⊙", voltage: "230 V" },
  { type: "ceiling-light", label: "Ceiling light", symbol: "⊗", voltage: "230 V" },
  { type: "data-point", label: "Data point", symbol: "D", voltage: "0 V" }
];
const STORE = "voltpro-buildingcad-v1";
const $ = id => document.getElementById(id);
const surface = $("planSurface"), nodeLayer = $("nodeLayer"), wireLayer = $("wireLayer");
const status = $("status"), propForm = $("propertiesForm");
let state = loadState(), selected = null, pendingType = null, wireStart = null, dragState = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && Array.isArray(saved.nodes) && Array.isArray(saved.wires)) return saved;
  } catch {}
  return { nodes: [], wires: [], metadata: { name: "Residential electrical plan", date: new Date().toISOString().slice(0, 10), scale: "1:50", drafter: "VoltPro user" } };
}
function save() {
  state.metadata = { name: $("projectName").value, date: $("projectDate").value, scale: $("titleScale").value, drafter: $("drafter").value };
  localStorage.setItem(STORE, JSON.stringify(state));
}
function typeOf(type) { return TYPES.find(item => item.type === type) || TYPES[0]; }
function id() { return "B" + Math.random().toString(36).slice(2, 8).toUpperCase(); }
function setStatus(message) { status.textContent = message; }
function renderRulers() {
  $("topRuler").replaceChildren(...Array.from({ length: PLAN_COLUMNS }, (_, i) => {
    const label = document.createElement("span"); label.textContent = String(i + 1); return label;
  }));
  $("leftRuler").replaceChildren(...Array.from({ length: PLAN_ROWS }, (_, i) => {
    const label = document.createElement("span"); label.textContent = columnLabel(i + 1); return label;
  }));
}
function pointFromEvent(event) {
  const rect = surface.getBoundingClientRect();
  return {
    x: Math.max(1, Math.min(PLAN_COLUMNS, snapGrid(event.clientX - rect.left) + 1)),
    y: Math.max(0, Math.min(PLAN_ROWS - 1, snapGrid(event.clientY - rect.top)))
  };
}
function partButton(item) {
  const button = document.createElement("button");
  button.type = "button"; button.className = "cad-part"; button.draggable = true; button.dataset.type = item.type;
  const symbol = document.createElement("span"); symbol.className = "symbol"; symbol.textContent = item.symbol;
  const name = document.createElement("span"); name.textContent = item.label;
  const small = document.createElement("small"); small.textContent = item.voltage + " · IEC/DIN inspired";
  name.append(small); button.append(symbol, name);
  button.addEventListener("click", () => chooseType(item.type));
  button.addEventListener("dragstart", event => { event.dataTransfer.setData("text/voltpro-building-component", item.type); event.dataTransfer.effectAllowed = "copy"; });
  return button;
}
function chooseType(type) {
  pendingType = type; wireStart = null;
  document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.type === type)));
  $("wireMode").setAttribute("aria-pressed", "false");
  setStatus(typeOf(type).label + " selected. Click a grid point to place it (one square = " + GRID_MM + " mm).");
}
function renderNodes() {
  nodeLayer.replaceChildren();
  for (const node of state.nodes) {
    const item = typeOf(node.type), button = document.createElement("button");
    button.type = "button"; button.className = "cad-node"; button.dataset.id = node.id;
    button.style.left = ((node.x - 1) * GRID_PX) + "px"; button.style.top = (node.y * GRID_PX) + "px";
    button.setAttribute("aria-label", item.label + ": " + node.name + ", " + node.room + ", " + node.voltage);
    button.setAttribute("aria-pressed", String(selected === node.id));
    const symbol = document.createElement("span"); symbol.className = "node-symbol"; symbol.textContent = item.symbol;
    const caption = document.createElement("small"); caption.textContent = node.name;
    button.append(symbol, caption);
    button.addEventListener("click", event => { event.stopPropagation(); selectNode(node.id); });
    button.addEventListener("pointerdown", event => {
      if (event.button !== 0 || $("wireMode").getAttribute("aria-pressed") === "true") return;
      dragState = { id: node.id, x: event.clientX, y: event.clientY, nodeX: node.x, nodeY: node.y };
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointermove", event => {
      if (!dragState || dragState.id !== node.id || !(event.buttons & 1)) return;
      const dx = event.clientX - dragState.x, dy = event.clientY - dragState.y;
      if (Math.hypot(dx, dy) < 4) return;
      node.x = Math.max(1, Math.min(PLAN_COLUMNS, dragState.nodeX + snapGrid(dx)));
      node.y = Math.max(0, Math.min(PLAN_ROWS - 1, dragState.nodeY + snapGrid(dy)));
      button.style.left = ((node.x - 1) * GRID_PX) + "px";
      button.style.top = (node.y * GRID_PX) + "px";
      renderWires(); save();
    });
    button.addEventListener("pointerup", () => { dragState = null; renderNodes(); renderWires(); });
    nodeLayer.append(button);
  }
}
function renderWires() {
  wireLayer.setAttribute("viewBox", "0 0 " + PLAN_COLUMNS * GRID_PX + " " + PLAN_ROWS * GRID_PX);
  wireLayer.setAttribute("width", String(PLAN_COLUMNS * GRID_PX));
  wireLayer.setAttribute("height", String(PLAN_ROWS * GRID_PX));
  wireLayer.replaceChildren();
  for (const wire of state.wires) {
    const from = state.nodes.find(node => node.id === wire.from), to = state.nodes.find(node => node.id === wire.to);
    if (!from || !to) continue;
    const points = routeOrthogonal(from, to).map(point => ((point.x - 1) * GRID_PX) + "," + (point.y * GRID_PX)).join(" ");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("class", "wire"); line.setAttribute("points", points); wireLayer.append(line);
  }
}
function selectNode(nodeId) {
  if ($("wireMode").getAttribute("aria-pressed") === "true") {
    if (!wireStart) { wireStart = nodeId; setStatus("Start selected. Choose the cable destination."); return; }
    if (wireStart === nodeId) { wireStart = null; setStatus("Choose two different components."); return; }
    state.wires.push({ id: id(), from: wireStart, to: nodeId }); wireStart = null; save(); renderWires(); setStatus("Orthogonal cable added and aligned to the 200 mm grid."); return;
  }
  selected = nodeId;
  const node = state.nodes.find(item => item.id === selected);
  $("emptyProperties").hidden = true; propForm.hidden = false;
  $("componentId").value = node.id; $("componentName").value = node.name; $("componentRoom").value = node.room; $("componentVoltage").value = node.voltage;
  renderNodes();
}
function placeNode(point) {
  if (!pendingType) return;
  const item = typeOf(pendingType), node = { id: id(), type: item.type, name: item.label, room: "", voltage: item.voltage, x: point.x, y: point.y };
  state.nodes.push(node); pendingType = null; document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", "false"));
  save(); renderNodes(); selectNode(node.id); setStatus(node.name + " placed at " + (node.x) + " / " + columnLabel(node.y + 1) + ".");
}
document.getElementById("componentLibrary").replaceChildren(...TYPES.map(partButton));
renderRulers();
$("projectName").value = state.metadata.name; $("projectDate").value = state.metadata.date; $("titleScale").value = state.metadata.scale; $("drafter").value = state.metadata.drafter; $("drawingScale").value = state.metadata.scale;
surface.addEventListener("click", event => { if (event.target === surface) placeNode(pointFromEvent(event)); });
surface.addEventListener("dragover", event => { if (event.dataTransfer.types.includes("text/voltpro-building-component")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; } });
surface.addEventListener("drop", event => { event.preventDefault(); chooseType(event.dataTransfer.getData("text/voltpro-building-component")); placeNode(pointFromEvent(event)); });
$("wireMode").addEventListener("click", () => { pendingType = null; wireStart = null; document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", "false")); const active = $("wireMode").getAttribute("aria-pressed") !== "true"; $("wireMode").setAttribute("aria-pressed", String(active)); setStatus(active ? "Wire mode: click a source component, then a destination." : "Wire mode off."); });
for (const [field, key] of [["componentName", "name"], ["componentRoom", "room"], ["componentVoltage", "voltage"]]) {
  $(field).addEventListener("input", () => { const node = state.nodes.find(item => item.id === selected); if (!node) return; node[key] = $(field).value; save(); renderNodes(); });
  $(field).addEventListener("change", () => { const node = state.nodes.find(item => item.id === selected); if (!node) return; node[key] = $(field).value; save(); renderNodes(); });
}
$("deleteComponent").addEventListener("click", () => {
  state.nodes = state.nodes.filter(node => node.id !== selected); state.wires = state.wires.filter(wire => wire.from !== selected && wire.to !== selected);
  selected = null; propForm.hidden = true; $("emptyProperties").hidden = false; save(); renderNodes(); renderWires(); setStatus("Component and its connected cables removed.");
});
for (const field of ["projectName", "projectDate", "titleScale", "drafter"]) $(field).addEventListener("input", save);
$("drawingScale").addEventListener("change", () => { $("titleScale").value = $("drawingScale").value; save(); });
$("exportPlan").addEventListener("click", () => {
  const data = { format: "voltpro-buildingcad", version: 1, gridMillimetres: GRID_MM, metadata: state.metadata, nodes: state.nodes, wires: state.wires };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = "voltpro-building-plan.json"; link.click(); URL.revokeObjectURL(url);
});
renderNodes(); renderWires();
