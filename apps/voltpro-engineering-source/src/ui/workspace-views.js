(() => {
  "use strict";
  const workspace = document.querySelector(".workspace");
  if (!workspace || window.VoltProWorkspaceViews) return;
  const host = document.createElement("div"); host.className = "vp-pcb-host"; host.hidden = true;
  const boardHost = document.createElement("div"); boardHost.className = "vp-board-host"; boardHost.hidden = true;
  workspace.classList.add("vp-has-rail"); workspace.append(host, boardHost);
  const canvasWrap = document.getElementById("canvasWrap"), scopePanel = document.getElementById("simScopePanel");
  if (scopePanel && canvasWrap) canvasWrap.append(scopePanel);
  let activeView = "schematic", pcbView = null, boardCanvasView = null, boardState = null, scopeOpen = false;
  const scopeLayoutKey = "voltpro-simulator-scope-layout-v1";
  const readScopeLayout = () => { try { const value = JSON.parse(localStorage.getItem(scopeLayoutKey) || "null"); return value && [value.left,value.top,value.width,value.height].every(Number.isFinite) ? value : null; } catch { return null; } };
  const saveScopeLayout = () => {
    if (!scopePanel || !canvasWrap || scopePanel.classList.contains("expanded")) return;
    const left = Number.parseFloat(scopePanel.style.left), top = Number.parseFloat(scopePanel.style.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return;
    try { localStorage.setItem(scopeLayoutKey, JSON.stringify({ left, top, width: scopePanel.offsetWidth, height: scopePanel.offsetHeight })); } catch {}
  };
  const restoreScopeLayout = () => {
    if (!scopePanel || !canvasWrap) return;
    const saved = readScopeLayout();
    if (!saved) { scopePanel.style.left = "auto"; scopePanel.style.top = "12px"; scopePanel.style.right = "12px"; scopePanel.style.bottom = "auto"; return; }
    const availableWidth = Math.max(1, canvasWrap.clientWidth - 16), availableHeight = Math.max(1, canvasWrap.clientHeight - 16);
    const width = Math.min(Math.max(saved.width, Math.min(320, availableWidth)), availableWidth);
    const height = Math.min(Math.max(saved.height, Math.min(220, availableHeight)), availableHeight);
    scopePanel.style.width = width + "px"; scopePanel.style.height = height + "px";
    scopePanel.style.left = Math.max(8, Math.min(saved.left, canvasWrap.clientWidth - width - 8)) + "px";
    scopePanel.style.top = Math.max(8, Math.min(saved.top, canvasWrap.clientHeight - 46)) + "px";
    scopePanel.style.right = "auto"; scopePanel.style.bottom = "auto";
  };
  const updateButtons = () => {
    document.querySelectorAll("[data-workspace-view]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.workspaceView === "scope" ? scopeOpen : button.dataset.workspaceView === activeView)));
    document.dispatchEvent(new CustomEvent("voltpro-workspace-view-change", { detail: activeView }));
  };
  const openScope = project => {
    if (!scopePanel) return;
    if (activeView !== "schematic") { activeView = "schematic"; host.hidden = true; boardHost.hidden = true; workspace.classList.remove("vp-view-active"); }
    scopeOpen = true; scopePanel.hidden = false; scopePanel.classList.remove("collapsed", "expanded"); restoreScopeLayout();
    const toggle = scopePanel.querySelector("#simScopeToggle");
    if (toggle) { toggle.textContent = "Minimize"; toggle.setAttribute("aria-expanded", "true"); }
    const maximize = scopePanel.querySelector("#simScopeMaximize"); if (maximize) { maximize.setAttribute("aria-pressed", "false"); maximize.setAttribute("aria-label", "Enlarge oscilloscope within canvas"); }
    updateButtons();
    if (project) window.VoltProUI?.captureScope?.(project);
  };
  const closeScope = () => { if (!scopePanel) return; saveScopeLayout(); scopeOpen = false; scopePanel.hidden = true; updateButtons(); };
  const ensureSerialView = () => {
    let pane = boardHost.querySelector(".vp-serial-view");
    if (!pane) { pane = document.createElement("section"); pane.className = "vp-serial-view"; pane.innerHTML = '<header><div><strong>VIRTUAL SERIAL MONITOR</strong><small>Output from a supported microcontroller sketch</small></div><button type="button" data-clear-serial>Clear</button></header><pre aria-live="polite">Waiting for virtual MCU output.</pre><p role="status">Run a supported sketch to capture Serial.print / Serial.println output.</p>'; pane.querySelector("[data-clear-serial]").addEventListener("click", () => { pane.querySelector("pre").textContent = "Serial output cleared."; }); boardHost.append(pane); }
    pane.hidden = false; const latest = window.VoltProLatestSerialOutput;
    if (latest) { pane.querySelector("pre").textContent = latest.lines.join("\n"); pane.querySelector('[role="status"]').textContent = "Virtual serial output · " + (latest.target || "MCU"); }
    const frame = boardHost.querySelector("iframe"); if (frame) frame.hidden = true;
  };
  const createBoardProject = () => {
    const source = window.S, components = source?.components || [], wires = source?.wires || [];
    const endpoint = new Map(), parts = []; let column = 2;
    for (const component of components) {
      const terminals = window.VoltProTerminalGraph?.definitionFor?.(component.type)?.terminals || [];
      const count = Math.max(1, terminals.length || window.VoltProRegistry?.definition?.(component.type)?.pins || 2);
      if (column + count * 2 >= 63) throw new Error("This circuit has more terminals than fit on one physical breadboard. Split the circuit or reduce the terminal count.");
      const pins = Array.from({length: count}, (_, i) => { const pin = {r: i % 2 ? 9 : 4, c: column + Math.floor(i / 2) * 2}; endpoint.set(component.id + ":" + i, pin); return pin; });
      const props = {...(component.props || {})};
      parts.push({id: component.id, type: component.type, x: column, y: 4, rotation: 0, pins, value: component.props?.label || component.type, parameters: props, resistanceOhm: props.resistance, voltageV: props.voltage, forwardVoltageV: props.forward, capacitanceF: props.capacitance, inductanceH: props.inductance, frequencyHz: props.frequency, closed: Boolean(props.closed), wiperPosition: props.position});
      column += Math.max(4, Math.ceil(count / 2) * 2 + 2);
    }
    const boardWires = wires.map(wire => ({id: wire.id, a: endpoint.get(wire.a), b: endpoint.get(wire.b), refs: [wire.a, wire.b], color: wire.color || "#59cfe7"})).filter(wire => wire.a && wire.b);
    return {format: "voltpro.vbb.json", version: 2, board: {type: "830-point-solderless"}, parts, wires: boardWires, selectedPart: null, selectedWire: null};
  };
  const ensureBreadboardView = () => {
    if (!window.VoltProBreadboardLabCanvas || !window.VoltProBoardModel) throw new Error("Breadboard renderer did not load.");
    boardHost.replaceChildren();
    const stage = document.createElement("section"); stage.className = "vp-board-live";
    stage.innerHTML = '<header><strong>LIVE BREADBOARD VIEW</strong><span>Drag components to update the shared schematic</span></header><div class="vp-board-live-canvas"><canvas aria-label="Live physical breadboard circuit"></canvas></div><footer role="status">Logical terminal connections are retained from the schematic.</footer>';
    boardHost.append(stage); boardState = createBoardProject();
    const canvas = stage.querySelector("canvas");
    const refreshWires = () => { for (const wire of boardState.wires) { wire.a = boardState.parts.find(p => p.id === wire.refs[0].split(":")[0])?.pins[Number(wire.refs[0].split(":")[1])]; wire.b = boardState.parts.find(p => p.id === wire.refs[1].split(":")[0])?.pins[Number(wire.refs[1].split(":")[1])]; } };
    boardCanvasView = new window.VoltProBreadboardLabCanvas.BreadboardLabCanvas(canvas, {onMovePart: (id, hole) => {
      const pos = window.VoltProBreadboardLabCanvas.holeToLegacy(hole), part = boardState.parts.find(p => p.id === id), component = window.S.components.find(c => c.id === id); if (!pos || !part || !component) return;
      const dx = pos.c - part.pins[0].c, dy = pos.r - part.pins[0].r; part.pins.forEach(pin => { pin.c = Math.max(0, Math.min(62, pin.c + dx)); pin.r = Math.max(2, Math.min(12, pin.r + dy)); }); part.x += dx; part.y += dy;
      component.x = 80 + part.x * 12; component.y = 100 + part.y * 12; refreshWires(); window.VoltProUI.render(); boardCanvasView.update(boardState);
    }});
    boardCanvasView.update(boardState);
  };
  window.addEventListener("voltpro-serial-output", event => { const pane = boardHost.querySelector(".vp-serial-view"), lines = Array.isArray(event.detail?.lines) ? event.detail.lines : []; if (!pane || !lines.length) return; pane.querySelector("pre").textContent = lines.join("\n"); pane.querySelector('[role="status"]').textContent = "Virtual serial output · " + (event.detail.target || "MCU"); });
  const switchView = view => {
    if (!["schematic", "breadboard", "pcb", "code", "serial", "scope"].includes(view)) return;
    if (view === "scope") { if (scopeOpen) closeScope(); else openScope(window.VoltProUI?.solverProject?.()); return; }
    activeView = view; updateButtons(); workspace.classList.toggle("vp-view-active", view !== "schematic");
    if (view === "schematic") { host.hidden = true; boardHost.hidden = true; return; }
    if (view === "breadboard") { host.hidden = true; boardHost.hidden = false; try { ensureBreadboardView(); } catch (error) { boardHost.textContent = error.message; } return; }
    if (view === "serial") { host.hidden = true; boardHost.hidden = false; ensureSerialView(); return; }
    boardHost.hidden = true; host.hidden = false; const ui = window.VoltProUI, simulator = window.VoltProSimulator;
    if (!ui || !simulator || !window.VoltProPCBStudio) { host.textContent = "The PCB and code workspace did not finish loading. Reload the Simulator and try again."; return; }
    if (!pcbView) pcbView = window.VoltProPCBStudio.open({ host, kind: "simulator", read: () => ({ components: simulator.state.components, wires: simulator.state.wires, pcbRoutes: simulator.state.projectMetadata?.pcbRoutes || [] }), onViewChange: next => document.querySelectorAll(".vp-pcb-host [data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === next)), onChange: () => { simulator.state.projectMetadata = { ...(simulator.state.projectMetadata || {}), pcbRoutes: host._pcbRoutes || [] }; window.VoltProCanvasSession?.markChanged(); } }); else pcbView.refresh();
    if (view === "pcb") host.querySelector('[data-view="pcb"]')?.click(); if (view === "code") host.querySelector('[data-view="code"]')?.click();
  };
  if (scopePanel) {
    const heading = scopePanel.querySelector(".sim-scope-heading");
    let drag = null;
    heading?.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest("button")) return;
      const panelBox = scopePanel.getBoundingClientRect(), wrapBox = canvasWrap.getBoundingClientRect();
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: panelBox.left - wrapBox.left, top: panelBox.top - wrapBox.top };
      heading.setPointerCapture(event.pointerId); event.preventDefault();
    });
    heading?.addEventListener("pointermove", event => {
      if (!drag || event.pointerId !== drag.id) return;
      const maxLeft = Math.max(0, canvasWrap.clientWidth - scopePanel.offsetWidth), maxTop = Math.max(0, canvasWrap.clientHeight - scopePanel.offsetHeight);
      scopePanel.style.left = Math.max(0, Math.min(maxLeft, drag.left + event.clientX - drag.x)) + "px";
      scopePanel.style.top = Math.max(0, Math.min(maxTop, drag.top + event.clientY - drag.y)) + "px";
      scopePanel.style.right = "auto"; scopePanel.style.bottom = "auto";
    });
    const endDrag = event => { if (drag && event.pointerId === drag.id) { drag = null; saveScopeLayout(); } };
    heading?.addEventListener("pointerup", endDrag); heading?.addEventListener("pointercancel", endDrag);
    const maximize = scopePanel.querySelector("#simScopeMaximize");
    maximize?.addEventListener("click", () => {
      const expanded = scopePanel.classList.toggle("expanded");
      maximize.setAttribute("aria-pressed", String(expanded)); maximize.setAttribute("aria-label", expanded ? "Restore oscilloscope size" : "Enlarge oscilloscope within canvas");
      if (expanded) {
        const width = Math.min(Math.max(400, canvasWrap.clientWidth * .68), canvasWrap.clientWidth - 16);
        const height = Math.min(Math.max(300, canvasWrap.clientHeight * .68), canvasWrap.clientHeight - 16);
        scopePanel.style.width = width + "px"; scopePanel.style.height = height + "px";
        scopePanel.style.left = Math.max(8, canvasWrap.clientWidth - width - 8) + "px"; scopePanel.style.top = Math.max(8, canvasWrap.clientHeight - height - 8) + "px";
        scopePanel.style.right = "auto"; scopePanel.style.bottom = "auto";
      } else restoreScopeLayout();
    });
    if ("ResizeObserver" in window) new ResizeObserver(() => { if (!scopePanel.hidden && !scopePanel.classList.contains("expanded")) saveScopeLayout(); }).observe(scopePanel);
    window.addEventListener("resize", () => { if (!scopePanel.hidden) restoreScopeLayout(); }, { passive: true });
  }  window.VoltProWorkspaceViews = { switch: switchView, active: () => activeView, openScope, closeScope, scopeOpen: () => scopeOpen };
  document.addEventListener("voltpro-pcb-view", event => switchView(event.detail));
})();

