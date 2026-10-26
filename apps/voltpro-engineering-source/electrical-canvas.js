import { CATALOG, CATEGORIES, PROFILES, SOURCES, catalogItem, catalogSearch, importManufacturerCatalog } from "./building-catalog.mjs";
import { symbolMarkup } from "./building-symbols.mjs";
import { reviewInstallation, materialSchedule, connectionLength, resistiveVoltageDrop, nodeSpecification } from "./building-tools.mjs";
import { RULER_COLUMNS, RULER_ROWS, clampZoom, drawingPoint, visibleTicks, zoomScroll, drawingExtent } from "./electrical-viewport.mjs";
import { GRID_MM, GRID_PX, columnLabel, snapGrid } from "./electrical-engine.mjs";
import { BUILDING_TYPES, createBuildingDocument, recoverBuildingDocument, routeBuildingConnection, validateBuildingDocument } from "./building-document.mjs";

const STORE = "voltpro-buildingcad-v2", LEGACY_STORE = "voltpro-buildingcad-v1";

const $ = id => document.getElementById(id);
const surface = $("planSurface"), nodeLayer = $("nodeLayer"), wireLayer = $("wireLayer"), roomLayer = $("roomLayer");
const status = $("status"), propForm = $("propertiesForm"), roomForm = $("roomPropertiesForm");
let state = loadState(), selected = null, selectedRoom = null, pendingType = null, wireStart = null, dragState = null, roomStart = null;
let selectedWire = null, pendingCable = null;
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
    const label = document.createElement("span"); label.textContent = room.name; box.append(label);
    box.addEventListener("click", event => { event.stopPropagation(); showRoomProperties(room); });
    box.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showRoomProperties(room); } });
    roomLayer.append(box);
  }
}
function renderNodes() {
  nodeLayer.replaceChildren();
  for (const node of state.nodes.filter(node=>(node.floor||1)===state.metadata.activeFloor)) {
    const item = typeOf(node.type), button = document.createElement("button");
    button.type = "button"; button.className = "cad-node"; button.dataset.id = node.id; button.dataset.system = item.system; button.dataset.category=item.category;
    button.style.left = ((node.x - 1) * GRID_PX) + "px"; button.style.top = (node.y * GRID_PX) + "px";
    button.setAttribute("aria-label", `${item.label}: ${node.tag || node.id}, ${node.name}, ${node.room || "room not assigned"}`);
    button.setAttribute("aria-pressed", String(selected === node.id));
    const drawingSymbol=document.createElement("span");drawingSymbol.className="cad-node-symbol";drawingSymbol.innerHTML=symbolMarkup(item.symbol);
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
    const localFrom=(from.floor||1)===state.metadata.activeFloor,localTo=(to.floor||1)===state.metadata.activeFloor;
    if(!localFrom&&!localTo)continue;
    const crossFloor=(from.floor||1)!==(to.floor||1),local=localFrom?from:to;
    const route=crossFloor?[local,{x:local.x+3,y:local.y}]:routeBuildingConnection(from,to);
    const points = route.map(point => `${(point.x - 1) * GRID_PX},${point.y * GRID_PX}`).join(" ");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("class", `wire wire-${typeOf(from.type).system}${selectedWire===wire.id?" selected":""}`); line.setAttribute("points", points); line.setAttribute("data-id", wire.id); line.setAttribute("tabindex","0"); line.setAttribute("role","button"); line.setAttribute("aria-label",`Cable route ${wire.id}: ${from.tag||from.name} to ${to.tag||to.name}`); line.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();showWireProperties(wire);renderWires();}}); line.addEventListener("click",event=>{event.stopPropagation();showWireProperties(wire);renderWires();});wireLayer.append(line);
    const text=document.createElementNS("http://www.w3.org/2000/svg","text");text.setAttribute("x",String((local.x-1)*GRID_PX+10));text.setAttribute("y",String(local.y*GRID_PX-10));
    const length=connectionLength(state,wire);text.textContent=crossFloor?`↕ Floor ${localFrom?to.floor||1:from.floor||1} · ${length===null?'rise needed':length.toFixed(1)+' m'}`:(wire.cableId?`${length===null?'?':length.toFixed(1)} m`:'Cable unspecified');wireLayer.append(text);
  }
}
function showProperties(node) {
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
  selectedWire=null;hideAuxiliaryPanels();$("roomFloor").replaceChildren(...floorOptions(room.floor||1));
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
    const cable=pendingCable?typeOf(pendingCable):null;
    if(cable&&cable.system!==typeOf(from.type).system){setStatus("Choose a cable from the same power/data system as the equipment.");return;}
    if(typeOf(from.type).kind==='material'||typeOf(to.type).kind==='material'){setStatus("Use equipment endpoints for cable routes; material quantities are scheduled separately.");return;}
    snapshot(); state.wires.push({ id: objectId("W"), from: wireStart, to: nodeId, cableId:pendingCable||null, runs:1, extraLengthM:0, sparePercent:0, verticalRiseM:null }); wireStart = null; save(); renderWires(); setStatus("Cable route added. Select its line to enter surveyed length allowances, circuit current and protection."); return;
  }
  selected = nodeId; const node = state.nodes.find(item => item.id === selected); if (!node) return;
  showProperties(node); renderNodes();
}
function placeNode(point) {
  if (!pendingType) return;
  snapshot(); const item = typeOf(pendingType);
  const node = { id: objectId("B"), type: pendingType, tag: "", name: item.label, room: "", circuit: "", mountingHeight: 0, voltage: item.defaultVoltage, x: point.x, y: point.y, floor:state.metadata.activeFloor, quantity:1, spec:{} };
  state.nodes.push(node); selected = node.id; pendingType = null; document.querySelectorAll(".cad-part").forEach(button => button.setAttribute("aria-pressed", "false"));
  save(); resizeDrawing(); renderNodes(); renderWires(); showProperties(node); setMode("select"); setStatus(`${node.name} placed at grid ${node.x} / ${columnLabel(node.y + 1)}.`);
}
function addRoom(start, end) {
  const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y), width = Math.abs(end.x - start.x), height = Math.abs(end.y - start.y);
  if (width < 1 || height < 1) { setStatus("Room boundary needs at least one grid square in each direction."); return; }
  snapshot(); const name = `Room ${state.rooms.length + 1}`;
  const room = { id: objectId("R"), name, x, y, width, height, floor:state.metadata.activeFloor }; state.rooms.push(room); selectedRoom = room.id;
  save(); resizeDrawing(); renderRooms(); showRoomProperties(room); setMode("select"); setStatus(`${name} room boundary created (${width * GRID_MM} × ${height * GRID_MM} mm grid extents).`);
}
function removeSelected() {
  if(selectedWire){snapshot();state.wires=state.wires.filter(w=>w.id!==selectedWire);selectedWire=null;hideAuxiliaryPanels();save();renderWires();return;}
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
  selectedWire=null;hideAuxiliaryPanels();renderProjectFields();renderCatalog();
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
  updateMetadata();const result=validateBuildingDocument(state),review=reviewInstallation(state);
  showEngineeringReview(result,review);
  $("validationState").textContent=`Document: ${result.errors.length} errors · ${review.issues.filter(i=>i.level==='error').length} engineering data errors · review pending`;
  $("validationState").className="state-review";
  setStatus("Engineering review opened in Properties. Structural checks and design-data screening do not certify an installation.");
  return result;
}
function assignReferences() {
  const used=new Set(state.nodes.map(node=>node.tag).filter(Boolean)),next={};
  for(const node of state.nodes){if(node.tag)continue;const prefix=typeOf(node.type).reference||'EQ';let candidate;do{candidate=`${prefix}-${String(next[prefix]=(next[prefix]||0)+1).padStart(3,'0')}`;}while(used.has(candidate));node.tag=candidate;used.add(candidate);}
  save();renderNodes();if(selected)showProperties(state.nodes.find(node=>node.id===selected));
  setStatus("Project-local references assigned by equipment family. Verify the project's IEC 81346 or local designation convention before issue.");
}
function openProject(file) {
  if(file.size>10000000){setStatus("Open failed: use a JSON file smaller than 10 MB.");return;}
  const reader = new FileReader(); reader.onload = () => {
    try { const raw=JSON.parse(String(reader.result));
      if(raw.format==='voltpro.manufacturer-catalog'){
        const incoming=importManufacturerCatalog(raw);if((state.catalog?.length||0)+incoming.length>5000)throw Error('This local project supports at most 5,000 imported catalogue records. Use a connected catalogue service for larger collections.');
        const ids=new Set(incoming.map(item=>item.id));snapshot();state.catalog=[...(state.catalog||[]).filter(item=>!ids.has(item.id)),...incoming];save();renderCatalog();setStatus(`${incoming.length} manufacturer records imported; source and permission statements retained.`);return;
      }
      const next = recoverBuildingDocument(raw); snapshot(); state = next; selected = null; selectedRoom = null; pendingType=null; wireStart=null; roomStart=null; setMode("select"); renderAll(); save(); fitDrawing(); setStatus("Project opened and normalized to BuildingCAD document version 2."); }
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
    case "delete": selectedWire ? removeSelected() : selectedRoom ? removeSelectedRoom() : removeSelected(); break;
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
  const rows=materialSchedule(state),clean=value=>String(value??'').replace(/[\t\r\n]/g,' ').replace(/^[=+@-]/,"'$&");
  const columns=['floor','category','name','quantity','unit','manufacturer','partNumber','source','basis','unmeasured','spec'];
  const csv=[columns.join('\t'),...rows.map(row=>columns.map(key=>clean(typeof row[key]==='number'?Math.round(row[key]*1000)/1000:row[key])).join('\t'))].join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/tab-separated-values'}));const link=document.createElement('a');link.href=url;link.download='electrical-material-and-cable-schedule.tsv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  announce(`Material schedule exported · ${rows.length} grouped lines · ${state.metadata.floors} storeys`);
}

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
    snapshot();node[key]=value;save();renderRooms();renderNodes();renderWires();fillNodeSpecification(node);
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
function hideAuxiliaryPanels(){ $('wirePropertiesForm').hidden=true;$('engineeringReport').hidden=true; }
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
    if(key==='loadW'&&!['lighting','ventilation','loads','energy'].includes(item.category))continue;
    const row=document.createElement('label');row.textContent=label;
    const input=document.createElement('input');input.value=spec[key]??'';input.readOnly=item.spec?.[key]!==null&&item.spec?.[key]!==undefined;
    if(['ratingA','breakingKA','residualMA','poles','modules','widthMM','heightMM','diameterMM','loadW'].includes(key)){input.type='number';input.min='0';input.step='any';}
    input.addEventListener('change',()=>{const value=input.type==='number'?Number(input.value):input.value;if(input.value!==''&&typeof value==='number'&&(!Number.isFinite(value)||value<0)){setStatus('Enter a non-negative finite specification value.');return;}snapshot();node.spec={...node.spec,[key]:input.value===''?null:value};save();});row.append(input);fields.append(row);
  }
  const allocation=document.createElement('label');allocation.textContent='Verified DIN modules used in assigned board';const modules=document.createElement('input');modules.type='number';modules.min='0';modules.step='1';modules.value=node.spec?.modulesUsed??'';modules.addEventListener('change',()=>{const value=modules.value===''?null:Number(modules.value);if(value!==null&&(!Number.isInteger(value)||value<0))return;snapshot();node.spec={...node.spec,modulesUsed:value};save();});allocation.append(modules);fields.append(allocation);
}
function showWireProperties(wire){
  selectedWire=wire.id;selected=null;selectedRoom=null;hideAuxiliaryPanels();propForm.hidden=true;roomForm.hidden=true;$('emptyProperties').hidden=true;togglePanel('properties',true);
  const form=$('wirePropertiesForm');form.hidden=false;form.replaceChildren();
  const heading=document.createElement('h3');heading.textContent=`Cable route ${wire.id}`;form.append(heading);
  const from=state.nodes.find(n=>n.id===wire.from),to=state.nodes.find(n=>n.id===wire.to),info=document.createElement('p');info.textContent=`${from?.tag||from?.name} (Floor ${from?.floor||1}) → ${to?.tag||to?.name} (Floor ${to?.floor||1}). Surveyed route quantities; no terminal-level circuit simulation.`;form.append(info);
  const fields=[['cableId','Cable / wire specification','cable'],['protectiveDeviceId','Overcurrent protective device','protection'],['circuit','Circuit identifier','text'],['runs','Cable / conductor runs','number'],['verticalRiseM','Surveyed vertical rise (m)','number'],['extraLengthM','Additional routing allowance (m)','number'],['sparePercent','Additional spare (%)','number'],['designCurrentA','Design current (A)','number'],['verifiedAmpacityA','Verified installed ampacity (A)','number'],['prospectiveFaultKA','Prospective fault current (kA)','number'],['circuitVoltage','Circuit voltage (V)','number'],['phases','Calculation phase arrangement','phases']];
  for(const [key,label,kind] of fields){const row=document.createElement('label');row.textContent=label;let input;
    if(['cable','protection','phases'].includes(kind)){input=document.createElement('select');input.append(option('','Not specified'));
      const items=kind==='cable'?[...CATALOG,...(state.catalog||[])].filter(i=>i.kind==='route'&&i.system===typeOf(from?.type).system).map(i=>({value:i.id,label:i.label})):kind==='protection'?state.nodes.filter(n=>['breaker','rcbo'].includes(typeOf(n.type).symbol)).map(n=>({value:n.id,label:`${n.tag||n.id} · ${typeOf(n.type).label}`})):[{value:'1-phase',label:'Single phase · 2-wire loop'},{value:'3-phase',label:'Balanced three phase'}];
      input.append(...items.map(i=>option(i.value,i.label,i.value===wire[key])));
    }else{input=document.createElement('input');input.type=kind;if(kind==='number'){input.min='0';input.step=key==='runs'?'1':'any';}input.value=wire[key]??'';}
    input.dataset.wireField=key;input.addEventListener('change',()=>{let value=kind==='number'?(input.value===''?null:Number(input.value)):input.value;if(kind==='number'&&value!==null&&(!Number.isFinite(value)||value<0||(key==='runs'&&(!Number.isInteger(value)||value<1)))){setStatus('Enter a valid non-negative value; cable/conductor runs must be positive integers.');return;}snapshot();wire[key]=value;save();renderWires();renderWireEstimate(wire);});row.append(input);form.append(row);
  }
  const estimate=document.createElement('p');estimate.id='wireEstimate';form.append(estimate);renderWireEstimate(wire);
}
function renderWireEstimate(wire){const length=connectionLength(state,wire),estimate=resistiveVoltageDrop(state,wire);$('wireEstimate').textContent=`Route length: ${length===null?'vertical rise unresolved':length.toFixed(2)+' m'}${estimate?` · resistance-only drop ${estimate.volts.toFixed(2)} V (${estimate.percent.toFixed(2)}%). ${estimate.note}`:' · voltage-drop estimate needs metric copper cross-section, current, voltage and phase arrangement.'}`;}
function showEngineeringReview(structure,review){
  selectedWire=null;selected=null;selectedRoom=null;propForm.hidden=true;roomForm.hidden=true;hideAuxiliaryPanels();$('emptyProperties').hidden=true;togglePanel('properties',true);
  const report=$('engineeringReport');report.hidden=false;report.replaceChildren();
  const title=document.createElement('h3');title.textContent=`Engineering data review · ${review.profile.label}`;report.append(title);
  const intro=document.createElement('p');intro.textContent=`${state.metadata.floors} storeys · ${state.nodes.length} equipment/material items · ${state.wires.length} routes. No construction approval or installation compliance is implied.`;report.append(intro);
  for(const [heading,items] of [['Document checks',[...structure.errors.map(message=>({level:'error',message})),...structure.warnings.map(message=>({level:'review',message}))]],['Design-data screening',review.issues]]){const section=document.createElement('details');section.open=true;const summary=document.createElement('summary');summary.textContent=`${heading} · ${items.length}`;section.append(summary);const list=document.createElement('ul');for(const item of items){const li=document.createElement('li');li.dataset.level=item.level;li.textContent=`${item.object?item.object+': ':''}${item.message}`;list.append(li);}section.append(list);report.append(section);}
  const section=document.createElement('details');section.open=true;const summary=document.createElement('summary');summary.textContent='Circuits / connected load';section.append(summary);const table=document.createElement('table');for(const circuit of review.circuits){const row=document.createElement('tr');for(const text of [`F${circuit.floor} · ${circuit.id}`,`${circuit.devices} items`,`${circuit.connectedW} W entered${circuit.unknownLoads?' + '+circuit.unknownLoads+' unresolved loads':''}`]){const td=document.createElement('td');td.textContent=text;row.append(td);}table.append(row);}section.append(table);report.append(section);
  const remaining=document.createElement('p');remaining.textContent='Not assessed: '+review.notAssessed.join('; ')+'.';report.append(remaining);
}
