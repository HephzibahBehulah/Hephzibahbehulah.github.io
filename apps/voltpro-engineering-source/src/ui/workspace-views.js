(() => {
  "use strict";
  const workspace = document.querySelector(".workspace");
  if (!workspace || window.VoltProWorkspaceViews) return;
  const host = document.createElement("div"); host.className = "vp-pcb-host"; host.hidden = true;
  const boardHost = document.createElement("div"); boardHost.className = "vp-board-host"; boardHost.hidden = true;
  workspace.classList.add("vp-has-rail"); workspace.append(host, boardHost);
  const scopePanel = document.getElementById("simScopePanel"); if (scopePanel) workspace.append(scopePanel);
  let activeView = "schematic", pcbView = null;
  const updateButtons = view => { document.querySelectorAll("[data-workspace-view]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.workspaceView === view))); document.dispatchEvent(new CustomEvent("voltpro-workspace-view-change", { detail: view })); };
  const ensureSerialView = () => {
    let pane = boardHost.querySelector(".vp-serial-view");
    if (!pane) { pane = document.createElement("section"); pane.className = "vp-serial-view"; pane.innerHTML = '<header><div><strong>VIRTUAL SERIAL MONITOR</strong><small>Output from a supported microcontroller sketch</small></div><button type="button" data-clear-serial>Clear</button></header><pre aria-live="polite">Waiting for virtual MCU output.</pre><p role="status">Run a supported sketch to capture Serial.print / Serial.println output.</p>'; pane.querySelector("[data-clear-serial]").addEventListener("click", () => { pane.querySelector("pre").textContent = "Serial output cleared."; }); boardHost.append(pane); }
    pane.hidden = false; const latest = window.VoltProLatestSerialOutput;
    if (latest) { pane.querySelector("pre").textContent = latest.lines.join("\n"); pane.querySelector('[role="status"]').textContent = "Virtual serial output · " + (latest.target || "MCU"); }
    const frame = boardHost.querySelector("iframe"); if (frame) frame.hidden = true;
  };
  window.addEventListener("voltpro-serial-output", event => { const pane = boardHost.querySelector(".vp-serial-view"), lines = Array.isArray(event.detail?.lines) ? event.detail.lines : []; if (!pane || !lines.length) return; pane.querySelector("pre").textContent = lines.join("\n"); pane.querySelector('[role="status"]').textContent = "Virtual serial output · " + (event.detail.target || "MCU"); });
  const switchView = view => {
    if (!["schematic", "breadboard", "pcb", "code", "serial", "scope"].includes(view)) return; activeView = view;
    if (view === "scope") { host.hidden = true; boardHost.hidden = true; workspace.classList.remove("vp-view-active"); if (scopePanel) { scopePanel.hidden = false; workspace.classList.add("vp-scope-open"); const project = window.VoltProUI?.solverProject?.(); if (project) window.VoltProUI?.captureScope?.(project); } updateButtons(view); return; }
    if (scopePanel) scopePanel.hidden = true; workspace.classList.remove("vp-scope-open"); updateButtons(view); workspace.classList.toggle("vp-view-active", view !== "schematic");
    if (view === "schematic") { host.hidden = true; boardHost.hidden = true; return; }
    if (view === "breadboard") { host.hidden = true; boardHost.hidden = false; let frame = boardHost.querySelector("iframe"); if (!frame) { frame = document.createElement("iframe"); frame.title = "Breadboard workspace"; frame.src = "breadboard.html?vp_embed=1"; frame.loading = "lazy"; boardHost.append(frame); } frame.hidden = false; return; }
    if (view === "serial") { host.hidden = true; boardHost.hidden = false; ensureSerialView(); return; }
    boardHost.hidden = true; host.hidden = false; const ui = window.VoltProUI;
    if (!ui || !window.VoltProPCBStudio) { host.textContent = "The PCB and code workspace did not finish loading. Reload the Simulator and try again."; return; }
    if (!pcbView) pcbView = window.VoltProPCBStudio.open({ host, kind: "simulator", read: () => ({ components: ui.state.components, wires: ui.state.wires, pcbRoutes: ui.state.projectMetadata?.pcbRoutes || [] }), onViewChange: next => document.querySelectorAll(".vp-pcb-host [data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === next)), onChange: () => { ui.state.projectMetadata = { ...(ui.state.projectMetadata || {}), pcbRoutes: host._pcbRoutes || [] }; window.VoltProCanvasSession?.markChanged(); } }); else pcbView.refresh();
    if (view === "pcb") host.querySelector('[data-view="pcb"]')?.click(); if (view === "code") host.querySelector('[data-view="code"]')?.click();
  };
  window.VoltProWorkspaceViews = { switch: switchView, active: () => activeView };
  document.addEventListener("voltpro-pcb-view", event => switchView(event.detail));
})();
