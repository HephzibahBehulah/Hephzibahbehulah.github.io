import { RULER_COLUMNS, RULER_ROWS, clampZoom, drawingPoint, visibleTicks, zoomScroll, drawingExtent } from "./electrical-viewport.mjs";
import { GRID_MM, GRID_PX, columnLabel, snapGrid } from "./electrical-engine.mjs";
import { BUILDING_TYPES, createBuildingDocument, recoverBuildingDocument, routeBuildingConnection, validateBuildingDocument } from "./building-document.mjs";

const STORE = "voltpro-buildingcad-v2", LEGACY_STORE = "voltpro-buildingcad-v1";
const TYPES = Object.entries(BUILDING_TYPES).map(([type, value]) => ({ type, ...value }));
const $ = id => document.getElementById(id);
const surface = $("planSurface"), nodeLayer = $("nodeLayer"), wireLayer = $("wireLayer"), roomLayer = $("roomLayer");
const status = $("status"), propForm = $("propertiesForm"), roomForm = $("roomPropertiesForm");
let state = loadState(), selected = null, selectedRoom = null, pendingType = null, wireStart = null, dragState = null, roomStart = null;
const history = [], future = [];
const scroll = $("planScroll"), extent = $("planExtent");
let zoom = 1, pan = null, suppressClick = false, spacePan = false;
const touches = new Map();
let pinch = null;
function resizeDrawing() {
  const size = drawingExtent(state);
  surface.style.width = size.width + "px"; surface.style.height = size.height + "px";
  surface.style.transform = `scale(${zoom})`;
  extent.style.width = size.width * zoom + "px"; extent.style.height = size.height * zoom + "px";
  renderRulers();
}
function setZoom(next, x = scroll.clientWidth / 2, y = scroll.clientHeight / 2) {
  next = clampZoom(next);
  const target = zoomScroll(scroll.scrollLeft, scroll.scrollTop, zoom, next, x, y);
  zoom = next; resizeDrawing(); scroll.scrollTo(target.left, target.top);
  $("zoomLevel").textContent = Math.round(zoom * 100) + "%"; renderRulers();
}
function fitDrawing() {
  if (!state.nodes.length && !state.rooms.length) { setZoom(1,0,0); scroll.scrollTo(0,0); renderRulers(); return; }
  const boxes = [...state.nodes.map(n => ({x:(n.x-1)*GRID_PX-40,y:n.y*GRID_PX-30,w:100,h:70})), ...state.rooms.map(r => ({x:(r.x-1)*GRID_PX,y:r.y*GRID_PX,w:r.width*GRID_PX,h:r.height*GRID_PX}))];
  const minX = Math.max(0,Math.min(...boxes.map(b=>b.x))-30), minY = Math.max(0,Math.min(...boxes.map(b=>b.y))-30);
  const maxX = Math.max(...boxes.map(b=>b.x+b.w))+30, maxY = Math.max(...boxes.map(b=>b.y+b.h))+30;
  setZoom(Math.min(scroll.clientWidth/(maxX-minX),scroll.clientHeight/(maxY-minY),1.5),0,0);
  scroll.scrollTo(minX*zoom,minY*zoom); renderRulers();
}
function togglePanel(name, open = document.body.dataset[name + "Open"] !== "true") {
  document.body.dataset[name + "Open"] = String(open);
  document.querySelectorAll(`[data-panel="${name}"]`).forEach(button => button.setAttribute("aria-expanded",String(open)));
}


function clone(value) { return structuredClone(value); }
function loadState() {
  for (const key of [STORE, LEGACY_STORE]) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      if (raw) return recoverBuildingDocument({ ...raw, format: raw.format || "voltpro-buildingcad", version: raw.version || 1 });
    } catch (error) { console.warn("BuildingCAD project was not loaded:", error); }
  }
  return createBuildingDocument();
}
function snapshot() { history.push(clone(state)); if (history.length > 80) history.shift(); future.length = 0; }
function updateMetadata() {
  state.metadata = { ...state.metadata, name: $("projectName").value.trim(), documentNumber: $("documentNumber").value.trim(), revision: $("revision").value.trim(), date: $("projectDate").value, scale: $("titleScale").value.trim(), drafter: $("drafter").value.trim() };
}
function save() {
  updateMetadata();
  localStorage.setItem(STORE, JSON.stringify(state));
  $("commandStatus").textContent = "Saved locally · " + new Date().toLocaleTimeString();
}
function typeOf(type) { return BUILDING_TYPES[type] ? BUILDING_TYPES[type] : { label: "Unknown device", system: "unknown", defaultVoltage: "" }; }
function objectId(prefix) { return prefix + crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase(); }
function setStatus(message) { status.textContent = message; }
function announce(message) { $("commandStatus").textContent = message; }
function pointFromEvent(event) {
  return drawingPoint(event.clientX, event.clientY, surface.getBoundingClientRect(), zoom, GRID_PX);
}
function renderRulers() {
  const draw = (id, ticks, letters) => $(id).replaceChildren(...ticks.map(tick => {
    const label = document.createElement("span"); label.textContent = letters ? columnLabel(tick.index + 1) : String(tick.index);
    label.style[letters ? "top" : "left"] = tick.position + "px";
    label.style[letters ? "height" : "width"] = tick.size + "px";
    return label;
  }));
  draw("topRulerTicks",visibleTicks(scroll.scrollLeft,zoom,scroll.clientWidth,RULER_COLUMNS),false);
  draw("leftRulerTicks",visibleTicks(scroll.scrollTop,zoom,scroll.clientHeight,RULER_ROWS),true);
}
function partButton(item) {
  const button = document.createElement("button"); button.type = "button"; button.className = "cad-part"; button.draggable = true; button.dataset.type = item.type;
  const badge = document.createElement("span"); badge.className = "symbol"; badge.textContent = item.system === "data" ? "DATA" : "230V";
  const name = document.createElement("span"); name.textContent = item.label;
  const small = document.createElement("small"); small.textContent = `${item.defaultVoltage} · typed plan object`;
  name.append(small); button.append(badge, name);
  button.addEventListener("click", () => chooseType(item.type));
  button.addEventListener("dragstart", event => { event.dataTransfer.setData("text/voltpro-building-component", item.type); event.dataTransfer.effectAllowed = "copy"; });
  return button;
}
function chooseType(type) {
  pendingType = type; wireStart = null; roomStart = null;
  document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.type === type)));
  setMode("place"); setStatus(`${typeOf(type).label} selected. Click a grid point to place a typed device object.`);
}
function setMode(mode) {
  document.body.dataset.mode = mode;
  for (const details of document.querySelectorAll(".cad-menubar details")) details.open = false;
  announce(`Mode: ${mode}`);
}
function renderRooms() {
  roomLayer.replaceChildren();
  for (const room of state.rooms) {
    const box = document.createElement("div"); box.className = "room-boundary"; box.dataset.id = room.id;
    box.style.left = ((room.x - 1) * GRID_PX) + "px"; box.style.top = (room.y * GRID_PX) + "px";
    box.style.width = Math.max(2, room.width * GRID_PX) + "px"; box.style.height = Math.max(2, room.height * GRID_PX) + "px";
    box.setAttribute("role", "button"); box.tabIndex = 0; box.setAttribute("aria-label", `Room ${room.name}, ${room.width * GRID_MM} by ${room.height * GRID_MM} mm`); box.setAttribute("aria-pressed", String(selectedRoom === room.id));
    const label = document.createElement("span"); label.textContent = room.name; box.append(label);
    box.addEventListener("click", event => { event.stopPropagation(); showRoomProperties(room); });
    box.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showRoomProperties(room); } });
    roomLayer.append(box);
  }
}
function renderNodes() {
  nodeLayer.replaceChildren();
  for (const node of state.nodes) {
    const item = typeOf(node.type), button = document.createElement("button");
    button.type = "button"; button.className = "cad-node"; button.dataset.id = node.id; button.dataset.system = item.system;
    button.style.left = ((node.x - 1) * GRID_PX) + "px"; button.style.top = (node.y * GRID_PX) + "px";
    button.setAttribute("aria-label", `${item.label}: ${node.tag || node.id}, ${node.name}, ${node.room || "room not assigned"}`);
    button.setAttribute("aria-pressed", String(selected === node.id));
    const reference = document.createElement("strong"); reference.className = "node-reference"; reference.textContent = node.tag || node.id;
    const caption = document.createElement("small"); caption.textContent = node.name;
    const classLabel = document.createElement("span"); classLabel.className = "node-class"; classLabel.textContent = item.label;
    button.append(reference, caption, classLabel);
    button.addEventListener("click", event => { event.stopPropagation(); selectNode(node.id); });
    button.addEventListener("pointerdown", event => {
      if (event.button !== 0 || spacePan || document.body.dataset.mode !== "select") return;
      selected = node.id; showProperties(node); snapshot();
      dragState = { id: node.id, x: event.clientX, y: event.clientY, nodeX: node.x, nodeY: node.y };
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointermove", event => {
      if (!dragState || dragState.id !== node.id || !(event.buttons & 1)) return;
      const dx = event.clientX - dragState.x, dy = event.clientY - dragState.y;
      if (Math.hypot(dx, dy) < 4) return;
      node.x = Math.max(1, dragState.nodeX + snapGrid(dx / zoom));
      node.y = Math.max(0, dragState.nodeY + snapGrid(dy / zoom));
      button.style.left = ((node.x - 1) * GRID_PX) + "px"; button.style.top = (node.y * GRID_PX) + "px";
      renderWires();
    });
    button.addEventListener("pointerup", event => {
      if (!dragState || dragState.id !== node.id) return;
      const moved = Math.hypot(event.clientX - dragState.x, event.clientY - dragState.y) >= 4;
      dragState = null; if (moved) { save(); resizeDrawing(); } renderNodes(); renderWires(); if (!moved) selectNode(node.id);
    });
    button.addEventListener("pointercancel", () => { dragState = null; renderNodes(); renderWires(); });
    nodeLayer.append(button);
  }
}
function renderWires() {
  const size = drawingExtent(state);
  wireLayer.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
  wireLayer.setAttribute("width", String(size.width)); wireLayer.setAttribute("height", String(size.height)); wireLayer.replaceChildren();
  for (const wire of state.wires) {
    const from = state.nodes.find(node => node.id === wire.from), to = state.nodes.find(node => node.id === wire.to);
    if (!from || !to) continue;
    const points = routeBuildingConnection(from, to).map(point => `${(point.x - 1) * GRID_PX},${point.y * GRID_PX}`).join(" ");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("class", `wire wire-${typeOf(from.type).system}`); line.setAttribute("points", points); line.setAttribute("data-id", wire.id); wireLayer.append(line);
  }
}
function showProperties(node) {
  togglePanel("properties",true);
  selectedRoom = null; $("emptyProperties").hidden = true; roomForm.hidden = true; propForm.hidden = false;
  $("componentId").value = node.id; $("componentTag").value = node.tag; $("componentName").value = node.name;
  $("componentRoom").value = node.room; $("componentCircuit").value = node.circuit || ""; $("componentHeight").value = node.mountingHeight || "";
  const allowed = node.type === "distribution-board" ? ["230 V AC", "400 V AC"] : node.type === "schuko-socket" ? ["230 V AC"] : node.type === "data-point" ? ["SELV / data"] : ["230 V AC", "24 V DC"];
  $("componentVoltage").replaceChildren(...allowed.map(voltage => { const option = document.createElement("option"); option.value = voltage; option.textContent = voltage; return option; }));
  $("componentVoltage").value = allowed.includes(node.voltage) ? node.voltage : allowed[0];
  $("roomOptions").replaceChildren(...state.rooms.map(room => { const option = document.createElement("option"); option.value = room.name; return option; }));
  renderRooms();
}
function showRoomProperties(room) {
  togglePanel("properties",true);
  selected = null; selectedRoom = room.id; $("emptyProperties").hidden = true; propForm.hidden = true; roomForm.hidden = false;
  $("roomId").value = room.id; $("roomName").value = room.name; $("roomWidth").value = String(room.width * GRID_MM); $("roomHeight").value = String(room.height * GRID_MM); renderNodes(); renderRooms();
}
function selectNode(nodeId) {
  if (document.body.dataset.mode === "wire") {
    if (!wireStart) { wireStart = nodeId; setStatus("Connection start selected. Choose a destination in the same system class."); return; }
    if (wireStart === nodeId) { wireStart = null; setStatus("Choose a different destination."); return; }
    const from = state.nodes.find(node => node.id === wireStart), to = state.nodes.find(node => node.id === nodeId);
    if (typeOf(from.type).system !== typeOf(to.type).system) { setStatus("Blocked: power and data systems must remain separate."); return; }
    snapshot(); state.wires.push({ id: objectId("W"), from: wireStart, to: nodeId }); wireStart = null; save(); renderWires(); setStatus("Orthogonal connection added on the drafting grid."); return;
  }
  selected = nodeId; const node = state.nodes.find(item => item.id === selected); if (!node) return;
  showProperties(node); renderNodes();
}
function placeNode(point) {
  if (!pendingType) return;
  snapshot(); const item = typeOf(pendingType);
  const node = { id: objectId("B"), type: pendingType, tag: "", name: item.label, room: "", circuit: "", mountingHeight: 0, voltage: item.defaultVoltage, x: point.x, y: point.y };
  state.nodes.push(node); selected = node.id; pendingType = null; document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", "false"));
  save(); resizeDrawing(); renderNodes(); renderWires(); showProperties(node); setMode("select"); setStatus(`${node.name} placed at grid ${node.x} / ${columnLabel(node.y + 1)}.`);
}
function addRoom(start, end) {
  const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y), width = Math.abs(end.x - start.x), height = Math.abs(end.y - start.y);
  if (width < 1 || height < 1) { setStatus("Room boundary needs at least one grid square in each direction."); return; }
  snapshot(); const name = `Room ${state.rooms.length + 1}`;
  const room = { id: objectId("R"), name, x, y, width, height }; state.rooms.push(room); selectedRoom = room.id;
  save(); resizeDrawing(); renderRooms(); showRoomProperties(room); setMode("select"); setStatus(`${name} room boundary created (${width * GRID_MM} × ${height * GRID_MM} mm grid extents).`);
}
function removeSelected() {
  if (!selected) return;
  snapshot(); state.nodes = state.nodes.filter(node => node.id !== selected); state.wires = state.wires.filter(wire => wire.from !== selected && wire.to !== selected);
  selected = null; propForm.hidden = true; roomForm.hidden = true; $("emptyProperties").hidden = false; save(); renderNodes(); renderWires(); setStatus("Device and its connected routes removed.");
}
function removeSelectedRoom() {
  if (!selectedRoom) return; snapshot(); state.rooms = state.rooms.filter(room => room.id !== selectedRoom); selectedRoom = null; roomForm.hidden = true; $("emptyProperties").hidden = false; save(); renderRooms(); setStatus("Room boundary removed. Devices remain and keep their room assignment text.");
}
function undo() { if (!history.length) return announce("Nothing to undo"); future.push(clone(state)); state = history.pop(); selected = null; selectedRoom = null; renderAll(); save(); announce("Undo complete"); }
function redo() { if (!future.length) return announce("Nothing to redo"); history.push(clone(state)); state = future.pop(); selected = null; selectedRoom = null; renderAll(); save(); announce("Redo complete"); }
function renderAll() {
  resizeDrawing(); renderRooms(); renderNodes(); renderWires(); showMetadata();
  for (const [key,checked] of Object.entries(state.layers)) document.body.classList.toggle(`hide-${key}`,!checked);
  if (!selected && !selectedRoom) { propForm.hidden=true;roomForm.hidden=true;$("emptyProperties").hidden=false; }
}
function showMetadata() {
  $("projectName").value = state.metadata.name; $("documentNumber").value = state.metadata.documentNumber || ""; $("revision").value = state.metadata.revision || "A";
  $("projectDate").value = state.metadata.date; $("titleScale").value = state.metadata.scale;
  $("drafter").value = state.metadata.drafter; $("drawingScale").value = state.metadata.scale;
  for (const [name, input] of Object.entries(state.layers)) { const field = document.querySelector(`[data-layer="${name}"]`); if (field) field.checked = input; }
}
function exportProject() {
  updateMetadata(); const payload = JSON.stringify(state, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = `${state.metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "building-plan"}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce("Project JSON exported");
}
function validate() {
  updateMetadata(); const result = validateBuildingDocument(state);
  const messages = [...result.errors, ...result.warnings, ...result.notAssessed.map(item => `Not assessed: ${item}.`)];
  setStatus(`${result.errors.length ? "FAIL" : result.warnings.length ? "REVIEW" : "STRUCTURE PASS"} · ${messages.join(" ")}`);
  $("validationState").textContent = `Document checks: ${result.errors.length} errors · ${result.warnings.length} warnings · ${result.notAssessed.length} not assessed`;
  $("validationState").className = result.ok && !result.warnings.length ? "state-pass" : "state-review";
  return result;
}
function assignReferences() {
  const used = new Set(state.nodes.map(node => node.tag).filter(Boolean)); let next = 1;
  for (const node of state.nodes) {
    if (node.tag) continue;
    let candidate; do { candidate = `VP-${String(next++).padStart(3, "0")}`; } while (used.has(candidate));
    node.tag = candidate; used.add(candidate);
  }
  save(); renderNodes(); if (selected) showProperties(state.nodes.find(node => node.id === selected));
  setStatus("Unique project-local IDs assigned (VP-nnn). Configure an IEC 81346 designation profile before issuing engineering documents.");
}
function openProject(file) {
  const reader = new FileReader(); reader.onload = () => {
    try { const next = recoverBuildingDocument(JSON.parse(String(reader.result))); snapshot(); state = next; selected = null; selectedRoom = null; pendingType=null; wireStart=null; roomStart=null; setMode("select"); renderAll(); save(); fitDrawing(); setStatus("Project opened and normalized to BuildingCAD document version 2."); }
    catch (error) { setStatus(`Open failed: ${error.message}`); }
  }; reader.onerror = () => setStatus("Open failed: browser could not read this project file."); reader.readAsText(file);
}
function command(name) {
  switch (name) {
    case "new": if (confirm("Create a new drawing? The current project is saved locally.")) { snapshot(); state = createBuildingDocument(); selected = null; selectedRoom = null; pendingType = null; wireStart = null; roomStart = null; propForm.hidden = true; roomForm.hidden = true; $("emptyProperties").hidden = false; setMode("select"); renderAll(); save(); setZoom(1,0,0); scroll.scrollTo(0,0); renderRulers(); setStatus("New BuildingCAD project created."); } break;
    case "open": $("projectFile").click(); break;
    case "save": save(); setStatus("Project saved in this browser."); break;
    case "export": exportProject(); break;
    case "print": window.print(); break;
    case "undo": undo(); break;
    case "redo": redo(); break;
    case "delete": selectedRoom ? removeSelectedRoom() : removeSelected(); break;
    case "select": pendingType = null; wireStart = null; setMode("select"); setStatus("Select or drag a device; edits snap to the grid."); break;
    case "room": pendingType = null; wireStart = null; setMode("room"); setStatus("Drag across grid squares to draw a room boundary."); break;
    case "wire": pendingType = null; wireStart = null; setMode("wire"); setStatus("Select two devices of the same power/data class to connect them."); break;
    case "validate": { const result = validate(); announce(`${result.errors.length} errors · ${result.warnings.length} warnings · installation checks not assessed`); break; }
    case "references": snapshot(); assignReferences(); break;
    case "schedule": showSchedule(); break;
    case "fit": fitDrawing(); announce("Drawing fitted to view"); break;
    case "origin": scroll.scrollTo(0,0); renderRulers(); announce("Plan origin shown"); break;
    case "zoom-in": setZoom(zoom * 1.2); break;
    case "zoom-out": setZoom(zoom / 1.2); break;
    case "pan": pendingType = null; wireStart = null; setMode(document.body.dataset.mode === "pan" ? "select" : "pan"); setStatus("Drag to pan. Ctrl+wheel or pinch to zoom. Escape returns to selection."); break;
    case "grid": { const hidden = document.body.classList.toggle("hide-grid"); document.querySelector('[data-command="grid"]').setAttribute("aria-pressed",String(!hidden)); break; }
  }
  document.querySelectorAll(".cad-menubar details").forEach(details => details.open = false);
}
function showSchedule() {
  const rows = state.nodes.map(node => `${node.tag || "UNASSIGNED"}\t${typeOf(node.type).label}\t${node.name}\t${node.room || "UNASSIGNED"}\t${node.circuit || "UNASSIGNED"}\t${typeOf(node.type).system}\t${node.voltage}\t${node.mountingHeight || ""}`);
  const csv = ["Reference\tType\tName\tRoom\tCircuit\tSystem\tVoltage\tMounting height mm", ...rows].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/tab-separated-values" })); const link = document.createElement("a"); link.href = url; link.download = "building-device-schedule.tsv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); announce("Device schedule exported as TSV");
}

$("componentLibrary").replaceChildren(...TYPES.map(partButton)); renderRulers(); showMetadata();
scroll.addEventListener("scroll", renderRulers);
new ResizeObserver(renderRulers).observe(scroll);
scroll.addEventListener("wheel",event => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault(); const rect = scroll.getBoundingClientRect();
  setZoom(zoom * Math.exp(-event.deltaY * .002),event.clientX-rect.left,event.clientY-rect.top);
},{passive:false});
scroll.addEventListener("pointerdown",event => {
  if (!touches.size) suppressClick=false;
  if (event.pointerType === "touch") {
    touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (touches.size === 2) { const [a,b]=[...touches.values()]; pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom}; pan=null; dragState=null; roomStart=null; suppressClick=true; scroll.setPointerCapture(event.pointerId); event.preventDefault(); return; }
  }
  const blank = event.target === surface || event.target === roomLayer || event.target === extent;
  if (event.button === 1 || spacePan || document.body.dataset.mode === "pan" || (blank && document.body.dataset.mode === "select" && !pendingType)) {
    pan={id:event.pointerId,x:event.clientX,y:event.clientY,left:scroll.scrollLeft,top:scroll.scrollTop};
    scroll.setPointerCapture(event.pointerId); event.preventDefault();
  }
});
scroll.addEventListener("pointermove",event => {
  if (touches.has(event.pointerId)) touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if (pinch && touches.size === 2) { const [a,b]=[...touches.values()],rect=scroll.getBoundingClientRect(); setZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance),(a.x+b.x)/2-rect.left,(a.y+b.y)/2-rect.top); return; }
  if (!pan || pan.id !== event.pointerId) return;
  const dx=event.clientX-pan.x,dy=event.clientY-pan.y;
  if (Math.hypot(dx,dy)>3) suppressClick=true;
  scroll.scrollTo(Math.max(0,pan.left-dx),Math.max(0,pan.top-dy));
});
function endCameraPointer(event) { touches.delete(event.pointerId); if(touches.size<2) pinch=null; if(pan?.id===event.pointerId)pan=null; }
scroll.addEventListener("pointerup",endCameraPointer); scroll.addEventListener("pointercancel",endCameraPointer);
scroll.addEventListener("click",event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
document.querySelectorAll("[data-panel]").forEach(button=>button.addEventListener("click",()=>togglePanel(button.dataset.panel)));
document.querySelectorAll("[data-close-panel]").forEach(button=>button.addEventListener("click",()=>togglePanel(button.dataset.closePanel,false)));
for (const [name,selector] of [["library",".cad-library"],["properties",".cad-properties"]]) {
  const panel=document.querySelector(selector);
  panel.addEventListener("mouseleave",()=>togglePanel(name,false));
  panel.addEventListener("focusout",event=>{if(!panel.contains(event.relatedTarget)&&!panel.matches(":hover"))togglePanel(name,false);});
}
document.addEventListener("keyup",event=>{if(event.code==="Space")spacePan=false;});
window.addEventListener("blur",()=>{spacePan=false;pan=null;touches.clear();pinch=null;});
surface.addEventListener("click", event => { if (event.target !== surface && event.target !== roomLayer) return; const point = pointFromEvent(event); if (pendingType) placeNode(point); });
surface.addEventListener("pointerdown", event => { if (document.body.dataset.mode === "room" && (event.target === surface || event.target === roomLayer)) roomStart = pointFromEvent(event); });
surface.addEventListener("pointerup", event => { if (roomStart && document.body.dataset.mode === "room") { addRoom(roomStart, pointFromEvent(event)); roomStart = null; } });
surface.addEventListener("dragover", event => { if (event.dataTransfer.types.includes("text/voltpro-building-component")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; } });
surface.addEventListener("drop", event => { const type = event.dataTransfer.getData("text/voltpro-building-component"); if (!BUILDING_TYPES[type]) return; event.preventDefault(); chooseType(type); placeNode(pointFromEvent(event)); });
$("projectFile").addEventListener("change", event => { const file = event.target.files?.[0]; if (file) openProject(file); event.target.value = ""; });
document.querySelectorAll("[data-command]").forEach(button => button.addEventListener("click", () => command(button.dataset.command)));
document.querySelectorAll("[data-layer]").forEach(input => input.addEventListener("change", () => {
  state.layers[input.dataset.layer] = input.checked;
  document.body.classList.toggle(`hide-${input.dataset.layer}`, !input.checked); save();
}));
for (const [field, key] of [["componentTag", "tag"], ["componentName", "name"], ["componentRoom", "room"], ["componentCircuit", "circuit"], ["componentVoltage", "voltage"]]) {
  $(field).addEventListener("change", () => { const node = state.nodes.find(item => item.id === selected); if (!node) return; snapshot(); node[key] = $(field).value.trim(); save(); renderNodes(); showProperties(node); });
}
$("componentHeight").addEventListener("change", () => { const node = state.nodes.find(item => item.id === selected); if (!node) return; const height = Number($("componentHeight").value); if (!Number.isFinite(height) || height < 0 || height > 6000) { setStatus("Mounting height must be between 0 and 6000 mm."); showProperties(node); return; } snapshot(); node.mountingHeight = height; save(); });
$("deleteComponent").addEventListener("click", removeSelected);
$("deleteRoom").addEventListener("click", removeSelectedRoom);
$("roomName").addEventListener("change", () => { const room = state.rooms.find(item => item.id === selectedRoom); if (!room) return; snapshot(); room.name = $("roomName").value.trim() || room.name; save(); resizeDrawing(); renderRooms(); showRoomProperties(room); });
for (const field of ["projectName", "documentNumber", "revision", "projectDate", "titleScale", "drafter"]) $(field).addEventListener("change", save);
$("drawingScale").addEventListener("change", () => { $("titleScale").value = $("drawingScale").value; save(); });
$("savePlan").addEventListener("click", () => command("save")); $("exportPlan").addEventListener("click", () => command("export"));
document.addEventListener("keydown", event => {
  const editing = ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName);
  if(event.code === "Space" && !editing) {event.preventDefault();spacePan=true;}
  if(editing && !((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"))return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); save(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); command(event.shiftKey ? "redo" : "undo"); }
  if (event.key === "Escape") command("select");
  if ((event.key === "Delete" || event.key === "Backspace") && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) command("delete");
});
for (const [key, checked] of Object.entries(state.layers)) document.body.classList.toggle(`hide-${key}`, !checked);
renderAll();

setMode("select");

let printCamera = null;
window.addEventListener("beforeprint",()=>{
  printCamera={zoom,left:scroll.scrollLeft,top:scroll.scrollTop}; fitDrawing();
  surface.style.setProperty("--print-zoom",String(zoom));surface.style.setProperty("--print-x",-scroll.scrollLeft+"px");surface.style.setProperty("--print-y",-scroll.scrollTop+"px");
});
window.addEventListener("afterprint",()=>{
  if(!printCamera)return;setZoom(printCamera.zoom,0,0);scroll.scrollTo(printCamera.left,printCamera.top);renderRulers();printCamera=null;
});

for (const menu of document.querySelectorAll(".cad-toolbar details")) menu.addEventListener("toggle",()=>{
  if (!menu.open) return;
  for (const other of document.querySelectorAll(".cad-toolbar details[open]")) if(other!==menu&&!other.contains(menu)&&!menu.contains(other))other.open=false;
});
document.addEventListener("keydown",event=>{if(event.key==="Escape")document.querySelectorAll(".cad-toolbar details[open]").forEach(menu=>{menu.open=false;});});
