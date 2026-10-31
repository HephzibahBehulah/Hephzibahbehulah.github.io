import {installBuildingExamples} from './building-examples-ui.mjs';
import {parseBuildingBrief,generateBuildingBrief} from './building-generator.mjs';
import { installArchitectureUI } from './building-architecture-ui.mjs';
import { nearestWall,mountOnWall,rebuildRoomWalls,refreshAttachedGeometry,refreshWireRoutes,routeWireOnArchitecture,routeGeometryErrors,architectureErrors } from './building-architecture.mjs';
import { circuitAssessment } from './building-circuits.mjs';
import { assignMissingBuildingReferences } from './building-references.mjs';
import { houseDraft, checkBuildingProposal, houseReport } from './building-house.mjs';
import { CATALOG, CATEGORIES, PROFILES, SOURCES, catalogItem, catalogSearch, importManufacturerCatalog } from "./building-catalog.mjs";
import { symbolMarkup } from "./building-symbols.mjs";
import { reviewInstallation, materialSchedule, connectionLength, resistiveVoltageDrop, nodeSpecification } from "./building-tools.mjs";
import { RULER_COLUMNS, RULER_ROWS, clampZoom, drawingPoint, visibleTicks, zoomScroll, drawingExtent } from "./electrical-viewport.mjs";
import { GRID_MM, GRID_PX, columnLabel, snapGrid } from "./electrical-engine.mjs";
import { BUILDING_TYPES, createBuildingDocument, recoverBuildingDocument, routeBuildingConnection, validateBuildingDocument } from "./building-document.mjs";
import { appendBuildingAudit, loadBuildingAudit, makeBuildingAuditEntry, saveBuildingAudit, snapshotBuildingAudit } from "./building-audit.mjs";


const $ = id => document.getElementById(id);
const surface = $("planSurface"), nodeLayer = $("nodeLayer"), wireLayer = $("wireLayer"), roomLayer = $("roomLayer");
const status = $("status"), propForm = $("propertiesForm"), roomForm = $("roomPropertiesForm");
let state = loadState(), selected = null, selectedRoom = null, pendingType = null, wireStart = null, dragState = null, roomStart = null;
let drawingAudit = loadBuildingAudit(), auditBaseline = snapshotBuildingAudit(state);
let selectedWire = null, pendingCable = null;
let pendingRoutePoints=[];
let projectDirty=false;
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
  document.documentElement.style.setProperty("--model-zoom",String(zoom));
  renderRulers();
}
function setZoom(next, x = scroll.clientWidth / 2, y = scroll.clientHeight / 2) {
  next = clampZoom(next);
  const target = zoomScroll(scroll.scrollLeft, scroll.scrollTop, zoom, next, x, y);
  zoom = next; resizeDrawing(); scroll.scrollTo(target.left, target.top);
  $("zoomLevel").textContent = Math.round(zoom * 100) + "%"; surface.classList.toggle("cad-overview",zoom<.4); renderRulers();
}
function fitDrawing() {
  if (!state.nodes.length && !state.rooms.length && !state.walls.length) { setZoom(1,0,0); scroll.scrollTo(0,0); renderRulers(); return; }
  const boxes = [...state.walls.filter(w=>w.floor===state.metadata.activeFloor).flatMap(w=>[w.a,w.b]).map(p=>({x:(p.x-1)*GRID_PX-100,y:p.y*GRID_PX-100,w:200,h:200})),...state.nodes.filter(n=>(n.floor||1)===state.metadata.activeFloor&&!n.inBoard).map(n => ({x:(n.x-1)*GRID_PX-40,y:n.y*GRID_PX-30,w:100,h:70})), ...state.rooms.filter(r=>(r.floor||1)===state.metadata.activeFloor).map(r => ({x:(r.x-1)*GRID_PX,y:r.y*GRID_PX,w:r.width*GRID_PX,h:r.height*GRID_PX}))];
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
function loadState() { return createBuildingDocument(); }
function snapshot() { history.push(clone(state)); if (history.length > 80) history.shift(); future.length = 0; }
function updateMetadata() {
  state.metadata = { ...state.metadata, name: $("projectName").value.trim(), documentNumber: $("documentNumber").value.trim(), revision: $("revision").value.trim(), date: $("projectDate").value, scale: $("titleScale").value.trim(), drafter: $("drafter").value.trim() };
}
function save() {
  updateMetadata();
  const nextAuditSnapshot = snapshotBuildingAudit(state);
  const auditEntry = makeBuildingAuditEntry(auditBaseline, nextAuditSnapshot);
  if (auditEntry) { drawingAudit = appendBuildingAudit(drawingAudit, auditEntry); saveBuildingAudit(localStorage, drawingAudit); }
  auditBaseline = nextAuditSnapshot;
  projectDirty=true;
  $("commandStatus").textContent = "Unsaved project · Save / Export before refresh or closing";
}
function showDrawingAudit() {
  const dialog = document.createElement("dialog"); dialog.className = "building-audit-dialog";
  const heading = document.createElement("h2"); heading.textContent = "Drawing audit history";
  const note = document.createElement("p"); note.textContent = "Device-local edit summaries. Project contents and credentials are not stored in this history.";
  const list = document.createElement("ol");
  for (const entry of [...drawingAudit].reverse()) {
    const row = document.createElement("li"), title = document.createElement("strong"), detail = document.createElement("span"), time = document.createElement("time");
    title.textContent = entry.project; detail.textContent = entry.summary; time.dateTime = entry.at; time.textContent = new Date(entry.at).toLocaleString();
    row.append(title, detail, time); list.append(row);
  }
  if (!drawingAudit.length) { const empty = document.createElement("li"); empty.textContent = "No drawing edits recorded on this device yet."; list.append(empty); }
  const close = document.createElement("button"); close.type = "button"; close.textContent = "Close"; close.addEventListener("click", () => dialog.close());
  dialog.append(heading, note, list, close); dialog.addEventListener("close", () => dialog.remove(), { once: true }); document.body.append(dialog); dialog.showModal();
}
function typeOf(type) { return catalogItem(type,state.catalog) || {label:"Unrecognised catalogue ID: "+type,system:"unknown",defaultVoltage:"",terminals:[],category:"",spec:{}}; }
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
  const button=document.createElement("button");button.type="button";button.className="cad-part";button.draggable=true;button.dataset.type=item.id;
  const badge=document.createElement("span");badge.className="symbol";badge.innerHTML=symbolMarkup(item.symbol);
  const name=document.createElement("span");name.textContent=item.label;
  const small=document.createElement("small");small.textContent=item.manufacturer?`${item.manufacturer} · ${item.partNumber}`:`${item.kind==='route'?'Cable route':item.kind==='material'?'Material quantity':'Equipment specification'} · ${item.unit}`;
  name.append(small);button.append(badge,name);button.title=item.provenance;
  button.addEventListener("click",()=>chooseType(item.id));
  button.addEventListener("dragstart",event=>{event.dataTransfer.setData("text/voltpro-building-component",item.id);event.dataTransfer.effectAllowed="copy";});
  return button;
}
function chooseType(type) {
  const item=typeOf(type);pendingType=null;wireStart=null;roomStart=null;
  if(item.kind==='route'){pendingCable=type;setMode("wire");setStatus(`${item.label}: select source equipment, then destination equipment. These are installation cable routes, not terminal-level simulation wires.`);}
  else{pendingType=type;setMode("place");setStatus(`${item.label}: click the grid to place on Floor ${state.metadata.activeFloor}.`);}
  document.querySelectorAll(".cad-part").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.type===type)));
}
function setMode(mode) {
  document.body.dataset.mode = mode;
  for (const details of document.querySelectorAll(".cad-menubar details")) details.open = false;
  announce(`Mode: ${mode}`);
}
function renderRooms() {
  roomLayer.replaceChildren();
  for (const room of state.rooms.filter(room=>(room.floor||1)===state.metadata.activeFloor)) {
    const box = document.createElement("div"); box.className = "room-boundary"; box.dataset.id = room.id;
    box.style.left = ((room.x - 1) * GRID_PX) + "px"; box.style.top = (room.y * GRID_PX) + "px";
    box.style.width = Math.max(2, room.width * GRID_PX) + "px"; box.style.height = Math.max(2, room.height * GRID_PX) + "px";
    box.setAttribute("role", "button"); box.tabIndex = 0; box.setAttribute("aria-label", `Room ${room.name}, ${room.width * GRID_MM} by ${room.height * GRID_MM} mm`); box.setAttribute("aria-pressed", String(selectedRoom === room.id));
    const label = document.createElement("span"); label.textContent = room.name+" · "+(room.width*room.height*state.gridMillimetres**2/1e6).toFixed(1)+" m² ref."; box.append(label);
    box.addEventListener("click", event => { event.stopPropagation(); showRoomProperties(room); });
    box.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showRoomProperties(room); } });
    roomLayer.append(box);
  }
}
function renderNodes() {
  nodeLayer.replaceChildren();
  const emptyState = $("emptyPlanState");
  if (emptyState) emptyState.hidden = state.nodes.some(node => (node.floor || 1) === state.metadata.activeFloor) || state.rooms.some(room => room.floor === state.metadata.activeFloor) || state.walls.some(wall => wall.floor === state.metadata.activeFloor);
  for (const node of state.nodes.filter(node=>(node.floor||1)===state.metadata.activeFloor&&!node.inBoard)) {
    const item = typeOf(node.type), button = document.createElement("button");
    button.type = "button"; button.className = "cad-node"; button.dataset.id = node.id; button.dataset.system = item.system; button.dataset.category=item.category;
    button.style.left = ((node.x - 1) * GRID_PX) + "px"; button.style.top = (node.y * GRID_PX) + "px";
    button.setAttribute("aria-label", `${item.label}: ${node.tag || node.id}, ${node.name}, ${node.room || "room not assigned"}`);
    button.setAttribute("aria-pressed", String(selected === node.id));
    const drawingSymbol=document.createElement("span");drawingSymbol.className="cad-node-symbol";drawingSymbol.innerHTML=symbolMarkup(item.symbol);if(node.wallId)drawingSymbol.style.transform=`rotate(${(node.rotation||0)+(node.wallSide>0?180:0)}deg)`;
    const reference = document.createElement("strong"); reference.className = "node-reference"; reference.textContent = node.tag || node.id;
    const caption = document.createElement("small"); caption.textContent = node.name;
    const classLabel = document.createElement("span"); classLabel.className = "node-class"; classLabel.textContent = item.label; button.title=`${item.label} · Floor ${node.floor||1} · ${node.tag||node.id}`;
    button.append(drawingSymbol,reference, caption, classLabel);
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
      if(node.wallId){const wall=state.walls.find(w=>w.id===node.wallId);if(wall){const hit=nearestWall(state,node,node.floor,500);if(hit&&hit.wall.id===wall.id)mountOnWall(state,node,wall,Math.round(hit.offsetMM/10)*10,node.wallSide);else mountOnWall(state,node,wall,Math.max(0,Math.min(Math.hypot(wall.b.x-wall.a.x,wall.b.y-wall.a.y)*state.gridMillimetres,(wall.a.x===wall.b.x?node.y-wall.a.y:node.x-wall.a.x)*state.gridMillimetres)),node.wallSide);}}
      button.style.left = ((node.x - 1) * GRID_PX) + "px"; button.style.top = (node.y * GRID_PX) + "px";
      renderWires();
    });
    button.addEventListener("pointerup", event => {
      if (!dragState || dragState.id !== node.id) return;
      const moved = Math.hypot(event.clientX - dragState.x, event.clientY - dragState.y) >= 4;
      dragState = null; if (moved) { refreshAttachedGeometry(state);refreshWireRoutes(state);save(); resizeDrawing(); architectureUI.render(); } renderNodes(); renderWires(); if (!moved) selectNode(node.id);
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
    if(wire.internalBoardId)continue;
    const from = state.nodes.find(node => node.id === wire.from), to = state.nodes.find(node => node.id === wire.to);
    if (!from || !to) continue;
    const localFrom=(from.floor||1)===state.metadata.activeFloor,localTo=(to.floor||1)===state.metadata.activeFloor;
    if(!localFrom&&!localTo)continue;
    const crossFloor=(from.floor||1)!==(to.floor||1),local=localFrom?from:to;
    const route=wire.segments?.find(segment=>segment.floor===state.metadata.activeFloor)?.points||(crossFloor?[local,{x:local.x+3,y:local.y}]:(wire.routePoints||routeBuildingConnection(from,to)));
    const points = route.map(point => `${(point.x - 1) * GRID_PX},${point.y * GRID_PX}`).join(" ");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("class", `wire wire-${typeOf(from.type).system}${selectedWire===wire.id?" selected":""}${wire.routingError?" route-error":""}`); line.setAttribute("points", points); line.setAttribute("data-id", wire.id); line.setAttribute("tabindex","0"); line.setAttribute("role","button"); line.setAttribute("aria-label",`Cable route ${wire.id}: ${from.tag||from.name} to ${to.tag||to.name}`); line.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();showWireProperties(wire);renderWires();}}); line.addEventListener("click",event=>{event.stopPropagation();showWireProperties(wire);renderWires();});wireLayer.append(line);
    const text=document.createElementNS("http://www.w3.org/2000/svg","text");text.setAttribute("x",String((local.x-1)*GRID_PX+10));text.setAttribute("y",String(local.y*GRID_PX-10));
    const length=connectionLength(state,wire);text.textContent=crossFloor?`↕ Floor ${localFrom?to.floor||1:from.floor||1} · ${length===null?'rise needed':length.toFixed(1)+' m'}`:(wire.cableId?`${length===null?'?':length.toFixed(1)} m`:'Cable unspecified');if(!state.walls.length||selectedWire===wire.id)wireLayer.append(text);
  }
}
function showProperties(node) {
  architectureUI.clearSelection();
  selectedWire=null;hideAuxiliaryPanels();fillNodeSpecification(node);
  togglePanel("properties",true);
  selectedRoom = null; $("emptyProperties").hidden = true; roomForm.hidden = true; propForm.hidden = false;
  $("componentId").value = node.id; $("componentTag").value = node.tag; $("componentName").value = node.name;
  $("componentRoom").value = node.room; $("componentCircuit").value = node.circuit || ""; $("componentHeight").value = node.mountingHeight || "";
  const allowed = [...new Set([typeOf(node.type).defaultVoltage,"120 V AC","230 V AC","240 V AC","277 V AC","400 V AC","415 V AC","480 V AC","24 V DC","SELV / data","Protective conductor","Not energised"])];
  $("componentVoltage").replaceChildren(...allowed.map(voltage => { const option = document.createElement("option"); option.value = voltage; option.textContent = voltage; return option; }));
  $("componentVoltage").value = allowed.includes(node.voltage) ? node.voltage : allowed[0];
  $("roomOptions").replaceChildren(...state.rooms.map(room => { const option = document.createElement("option"); option.value = room.name; return option; }));
  renderRooms();
}
function showRoomProperties(room) {
  architectureUI.clearSelection();
  $("roomX").value=String((room.x-1)*state.gridMillimetres);$("roomY").value=String(room.y*state.gridMillimetres);
  selectedWire=null;hideAuxiliaryPanels();$("roomFloor").replaceChildren(...floorOptions(room.floor||1));
  togglePanel("properties",true);
  selected = null; selectedRoom = room.id; $("emptyProperties").hidden = true; propForm.hidden = true; roomForm.hidden = false;
  $("roomId").value = room.id; $("roomName").value = room.name; $("roomWidth").value = String(room.width * GRID_MM); $("roomHeight").value = String(room.height * GRID_MM); renderNodes(); renderRooms();
}
function selectNode(nodeId) {
  if (document.body.dataset.mode === "wire") {
    if (!wireStart) { pendingRoutePoints=[];wireStart = nodeId; setStatus("Connection start selected. Choose a destination in the same system class."); return; }
    if (wireStart === nodeId) { wireStart = null; setStatus("Choose a different destination."); return; }
    const from = state.nodes.find(node => node.id === wireStart), to = state.nodes.find(node => node.id === nodeId);
    if (typeOf(from.type).system !== typeOf(to.type).system) { setStatus("Blocked: power and data systems must remain separate."); return; }
    const cable=pendingCable?typeOf(pendingCable):null;
    if(cable&&cable.system!==typeOf(from.type).system){setStatus("Choose a cable from the same power/data system as the equipment.");return;}
    if(typeOf(from.type).kind==='material'||typeOf(to.type).kind==='material'){setStatus("Use equipment endpoints for cable routes; material quantities are scheduled separately.");return;}
    const wire={ id: objectId("W"), from: wireStart, to: nodeId, cableId:pendingCable||null, runs:1, extraLengthM:0, sparePercent:0, verticalRiseM:null,circuit:to.circuit||from.circuit||'',routeMode:state.walls.length?'wall':'manual'};
    if(wire.routeMode==='wall'){try{if(from.floor!==to.floor)wire.riserId=state.risers[0]?.id;routeWireOnArchitecture(state,wire);}catch(error){setStatus(error.message);return;}}
    else{const points=[{x:from.x,y:from.y}];for(const point of [...pendingRoutePoints,to]){const last=points.at(-1);if(last.x!==point.x&&last.y!==point.y)points.push({x:point.x,y:last.y});points.push({x:point.x,y:point.y});}wire.routePoints=points;}
    snapshot();state.wires.push(wire);wireStart=null;pendingRoutePoints=[]; save(); renderWires(); setStatus("Cable route added. Select its line to enter surveyed length allowances, circuit current and protection."); return;
  }
  selected = nodeId; const node = state.nodes.find(item => item.id === selected); if (!node) return;
  showProperties(node); renderNodes();
}
function placeNode(point) {
  if (!pendingType) return;
  snapshot(); const item = typeOf(pendingType);
  const node = { id: objectId("B"), type: pendingType, tag: "", name: item.label, room: "", circuit: "", mountingHeight: 0, voltage: item.defaultVoltage, x: point.x, y: point.y, floor:state.metadata.activeFloor, quantity:1, spec:{} };
  if(['sockets','switching','distribution'].includes(item.category)&&state.walls.length){const hit=nearestWall(state,node,node.floor,500);if(hit)mountOnWall(state,node,hit.wall,Math.round(hit.offsetMM/10)*10,1);}
  state.nodes.push(node); selected = node.id; pendingType = null; document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", "false"));
  save(); resizeDrawing(); renderNodes(); renderWires(); showProperties(node); setMode("select"); setStatus(`${node.name} placed at grid ${node.x} / ${columnLabel(Math.floor(node.y) + 1)}.`);
}
function addRoom(start, end) {
  const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y), width = Math.abs(end.x - start.x), height = Math.abs(end.y - start.y);
  if (width < 1 || height < 1) { setStatus("Room boundary needs at least one grid square in each direction."); return; }
  const previous=clone(state);snapshot(); const name = `Room ${state.rooms.length + 1}`;
  const room = { id: objectId("R"), name, x, y, width, height, floor:state.metadata.activeFloor }; state.rooms.push(room); selectedRoom = room.id;
  try{rebuildRoomWalls(state);}catch(error){state=previous;history.pop();setStatus(error.message);return;}save(); resizeDrawing(); renderRooms(); architectureUI.render();showRoomProperties(room); setMode("select"); setStatus(`${name} room boundary created (${width * GRID_MM} × ${height * GRID_MM} mm grid extents).`);
}
function removeSelected() {
  if(selectedWire){snapshot();state.wires=state.wires.filter(w=>w.id!==selectedWire);selectedWire=null;hideAuxiliaryPanels();save();renderWires();return;}
  if (!selected) return;
  snapshot(); state.nodes = state.nodes.filter(node => node.id !== selected); state.wires = state.wires.filter(wire => wire.from !== selected && wire.to !== selected);
  selected = null; propForm.hidden = true; roomForm.hidden = true; $("emptyProperties").hidden = false; save(); renderNodes(); renderWires(); setStatus("Device and its connected routes removed.");
}
function removeSelectedRoom() {
  if (!selectedRoom) return; snapshot(); state.rooms = state.rooms.filter(room => room.id !== selectedRoom);for(const wall of state.walls)wall.roomIds=(wall.roomIds||[]).filter(id=>id!==selectedRoom);selectedRoom = null; roomForm.hidden = true; $("emptyProperties").hidden = false; save(); renderRooms();architectureUI.render();setStatus("Room reference removed. Walls and devices are preserved.");
}
function undo() { if (!history.length) return announce("Nothing to undo"); future.push(clone(state)); state = history.pop(); selected = null; selectedRoom = null; renderAll(); save(); announce("Undo complete"); }
function redo() { if (!future.length) return announce("Nothing to redo"); history.push(clone(state)); state = future.pop(); selected = null; selectedRoom = null; renderAll(); save(); announce("Redo complete"); }
function renderAll() {
  selectedWire=null;hideAuxiliaryPanels();renderProjectFields();renderCatalog();
  resizeDrawing(); renderRooms(); renderNodes(); renderWires(); architectureUI.render();showMetadata();
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
  projectDirty=false;announce("Project JSON downloaded · canvas will start blank after refresh");
}
function validate() {
  updateMetadata();const result=validateBuildingDocument(state),review=reviewInstallation(state);
  for(const c of circuitAssessment(state))for(const issue of c.issues)review.issues.push({...issue,object:c.id,code:"circuit"});
  for(const wire of state.wires)if(wire.routingError)review.issues.push({level:"error",object:wire.id,code:"wall-route",message:wire.routingError});
  showEngineeringReview(result,review);
  $("validationState").textContent=`Document: ${result.errors.length} errors · ${review.issues.filter(i=>i.level==='error').length} engineering data errors · review pending`;
  $("validationState").className="state-review";
  setStatus("Engineering review opened in Properties. Structural checks and design-data screening do not certify an installation.");
  return result;
}
function assignReferences() {
  const result=assignMissingBuildingReferences(state,type=>typeOf(type).reference||'EQ');
  save();renderNodes();if(selected)showProperties(state.nodes.find(node=>node.id===selected));
  setStatus(`Assigned ${result.assignedEquipment} equipment references and ${result.assignedRoutes} cable route references. Verify the project's IEC 81346 or local designation convention before issue.`);
}
function openProject(file) {
  if(projectDirty&&!confirm("Replace unsaved work? Cancel and Save first to keep it."))return;
  if(file.size>10000000){setStatus("Open failed: use a JSON file smaller than 10 MB.");return;}
  const reader = new FileReader(); reader.onload = () => {
    try { const raw=JSON.parse(String(reader.result));
      if(raw.format==='voltpro.manufacturer-catalog'){
        const incoming=importManufacturerCatalog(raw);if((state.catalog?.length||0)+incoming.length>5000)throw Error('This local project supports at most 5,000 imported catalogue records. Use a connected catalogue service for larger collections.');
        const ids=new Set(incoming.map(item=>item.id));snapshot();state.catalog=[...(state.catalog||[]).filter(item=>!ids.has(item.id)),...incoming];save();renderCatalog();setStatus(`${incoming.length} manufacturer records imported; source and permission statements retained.`);return;
      }
      const next = recoverBuildingDocument(raw); snapshot(); state = next; selected = null; selectedRoom = null; pendingType=null; wireStart=null; roomStart=null; setMode("select"); renderAll(); save(); projectDirty=false; fitDrawing(); setStatus("Project opened and normalized to BuildingCAD document version 2."); }
    catch (error) { setStatus(`Open failed: ${error.message}`); }
  }; reader.onerror = () => setStatus("Open failed: browser could not read this project file."); reader.readAsText(file);
}
function command(name) {
  switch (name) {
    case "new": if (confirm("Start a blank drawing? Cancel and use Save first if you need the current work.")) { snapshot(); state = createBuildingDocument(); selected = null; selectedRoom = null; pendingType = null; wireStart = null; roomStart = null; propForm.hidden = true; roomForm.hidden = true; $("emptyProperties").hidden = false; setMode("select"); renderAll(); save(); setZoom(1,0,0); scroll.scrollTo(0,0); renderRulers(); projectDirty=false;setStatus("New blank project. Save exports a project file; refresh does not restore old drawings."); } break;
    case "open": $("projectFile").click(); break;
    case "save": exportProject(); setStatus("Project JSON downloaded. Reopen it through File / Project when needed."); break;
    case "export": exportSelectedFormat(); break;
    case "print": window.print(); break;
    case "undo": undo(); break;
    case "redo": redo(); break;
    case "delete": if(architectureUI.deleteSelected())break;selectedWire ? removeSelected() : selectedRoom ? removeSelectedRoom() : removeSelected(); break;
    case "select": pendingType = null; wireStart = null; setMode("select"); setStatus("Select or drag a device; edits snap to the grid."); break;
    case "room": pendingType = null; wireStart = null; setMode($("architectureTool").value); setStatus("Draw measured architecture. Drag for rooms, walls or dimensions; click a wall for doors/windows."); break;
    case "wire": pendingType = null; wireStart = null; setMode("wire"); setStatus("Select two devices of the same power/data class to connect them."); break;
    case "validate": { const result = validate(); announce(`${result.errors.length} errors · ${result.warnings.length} warnings · installation checks not assessed`); break; }
    case "references": snapshot(); assignReferences(); break;
    case "schedule": showSchedule(); break;
    case "history": showDrawingAudit(); break;
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
  const rows=materialSchedule(state),clean=value=>String(value??'').replace(/[\t\r\n]/g,' ').replace(/^[=+@-]/,"'$&");
  const columns=['floor','category','name','quantity','unit','manufacturer','partNumber','source','basis','unmeasured','spec'];
  const csv=[columns.join('\t'),...rows.map(row=>columns.map(key=>clean(typeof row[key]==='number'?Math.round(row[key]*1000)/1000:row[key])).join('\t'))].join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/tab-separated-values'}));const link=document.createElement('a');link.href=url;link.download='electrical-material-and-cable-schedule.tsv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  announce(`Material schedule exported · ${rows.length} grouped lines · ${state.metadata.floors} storeys`);
}

const architectureUI=installArchitectureUI({getDocument:()=>state,getZoom:()=>zoom,id:objectId,status:setStatus,setMode,addRoom,
  clearSelection(){selected=null;selectedRoom=null;selectedWire=null;},hidePanels(){propForm.hidden=true;roomForm.hidden=true;hideAuxiliaryPanels();},openProperties(){togglePanel('properties',true);},selectNode(id){setMode('select');selectNode(id);},
  commit(fn){const before=clone(state),nodeId=selected,wireId=selectedWire,roomId=selectedRoom;try{fn(state);const errors=architectureErrors(state);if(errors.length)throw Error(errors.join(' '));for(const wire of state.wires){const issues=routeGeometryErrors(state,wire);if(issues.length&&!wire.routingError)throw Error(issues.join(' '));}history.push(before);if(history.length>80)history.shift();future.length=0;save();renderAll();if(nodeId&&state.nodes.some(n=>n.id===nodeId)){selected=nodeId;showProperties(state.nodes.find(n=>n.id===nodeId));}else if(wireId&&state.wires.some(w=>w.id===wireId))showWireProperties(state.wires.find(w=>w.id===wireId));else if(roomId&&state.rooms.some(r=>r.id===roomId))showRoomProperties(state.rooms.find(r=>r.id===roomId));return true;}catch(error){state=before;setStatus(error.message);renderAll();return false;}}
});
installBuildingExamples({status:setStatus,allowReplace(){return !projectDirty||confirm('Replace unsaved work with the selected example? Cancel and Save first to keep it.');},load(doc){snapshot();state=doc;selected=null;selectedRoom=null;selectedWire=null;pendingType=null;wireStart=null;roomStart=null;setMode('select');renderAll();save();fitDrawing();}});
initialiseCatalogue(); renderRulers(); showMetadata();
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
function openExampleLibrary() {
  const projectMenu = [...document.querySelectorAll(".cad-menubar details")].find(details => details.querySelector("#buildingExample"));
  if (!projectMenu) return setStatus("Example project library is unavailable. Refresh the Electrical workspace and try again.");
  document.querySelectorAll(".cad-menubar details").forEach(details => { details.open = details === projectMenu; });
  $("exampleSearch").focus({preventScroll:true});
  setStatus("Choose a regional building study from the Project menu. The selected example opens on the canvas.");
}
$("showExamples").addEventListener("click", openExampleLibrary);
$("emptyLoadExample").addEventListener("click", openExampleLibrary);
for (const [name,selector] of [["library",".cad-library"],["properties",".cad-properties"]]) {
  const panel=document.querySelector(selector);
  panel.addEventListener("mouseleave",()=>togglePanel(name,false));
  panel.addEventListener("focusout",event=>{if(!panel.contains(event.relatedTarget)&&!panel.matches(":hover"))togglePanel(name,false);});
}
document.addEventListener("keyup",event=>{if(event.code==="Space")spacePan=false;});
window.addEventListener("blur",()=>{spacePan=false;pan=null;touches.clear();pinch=null;});
surface.addEventListener("click", event => { if (event.target !== surface && event.target !== roomLayer) return; const point = pointFromEvent(event); if (pendingType) placeNode(point);else if(document.body.dataset.mode==='wire'&&wireStart){pendingRoutePoints.push(point);setStatus("Manual waypoint recorded. Select destination equipment to complete the route.");} });


surface.addEventListener("dragover", event => { if (event.dataTransfer.types.includes("text/voltpro-building-component")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; } });
surface.addEventListener("drop", event => { const type = event.dataTransfer.getData("text/voltpro-building-component"); if (!catalogItem(type,state.catalog)) return; event.preventDefault(); chooseType(type); if(pendingType)placeNode(pointFromEvent(event)); });
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
$("roomName").addEventListener("change", () => { const room = state.rooms.find(item => item.id === selectedRoom); if (!room) return; snapshot(); room.name = $("roomName").value.trim() || room.name; try{rebuildRoomWalls(state);}catch(error){state=previous;history.pop();setStatus(error.message);return;}save(); resizeDrawing(); renderRooms(); architectureUI.render();showRoomProperties(room); });
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

function option(value,label,selected=false){const item=document.createElement('option');item.value=String(value);item.textContent=label;item.selected=selected;return item;}
function floorOptions(current){return Array.from({length:state.metadata.floors},(_,i)=>option(i+1,`Floor ${i+1}`,i+1===current));}
function initialiseCatalogue(){
  $('catalogCategory').replaceChildren(option('','All installation categories'),...CATEGORIES.map(c=>option(c.id,c.label)));
  for(const id of ['catalogSearch','catalogCategory'])$(id).addEventListener(id==='catalogSearch'?'input':'change',()=>{$('catalogPage').value='0';renderCatalog();});
  $('catalogPage').addEventListener('change',renderCatalog);
  $('buildingProfile').addEventListener('change',()=>{snapshot();state.metadata.profile=$('buildingProfile').value;save();renderCatalog();renderProjectFields();setStatus("Jurisdiction changed. Existing equipment is preserved; review its regional suitability and local approvals.");});
  $('buildingFloors').addEventListener('change',()=>{const n=Number($('buildingFloors').value);if(!Number.isInteger(n)||n<1||n>300){setStatus('Storey count must be an integer from 1 to 300.');renderProjectFields();return;}snapshot();state.metadata.floors=n;state.metadata.activeFloor=Math.min(n,state.metadata.activeFloor);save();renderAll();});
  $('activeFloor').addEventListener('change',()=>{state.metadata.activeFloor=Number($('activeFloor').value);selected=null;selectedRoom=null;selectedWire=null;save();renderAll();setStatus(`Floor ${state.metadata.activeFloor} of ${state.metadata.floors}${wireStart?' · choose destination equipment to finish the cross-floor cable route':''}.`);});
  for(const [id,key,numeric] of [['componentFloor','floor',true],['componentQuantity','quantity',true],['componentBoard','boardId',false],['componentProtection','protectiveDeviceId',false]])$(id).addEventListener('change',()=>{
    const node=state.nodes.find(n=>n.id===selected);if(!node)return;const value=numeric?Number($(id).value):$(id).value;
    if(numeric&&(!Number.isFinite(value)||value<=0)){setStatus('Enter a positive quantity or valid floor.');fillNodeSpecification(node);return;}
    snapshot();node[key]=value;if(key==='boardId'&&typeOf(node.type).category==='protection'){node.inBoard=Boolean(value);if(value){const board=state.nodes.find(n=>n.id===value);if(board){node.x=board.x;node.y=board.y;node.floor=board.floor;}}}refreshAttachedGeometry(state);refreshWireRoutes(state);save();renderRooms();renderNodes();renderWires();fillNodeSpecification(node);
  });
  $('roomFloor').addEventListener('change',()=>{const room=state.rooms.find(r=>r.id===selectedRoom);if(!room)return;snapshot();room.floor=Number($('roomFloor').value);save();renderRooms();});
}
function renderProjectFields(){
  $('buildingProfile').replaceChildren(...Object.entries(PROFILES).map(([id,profile])=>option(id,profile.label,id===state.metadata.profile)));
  $('buildingFloors').value=String(state.metadata.floors);
  $('activeFloor').replaceChildren(...floorOptions(state.metadata.activeFloor));
  const profile=PROFILES[state.metadata.profile]||PROFILES.DE;
  $('profileGuidance').textContent=profile.note;
  $('profileSources').replaceChildren(...profile.sources.map(key=>{const a=document.createElement('a');a.href=SOURCES[key].url;a.textContent=SOURCES[key].label;a.target='_blank';a.rel='noopener noreferrer';return a;}));
}
function renderCatalog(){
  const filter={query:$('catalogSearch').value,category:$('catalogCategory').value,profile:state.metadata.profile,custom:state.catalog||[],limit:60};
  const offset=Number($('catalogPage').value)||0,result=catalogSearch({...filter,offset});
  $('catalogPage').replaceChildren(...Array.from({length:Math.max(1,Math.ceil(result.total/60))},(_,i)=>option(i*60,`${i+1} / ${Math.max(1,Math.ceil(result.total/60))}`,i*60===offset)));
  const page=catalogSearch({...filter,offset:Number($('catalogPage').value)||0});
  $('catalogCount').textContent=`${page.total} matching records · ${CATALOG.length} built-in specifications (${CATALOG.filter(i=>i.manufacturer).length} manufacturer-referenced) · ${(state.catalog||[]).length} imported. Counts are not unique manufacturer products.`;
  const groups=CATEGORIES.map(category=>{const items=page.items.filter(i=>i.category===category.id);if(!items.length)return null;const details=document.createElement('details');details.className='cad-catalog-group';details.open=true;const heading=document.createElement('summary');heading.textContent=category.label;const list=document.createElement('div');list.append(...items.map(partButton));details.append(heading,list);return details;}).filter(Boolean);
  if(!groups.length){const empty=document.createElement('p');empty.textContent='No matches in this jurisdiction. Choose a category or change the project jurisdiction in Project.';groups.push(empty);}
  $('componentLibrary').replaceChildren(...groups);
}
function hideAuxiliaryPanels(){ $('wirePropertiesForm').hidden=true;$('engineeringReport').hidden=true;$('architectureProperties').hidden=true; }
function fillNodeSpecification(node){
  const item=typeOf(node.type),identity=$('componentIdentity');identity.replaceChildren();
  const heading=document.createElement('strong');heading.textContent=item.label;identity.append(heading);
  const source=document.createElement('p');source.textContent=item.provenance||'Specification record';identity.append(source);
  if(item.sourceUrl){const link=document.createElement('a');link.href=item.sourceUrl;link.textContent=`${item.manufacturer||'Source'} · ${item.partNumber||'reference'}`;link.target='_blank';link.rel='noopener noreferrer';identity.append(link);}
  const terminals=document.createElement('p');terminals.className='cad-terminal-list';terminals.textContent=`Functional connection points (verify product terminals): ${(item.terminals||[]).join(' · ')||'Material / route; no electrical terminals'}`;identity.append(terminals);
  $('componentFloor').replaceChildren(...floorOptions(node.floor||1));$('componentQuantity').value=String(node.quantity||1);$('quantityLabel').firstChild.textContent=`Quantity (${item.unit})`;
  const boards=state.nodes.filter(n=>n.id!==node.id&&typeOf(n.type).category==='distribution');
  $('componentBoard').replaceChildren(option('','Not assigned'),...boards.map(n=>option(n.id,`${n.tag||n.id} · Floor ${n.floor||1} · ${n.name}`,node.boardId===n.id)));
  const protections=state.nodes.filter(n=>n.id!==node.id&&['breaker','rcd','rcbo'].includes(typeOf(n.type).symbol));
  $('componentProtection').replaceChildren(option('','Not assigned'),...protections.map(n=>option(n.id,`${n.tag||n.id} · ${typeOf(n.type).label}`,node.protectiveDeviceId===n.id)));
  const spec=nodeSpecification(node,state),fields=$('componentSpecification');fields.replaceChildren();
  const specLabels={ratingA:'Rated current (A)',breakingKA:'Breaking capacity (kA)',residualMA:'Residual current (mA)',poles:'Poles',curve:'Trip curve',rcdType:'RCD type',modules:'Board module capacity',widthMM:'Width (mm)',heightMM:'Height (mm)',diameterMM:'Nominal diameter (mm)',ip:'IP protection class',loadW:'Nameplate input power (W)',standardReference:'Product standard reference'};
  for(const [key,label] of Object.entries(specLabels)){
    if(!(key in spec)&&key!=='loadW')continue;
    if(key==='loadW'&&!['lighting','ventilation','loads','energy','sockets'].includes(item.category))continue;
    const row=document.createElement('label');row.textContent=label;
    const input=document.createElement('input');input.value=spec[key]??'';input.readOnly=item.spec?.[key]!==null&&item.spec?.[key]!==undefined;
    if(['ratingA','breakingKA','residualMA','poles','modules','widthMM','heightMM','diameterMM','loadW'].includes(key)){input.type='number';input.min='0';input.step='any';}
    input.addEventListener('change',()=>{const value=input.type==='number'?Number(input.value):input.value;if(input.value!==''&&typeof value==='number'&&(!Number.isFinite(value)||value<0)){setStatus('Enter a non-negative finite specification value.');return;}snapshot();node.spec={...node.spec,[key]:input.value===''?null:value};save();});row.append(input);fields.append(row);
  }
  architectureUI.addMountFields(node,fields);
  const allocation=document.createElement('label');allocation.textContent='Verified DIN modules used in assigned board';const modules=document.createElement('input');modules.type='number';modules.min='0';modules.step='1';modules.value=node.spec?.modulesUsed??'';modules.addEventListener('change',()=>{const value=modules.value===''?null:Number(modules.value);if(value!==null&&(!Number.isInteger(value)||value<0))return;snapshot();node.spec={...node.spec,modulesUsed:value};save();});allocation.append(modules);fields.append(allocation);
}
function showWireProperties(wire){
  selectedWire=wire.id;selected=null;selectedRoom=null;hideAuxiliaryPanels();propForm.hidden=true;roomForm.hidden=true;$('emptyProperties').hidden=true;togglePanel('properties',true);
  const form=$('wirePropertiesForm');form.hidden=false;form.replaceChildren();
  const heading=document.createElement('h3');heading.textContent=`Cable route ${wire.id}`;form.append(heading);
  const from=state.nodes.find(n=>n.id===wire.from),to=state.nodes.find(n=>n.id===wire.to),info=document.createElement('p');info.textContent=`${from?.tag||from?.name} (Floor ${from?.floor||1}) → ${to?.tag||to?.name} (Floor ${to?.floor||1}). Surveyed route quantities; no terminal-level circuit simulation.`;form.append(info);
  const fields=[['cableId','Cable / wire specification','cable'],['protectiveDeviceId','Overcurrent protective device','protection'],['circuit','Circuit identifier','text'],['pePresent','Protective-earth conductor provision','pe'],['runs','Cable / conductor runs','number'],['verticalRiseM','Surveyed vertical rise (m)','number'],['extraLengthM','Additional routing allowance (m)','number'],['sparePercent','Additional spare (%)','number'],['designCurrentA','Design current (A)','number'],['verifiedAmpacityA','Verified installed ampacity (A)','number'],['prospectiveFaultKA','Prospective fault current (kA)','number'],['circuitVoltage','Circuit voltage (V)','number'],['phases','Calculation phase arrangement','phases']];
  for(const [key,label,kind] of fields){const row=document.createElement('label');row.textContent=label;let input;
    if(['cable','protection','phases','pe'].includes(kind)){input=document.createElement('select');input.append(option('','Not specified'));
      const items=kind==='cable'?[...CATALOG,...(state.catalog||[])].filter(i=>i.kind==='route'&&i.system===typeOf(from?.type).system).map(i=>({value:i.id,label:i.label})):kind==='protection'?state.nodes.filter(n=>['breaker','rcbo'].includes(typeOf(n.type).symbol)).map(n=>({value:n.id,label:`${n.tag||n.id} · ${typeOf(n.type).label}`})):kind==='pe'?[{value:'true',label:'PE included in this cable route'},{value:'false',label:'PE absent — design error'}]:[{value:'1-phase',label:'Single phase · 2-wire loop'},{value:'3-phase',label:'Balanced three phase'}];
      input.append(...items.map(i=>option(i.value,i.label,i.value===String(wire[key]))));
    }else{input=document.createElement('input');input.type=kind;if(kind==='number'){input.min='0';input.step=key==='runs'?'1':'any';}input.value=wire[key]??'';}
    input.dataset.wireField=key;input.addEventListener('change',()=>{let value=kind==='number'?(input.value===''?null:Number(input.value)):kind==='pe'?(input.value===''?null:input.value==='true'):input.value;if(kind==='number'&&value!==null&&(!Number.isFinite(value)||value<0||(key==='runs'&&(!Number.isInteger(value)||value<1)))){setStatus('Enter a valid non-negative value; cable/conductor runs must be positive integers.');return;}snapshot();wire[key]=value;save();renderWires();renderWireEstimate(wire);});row.append(input);form.append(row);
  }
  const estimate=document.createElement('p');estimate.id='wireEstimate';form.append(estimate);renderWireEstimate(wire);architectureUI.addRouteFields(wire,form);
}
function renderWireEstimate(wire){const length=connectionLength(state,wire),estimate=resistiveVoltageDrop(state,wire);$('wireEstimate').textContent=`Route length: ${length===null?'vertical rise unresolved':length.toFixed(2)+' m'}${estimate?` · resistance-only drop ${estimate.volts.toFixed(2)} V (${estimate.percent.toFixed(2)}%). ${estimate.note}`:' · voltage-drop estimate needs metric copper cross-section, current, voltage and phase arrangement.'}`;}
function showEngineeringReview(structure,review){
  selectedWire=null;selected=null;selectedRoom=null;propForm.hidden=true;roomForm.hidden=true;hideAuxiliaryPanels();$('emptyProperties').hidden=true;togglePanel('properties',true);
  const report=$('engineeringReport');report.hidden=false;report.replaceChildren();
  const title=document.createElement('h3');title.textContent=`Engineering data review · ${review.profile.label}`;report.append(title);
  const intro=document.createElement('p');intro.textContent=`${state.metadata.floors} storeys · ${state.nodes.length} equipment/material items · ${state.wires.length} routes. No construction approval or installation compliance is implied.`;report.append(intro);
  for(const [heading,items] of [['Document checks',[...structure.errors.map(message=>({level:'error',message})),...structure.warnings.map(message=>({level:'review',message}))]],['Design-data screening',review.issues]]){const section=document.createElement('details');section.open=true;const summary=document.createElement('summary');summary.textContent=`${heading} · ${items.length}`;section.append(summary);const list=document.createElement('ul');for(const item of items.slice(0,200)){const li=document.createElement('li');li.dataset.level=item.level;li.textContent=`${item.object?item.object+': ':''}${item.message}`;list.append(li);}section.append(list);if(items.length>200){const more=document.createElement('p');more.textContent=`Showing 200 of ${items.length} entries. File → Export format → Full engineering review downloads all entries.`;section.append(more);}report.append(section);}
  const section=document.createElement('details');section.open=true;const summary=document.createElement('summary');summary.textContent='Circuits / connected load';section.append(summary);const table=document.createElement('table');for(const circuit of review.circuits.slice(0,200)){const row=document.createElement('tr');for(const text of [`F${circuit.floor} · ${circuit.id}`,`${circuit.devices} items`,`${circuit.connectedW} W entered${circuit.unknownLoads?' + '+circuit.unknownLoads+' unresolved loads':''}`]){const td=document.createElement('td');td.textContent=text;row.append(td);}table.append(row);}section.append(table);report.append(section);
  const remaining=document.createElement('p');remaining.textContent='Not assessed: '+review.notAssessed.join('; ')+'.';report.append(remaining);
}

function warnUnsaved(event){if(!projectDirty)return;event.preventDefault();event.returnValue='';}
window.addEventListener('beforeunload',warnUnsaved);
document.addEventListener('input',event=>{if(event.target.closest('.title-block,#propertiesForm,#roomPropertiesForm,#wirePropertiesForm,#architectureProperties'))projectDirty=true;});
window.VoltProBuildingAI={
  context(){return 'Electrical Building only. Generate editable voltpro.buildingcad version 2 JSON with metadata {name,date,scale,drafter,profile,floors,activeFloor}, units:mm,gridMillimetres:200,layers:{architecture:true,power:true,data:true},catalog:[],rooms:[{id,name,x,y,width,height,floor}],nodes:[{id,type,tag,name,room,circuit,voltage,mountingHeight,x,y,floor,quantity,spec,boardId,protectiveDeviceId}],wires:[{id,from,to,cableId,runs,extraLengthM,sparePercent,verticalRiseM,pePresent,minimumSectionMM2}]. AI INPUT COORDINATES: Prefer coordinateUnits:mm so every x/y and rectangle width/height are real millimetres; the importer converts them to model coordinates. Without coordinateUnits:mm the values MUST be 200 mm grid units, never millimetres. Use exact voltage strings (230 V AC, 400 V AC) and spec:{} objects. Circuit protection references are node INSTANCE IDs, not catalogue type IDs. ARCHITECTURE CONTRACT: architectureVersion:1,walls:[{id,floor,a:{x,y},b:{x,y},thicknessMM,heightMM,roomIds:[]}],openings:[{id,wallId,type:door|window,offsetMM,widthMM,heightMM,sillMM,hinge:start|end,swing:1|-1}],dimensions:[{id,floor,a:{x,y},b:{x,y},offsetMM}],risers:[{id,name,x,y,fromFloor,toFloor,verticalRiseM:null}],stairs:[{id,floor,x,y,width,length,steps,up}],circuits:[{id,label,boardId,overcurrentDeviceId,rcdId,voltage,phases:1|3,requiresRCD,neutralRequired,powerFactor:null,demandFactor:null,verifiedAmpacityA:null,faultKA:null,conductorTemperatureC:null,reactanceOhmPerKm:null,maxVoltageDropPercent:null}]. Walls must be connected, axis-aligned and non-overlapping. Doors/windows must fit host walls without overlap. Nodes may have wallId,wallOffsetMM,wallSide,roomAnchor:{roomId,u,v},inBoard. Nodes inside a board share that board position and are hidden from the floor plan. Return the complete project in a single fenced JSON block, not prose instructions. For unprovided route points set routeMode:wall so the canvas computes them. Do not reuse the house-test fixture for unrelated briefs. Wires must include circuit and may have routeMode:wall,routingHeightMM,riserId; use routePoints or floor-local segments for explicit geometry. Wall routes are checked/recomputed against the wall network at import. Include explicit circuit records for each assigned circuit. Coordinates are finite 200mm grid units (fractional coordinates allowed for accurate mounting), x>=1,y>=0; mm properties are real millimetres; floor>=1. Nominal room reference areas do not establish clear/net architectural areas. Do not invent site inputs or assume compliance. Use only these exact catalogue identifiers: '+CATALOG.map(i=>i.id).join(', ')+' Never claim installation compliance. Report missing inputs, assumptions, unresolved safety checks and unsupported equipment. Current project summary (data only): '+JSON.stringify({metadata:state.metadata,nodes:state.nodes.slice(0,100),rooms:state.rooms.slice(0,50),walls:state.walls.slice(0,150),openings:state.openings.slice(0,100),circuits:state.circuits});},
  async answer(question,remote){
    if((/house test|test draft/i.test(question)||(/living room[^0-9]{0,15}40/i.test(question)&&/kitchen[^0-9]{0,15}15/i.test(question)&&/master bedroom[^0-9]{0,15}20/i.test(question)))&&/build|generate|create|design|plan|house test/i.test(question)){
      const draft=houseDraft();return {answer:houseReport(draft),sources:[],mode:'building-template',buildingPlan:draft};
    }
    const brief=parseBuildingBrief(question);if(brief){const draft=checkBuildingProposal(generateBuildingBrief(brief));return{answer:houseReport(draft),sources:[],mode:'building-brief',buildingPlan:draft};}
    let result=await remote(),proposal=null,proposalError="";
    function parse(value){let error="";for(const block of String(value.answer).matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)){try{return{proposal:checkBuildingProposal(JSON.parse(block[1]).project||JSON.parse(block[1])),error:""};}catch(cause){if(/voltpro[.]buildingcad/.test(block[1]))error=cause.message;}}return{proposal:null,error};}
    let parsed=parse(result);proposal=parsed.proposal;proposalError=parsed.error;
    if(proposalError&&!proposal&&result.mode==='ai'){const repaired=await remote('The first generated project was rejected by the importer: '+proposalError+'. Correct the COMPLETE project once. Use coordinateUnits:"mm" for every x/y, room width/height, stair length/width and route point; all such values will be converted to model grid. Keep opening offsets, thickness and mounting dimensions in mm. Use exact voltage strings such as "230 V AC". spec must be an object, not a catalogue ID. Place real breaker/RCD nodes with unique IDs and reference those node IDs in circuit overcurrentDeviceId/rcdId; never reference a catalogue type as an instance ID. Every building wire needs its circuit ID. Use actual wall mounts for switches and sockets, not detached coordinates. Return one complete fenced JSON object. Previous proposal: '+String(result.answer).slice(0,35000));parsed=parse(repaired);if(parsed.proposal){result=repaired;proposal=parsed.proposal;proposalError="";}else proposalError=parsed.error||proposalError;}
    return {...result,answer:String(result.answer).replace(/System Compliant with DIN VDE 0100\.?/gi,'Installation compliance has not been established.')+(proposalError&&!proposal?'\n\nPROJECT IMPORT REJECTED: '+proposalError+' Ask for a corrected measured architectural project.':''),...(proposal?{buildingPlan:proposal}:{}),plan:undefined};
  },
  renderActions(host,project){const button=host.ownerDocument.createElement('button');button.type='button';button.className='vp-assistant-action';button.textContent='Import draft to Electrical canvas';button.addEventListener('click',()=>{try{const next=checkBuildingProposal(project);if(projectDirty&&!confirm('Replace unsaved work? Cancel and Save first to keep it.'))return;snapshot();state=next;selected=null;selectedRoom=null;selectedWire=null;renderAll();save();fitDrawing();validate();button.textContent='Draft imported · review unresolved checks';}catch(error){button.textContent='Import rejected: '+error.message;}});host.append(button);},
  isDirty(){return projectDirty;}
};

try {
 if(window.parent!==window){
  const host=window.parent,doc=host.document;
  if(!doc.getElementById('vpElectricalAssistantOwnership')){const style=doc.createElement('style');style.id='vpElectricalAssistantOwnership';style.textContent='html.vp-electrical-template #vpBotLauncher,html.vp-electrical-template #vpBotWindow{display:none!important}';doc.head.append(style);}
  if(!host.__vpElectricalUnloadGuard){host.__vpElectricalUnloadGuard=event=>{try{for(const frame of doc.querySelectorAll('iframe[src*="electrical-canvas.html"]'))if(frame.contentWindow?.VoltProBuildingAI?.isDirty()){event.preventDefault();event.returnValue='';break;}}catch{}};host.addEventListener('beforeunload',host.__vpElectricalUnloadGuard);}
 }
}catch{}

function exportSelectedFormat(){const format=$('drawingExportFormat').value;if(format==='json'){exportProject();return;}try{let content,type,name;if(format==='svg'){content=architectureUI.exportSVG();type='image/svg+xml';name='electrical-floor-'+state.metadata.activeFloor+'.svg';}else if(format==='review'){const structural=validateBuildingDocument(state),review=reviewInstallation(state),circuits=circuitAssessment(state);content=[state.metadata.name,'PRELIMINARY DESIGN REVIEW — no installation compliance certificate',...(state.designNotes||[]),...structural.errors.map(x=>'STRUCTURE ERROR: '+x),...review.issues.map(i=>`${i.level.toUpperCase()} ${i.object}: ${i.message}`),...circuits.flatMap(c=>c.issues.map(i=>`${i.level.toUpperCase()} ${c.id}: ${i.message}`))].join('\n');type='text/plain';name='electrical-full-engineering-review.txt';}else{const rows=architectureUI.circuitRows(),keys=['circuit','label','board','protection','rcd','cableTags','knownConnectedW','unresolvedLoads','designCurrentA','routeCount','reviewCount'];const clean=value=>String(value??'').replace(/[\t\r\n]/g,' ').replace(/^[=+@-]/,"'$&");content=[keys.join('\t'),...rows.map(r=>keys.map(k=>clean(r[k])).join('\t'))].join('\n');type='text/tab-separated-values';name='electrical-board-circuit-schedule.tsv';}const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Drawing/schedule exported. Save project JSON separately to preserve editability.');}catch(error){setStatus(error.message);}}
for(const [id,key]of [['roomX','x'],['roomY','y'],['roomWidth','width'],['roomHeight','height']])$(id).addEventListener('change',()=>{const value=Number($(id).value);if(!Number.isFinite(value)||value<0)return;architectureUI.clearSelection();const before=clone(state);try{const room=state.rooms.find(r=>r.id===selectedRoom);if(!room)return;room[key]=key==='x'?1+value/state.gridMillimetres:value/state.gridMillimetres;rebuildRoomWalls(state);refreshAttachedGeometry(state);refreshWireRoutes(state);if(architectureErrors(state).length)throw Error(architectureErrors(state).join(' '));history.push(before);future.length=0;save();renderAll();showRoomProperties(room);}catch(error){state=before;renderAll();setStatus(error.message);}});
