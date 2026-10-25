(() => {
  "use strict";
  const tools = [
    { path: "/simulator", title: "VoltPro Simulator", src: "/simulator.html?vp_embed=1&v=20261025p" },
    { path: "/plc", title: "VoltPro PLC", src: "/voltpro-plc/?vp_embed=1" },
    { path: "/electcad", title: "VoltPro ElectCAD", src: "/voltpro-electcad/?vp_embed=1" },
    { path: "/tools", title: "Engineering Tools", src: "/engineering.html?vp_embed=1" },
    { path: "/breadboard", title: "VoltPro Breadboard", src: "/breadboard.html?vp_embed=1" },
    { path: "/electrical", title: "VoltPro Electrical Building", src: "/electrical-canvas.html?vp_embed=1" }
  ];
  const rootPrefix = location.hostname.startsWith("admin.") && /^\/engineering(?:\/|$)/.test(location.pathname) ? "/engineering" : "";
  const root = document.getElementById("vpWorkspace");
  const panels = new Map();
  const sharedHeader = document.getElementById("vpSiteHeader");
  const headerPlaceholder = sharedHeader ? document.createComment("VoltPro shared header position") : null;
  if (sharedHeader) sharedHeader.before(headerPlaceholder);

  function simulatorDocument() {
    return panels.get("/simulator")?.querySelector("iframe")?.contentDocument || null;
  }
  function restoreSimulatorChrome() {
    const doc = simulatorDocument();
    if (!doc) return;
    const parts = doc.__vpShellParts;
    if (!parts) return;
    const toolbar = parts.toolbar || doc.querySelector(".sim-app > .toolbar");
    const top = doc.querySelector(".sim-top");
    const app = doc.querySelector(".sim-app");
    const bottom = document.getElementById("vpBottomNavigation");
    if (toolbar) {
      if (parts.primary) toolbar.append(parts.primary);
      if (parts.menus) toolbar.append(parts.menus);
      if (parts.project) toolbar.append(parts.project);
      if (parts.bottomControls) {
        const controls = doc.createElement("div"); controls.className = "toolbar-group"; controls.setAttribute("role", "group"); controls.setAttribute("aria-label", "Simulation controls");
        for (const id of ["runBtn", "stopBtn"]) { const node = parts.bottomControls.querySelector("#" + id) || doc.getElementById(id); if (node) controls.append(doc.adoptNode(node)); }
        const status = parts.bottomControls.querySelector("#simStatus") || parts.status;
        if (status) controls.append(doc.adoptNode(status));
        toolbar.prepend(controls);
      }
      if (parts.zoom && parts.zoomParent && parts.zoom.parentElement !== parts.zoomParent) parts.zoomParent.append(parts.zoom);
      if (top && toolbar.parentElement !== app) top.after(toolbar);
    }
    if (parts.brand && top && parts.brand.parentElement !== top) top.prepend(parts.brand);
    if (parts.language) parts.language.querySelectorAll("option").forEach(option => { if (option.dataset.fullLabel) option.textContent = option.dataset.fullLabel; });
    if (parts.header && parts.header.parentElement !== document.body) {
      document.body.insertBefore(parts.header, headerPlaceholder?.nextSibling || document.body.firstChild);
    }
    if (parts.dialog && parts.dialog.parentElement !== document.body) document.body.append(parts.dialog);
    if (parts.banner && parts.banner.parentElement !== document.body) {
      parts.banner.classList.remove("vp-sim-bottom-warning");
      document.body.insertBefore(parts.banner, parts.header?.nextSibling || headerPlaceholder?.nextSibling || null);
    }
    parts.bottomControls?.remove();
    parts.devNote?.remove();
    doc.querySelector(".vp-sim-rail")?.remove();
    doc.querySelector(".workspace")?.classList.remove("vp-dock-collapsed");
    const dock = doc.querySelector("#inspectorPanel .vp-dock-shell");
    if (dock) {
      const inspector = doc.getElementById("inspectorPanel");
      for (const panel of [...dock.querySelectorAll(".vp-dock-panel")]) while (panel.firstChild) inspector.insertBefore(panel.firstChild, dock);
      dock.remove();
    }
    delete doc.__vpShellParts;
  }

  function restoreSharedHeader() {
    restoreSimulatorChrome();
    if (!sharedHeader) return;
    if (sharedHeader.parentElement === document.body) return;
    const banner = document.getElementById("vpDevelopmentBanner");
    document.body.insertBefore(sharedHeader, banner || headerPlaceholder?.nextSibling || document.body.firstChild);
  }

  function integrateSimulator(panel) {
    if (!sharedHeader || !panel) return;
    const frame = panel.querySelector("iframe");
    const doc = frame?.contentDocument;
    const top = doc?.querySelector(".sim-top");
    const toolbar = doc?.querySelector(".sim-app > .toolbar");
    if (!top || !toolbar) return;
    doc.documentElement.classList.add("vp-template-simulator");
    doc.body.classList.add("vp-template-simulator");
    if (doc.__vpShellParts?.integrated) return;
    const bottom = document.getElementById("vpBottomNavigation");
    const banner = document.getElementById("vpDevelopmentBanner");
    const dialog = document.getElementById("vpReadinessDialog");
    const brand = top.querySelector(":scope > .brand");
    if (brand) {
      const title = brand.querySelector(".vp-brand-product b");
      const subtitle = brand.querySelector(".vp-brand-product small");
      if (title) title.textContent = "VoltPro";
      brand.setAttribute("aria-label", "VoltPro Simulator");
      brand.querySelector("img")?.remove();
      brand.querySelector(".vp-brand-divider")?.remove();
      if (subtitle) subtitle.textContent = "Simulator";
      if (!brand.querySelector(".vp-product-mark")) {
        const mark = doc.createElement("span");
        mark.className = "vp-product-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "⚡";
        const product = brand.querySelector(".vp-brand-product");
        if (product) brand.insertBefore(mark, product);
      }
    }
    const zoom = doc.querySelector(".zoom");
    const zoomParent = zoom?.parentElement;
    const primary = toolbar.querySelector(".vp-toolbar-primary");
    const project = toolbar.querySelector(".vp-toolbar-project");
    const menus = toolbar.querySelector(".vp-toolbar-menus");
    const status = toolbar.querySelector("#simStatus");
    const language = sharedHeader.querySelector("#vpShellLanguage");
    const mainSite = sharedHeader.querySelector(".vp-main-site-link");
    if (mainSite) mainSite.title = "Return to the main site";
    const workspaceMenu = sharedHeader.querySelector(".vp-site-navigation>summary");
    if (workspaceMenu) workspaceMenu.title = "My workspace · open an engineering tool";
    const about = sharedHeader.querySelector("#vpAboutReadiness");
    if (about) about.title = "About VoltPro and production readiness";
    const themeControl = sharedHeader.querySelector("#vpThemeToggle");
    if (themeControl) themeControl.title = "Switch light or dark theme";
    sharedHeader.querySelectorAll("details[open]").forEach(menu => { menu.open = false; });
    doc.__vpShellParts = { integrated: true, header: sharedHeader, banner: null, dialog, brand, zoom, zoomParent, primary, menus, project, status, toolbar, language };
    const app = doc.querySelector(".sim-app");
    if (toolbar.parentElement !== top) top.append(toolbar);
    if (app && (sharedHeader.ownerDocument !== doc || sharedHeader.parentElement !== app)) app.prepend(doc.adoptNode(sharedHeader));
    if (brand && brand.parentElement !== sharedHeader) sharedHeader.insertBefore(brand, sharedHeader.querySelector(".vp-site-navigation"));
    if (language) {
      language.title = "Language";
      language.setAttribute("aria-label", "Language selector");
      language.querySelectorAll("option").forEach(option => { option.dataset.fullLabel ||= option.textContent; option.textContent = option.value.toUpperCase(); });
    }
    if (project) sharedHeader.append(project);
    if (menus) sharedHeader.append(menus);
    if (primary) sharedHeader.append(primary);
    const account = sharedHeader.querySelector(".vp-site-identity");
    const utilities = doc.createElement("div");
    utilities.className = "vp-sim-header-utilities";
    if (language) {
      const languageControl = doc.createElement("label");
      languageControl.className = "vp-sim-language-control";
      const globe = doc.createElement("span");
      globe.setAttribute("aria-hidden", "true");
      globe.textContent = "🌐";
      languageControl.append(globe, language);
      utilities.append(languageControl);
    }
    if (themeControl) utilities.append(themeControl);
    if (about) utilities.append(about);
    if (account) utilities.append(account);
    sharedHeader.replaceChildren();
    if (mainSite) sharedHeader.append(mainSite);
    if (brand) sharedHeader.append(brand);
    if (project) sharedHeader.append(project);
    if (menus) sharedHeader.append(menus);
    if (primary) sharedHeader.append(primary);
    sharedHeader.append(utilities);
    sharedHeader.classList.add("vp-simulator-one-row");
    if (toolbar.parentElement === top) toolbar.remove();
    const simControls = doc.createElement("div");
    simControls.className = "vp-sim-bottom-controls";
    simControls.setAttribute("role", "group");
    simControls.setAttribute("aria-label", "Simulation controls");
    if (status) simControls.append(status);
    const runControl = doc.getElementById("runBtn");
    const stopControl = doc.getElementById("stopBtn");
    if (runControl) {
      runControl.textContent = "Start";
      runControl.setAttribute("aria-label", "Start simulation");
      simControls.append(runControl);
    }
    if (stopControl) {
      stopControl.textContent = "Stop";
      stopControl.setAttribute("aria-label", "Stop simulation");
      simControls.append(stopControl);
    }
    const stepControl = doc.getElementById("stepBtn");
    if (stepControl) stepControl.style.setProperty("display", "none", "important");
    const syncSimulationControls = () => {
      const state = status?.dataset.state || "stopped";
      const label = status?.querySelector(".status-label");
      const title = state === "running" ? "Running" : state === "error" ? "Error" : "Stopped";
      if (label && label.textContent !== title) label.textContent = title;
      if (runControl) runControl.disabled = state === "running";
      if (stopControl) stopControl.disabled = state !== "running";
    };
    syncSimulationControls();
    if (status) new MutationObserver(syncSimulationControls).observe(status, { attributes: true, childList: true, subtree: true });
    if (bottom) bottom.append(simControls);
    doc.__vpShellParts.bottomControls = simControls;
    if (banner) banner.remove();
    const devNote = document.createElement("span");
    devNote.className = "vp-bottom-dev-note";
    devNote.textContent = "⚠ Development build · Not for production documentation";
    devNote.title = "VoltPro is in active development. Do not use for production documentation.";
    bottom?.append(devNote);
    doc.__vpShellParts.devNote = devNote;

    if (dialog && dialog.ownerDocument !== doc) doc.body.append(doc.adoptNode(dialog));
    const workspace = doc.querySelector(".workspace");
    if (workspace) {
      const syncResponsivePanels = () => {
        const narrow = doc.defaultView.matchMedia("(max-width: 1000px)").matches;
        const compact = doc.defaultView.matchMedia("(max-width: 760px)").matches;
        const panelControls = doc.defaultView.VoltProWorkspaceControls;
        if (narrow && !doc.__vpResponsivePanelsInitialized) {
          panelControls?.setPanel("left", false);
          panelControls?.setPanel("right", false);
          doc.__vpResponsivePanelsInitialized = true;
        }
        if (narrow) doc.getElementById("palette")?.classList.remove("open", "collapsed");
        workspace.classList.remove("inspector-hidden");
        const state = panelControls?.layout?.();
        doc.getElementById("paletteBtn")?.setAttribute("aria-expanded", String(state?.left ?? !narrow));
        doc.getElementById("inspectorBtn")?.setAttribute("aria-expanded", String(state?.right ?? !compact));
      };
      syncResponsivePanels();
      if (!doc.__vpResponsivePanelResizeBound) {
        doc.__vpResponsivePanelResizeBound = true;
        doc.defaultView.addEventListener("resize", syncResponsivePanels, { passive: true });
      }
    }
    if (workspace && !workspace.querySelector(".vp-sim-rail")) {
      const rail = doc.createElement("nav");
      rail.className = "vp-sim-rail";
      rail.setAttribute("aria-label", "Workspace tools");
      rail.innerHTML = '<button type="button" data-rail="select" title="Select / cancel tool" aria-label="Select / cancel tool">↖</button><button type="button" data-rail="wire" title="Wire / connect terminals" aria-label="Wire / connect terminals">⌁</button><button type="button" data-rail="parts" title="Components / parts library" aria-label="Components / parts library">▤</button><button type="button" data-rail="search" title="Search components" aria-label="Search components">⌕</button><button type="button" data-rail="properties" title="Properties and results" aria-label="Properties and results">☷</button><button type="button" data-rail="fit" title="Fit drawing to view" aria-label="Fit drawing to view">⛶</button>';
      workspace.prepend(rail);
      rail.addEventListener("click", event => {
        const action = event.target.closest("[data-rail]")?.dataset.rail;
        if (!action) return;
        if (action === "parts") {
          if (doc.defaultView.VoltProWorkspaceControls) doc.defaultView.VoltProWorkspaceControls.setPanel("left", true);
          else doc.getElementById("paletteBtn")?.click();
        }
        if (action === "wire") doc.getElementById("wireBtn")?.click();
        if (action === "search") {
          if (doc.defaultView.VoltProWorkspaceControls) doc.defaultView.VoltProWorkspaceControls.setPanel("left", true);
          else doc.getElementById("palette")?.classList.add("open");
          doc.getElementById("componentSearch")?.focus();
        }
        if (action === "properties") {
          if (doc.defaultView.VoltProWorkspaceControls) doc.defaultView.VoltProWorkspaceControls.setPanel("right", true);
          else workspace.classList.remove("inspector-hidden");
          doc.querySelector('[data-dock-tab="properties"]')?.click();
        }
        if (action === "fit") doc.getElementById("fitBtn")?.click();
        if (action === "select") { if (doc.querySelector("#startWireBtn.active")) doc.getElementById("startWireBtn")?.click(); }
      });
    }
    const canvasWrap = doc.getElementById("canvasWrap");
    if (canvasWrap && !canvasWrap.querySelector(".vp-sheet-top")) {
      const topRuler = doc.createElement("div"); topRuler.className = "vp-sheet-top"; topRuler.setAttribute("aria-label", "Drawing columns");
      topRuler.innerHTML = Array.from({length:10}, (_, i) => `<span>${i + 1}</span>`).join("");
      const leftRuler = doc.createElement("div"); leftRuler.className = "vp-sheet-left"; leftRuler.setAttribute("aria-label", "Drawing rows");
      leftRuler.innerHTML = Array.from({length:12}, (_, i) => `<span>${String.fromCharCode(65 + i)}</span>`).join("");
      const titleBlock = doc.createElement("div"); titleBlock.className = "vp-title-block"; titleBlock.setAttribute("aria-label", "Drawing identification");
      titleBlock.innerHTML = '<strong>HEPHZIBAH BEHULAH · VOLTPRO</strong><span>DRAWING IDENTIFICATION</span><span>Project: <b>Active design</b></span><span>Scale: 1:1 · Sheet: 1 / 1</span>';
      canvasWrap.append(topRuler, leftRuler, titleBlock);
    }
    const inspector = doc.getElementById("inspectorPanel");
    if (inspector && !inspector.querySelector(".vp-dock-shell")) {
      const existing = [...inspector.children];
      const dock = doc.createElement("div"); dock.className = "vp-dock-shell";
      const heading = doc.createElement("div"); heading.className = "vp-dock-heading";
      const headingLabel = doc.createElement("span"); headingLabel.textContent = "WORKSPACE DOCK";
      const dockToggle = doc.createElement("button"); dockToggle.type = "button"; dockToggle.className = "vp-dock-toggle";
      dockToggle.textContent = "◧"; dockToggle.title = "Collapse workspace dock"; dockToggle.setAttribute("aria-label", "Collapse workspace dock"); dockToggle.setAttribute("aria-expanded", "true");
      dockToggle.addEventListener("click", () => {
        const workspaceRoot = doc.querySelector(".workspace");
        const collapsed = !!workspaceRoot?.classList.toggle("vp-dock-collapsed");
        dockToggle.textContent = collapsed ? "◨" : "◧";
        dockToggle.title = collapsed ? "Expand workspace dock" : "Collapse workspace dock";
        dockToggle.setAttribute("aria-label", dockToggle.title);
        dockToggle.setAttribute("aria-expanded", String(!collapsed));
      });
      heading.append(headingLabel, dockToggle);
      const tabs = doc.createElement("div"); tabs.className = "vp-dock-tabs"; tabs.setAttribute("role", "tablist");
      tabs.innerHTML = '<button type="button" role="tab" aria-selected="true" data-dock-tab="properties">☷ Properties</button><button type="button" role="tab" aria-selected="false" data-dock-tab="results">∿ Results</button>';
      const properties = doc.createElement("section"); properties.className = "vp-dock-panel"; properties.dataset.dockPanel = "properties";
      const results = doc.createElement("section"); results.className = "vp-dock-panel"; results.dataset.dockPanel = "results"; results.hidden = true;
      const ids = new Set(["inspectorBody"]);
      for (const node of existing) (ids.has(node.id) ? properties : results).append(node);
      const settings=doc.createElement("section");settings.className="vp-document-settings";
      settings.innerHTML='<div class="vp-document-settings-title">DOCUMENT SETTINGS</div><label class="vp-document-grid-row"><span>Grid spacing</span><span><input id="vpDocumentGridSpacing" type="number" min="5" max="80" value="20"><span id="vpDocumentGridUnits">mm</span></span></label><button id="vpSnapToGrid" class="vp-document-toggle" type="button" role="switch" aria-checked="true"><span>Snap to grid</span><i></i></button><button id="vpShowDrawingGrid" class="vp-document-toggle" type="button" role="switch" aria-checked="true"><span>Show drawing grid</span><i></i></button><button id="vpMoreDocumentSettings" class="vp-document-more" type="button">☷　More settings</button>';
      properties.append(settings);
      const settingsDialog=doc.createElement("dialog");settingsDialog.className="vp-document-settings-dialog";settingsDialog.setAttribute("aria-label","More document settings");settingsDialog.innerHTML='<form method="dialog"><strong>MORE SETTINGS</strong><label>Document units<select id="vpDocumentUnits"><option value="mm">Millimetres (mm)</option><option value="mil">Mils</option><option value="unit">Logical units</option></select></label><p>Settings apply to this active project. Unit changes do not convert existing coordinates.</p><div><button value="cancel">Cancel</button><button id="vpApplyDocumentSettings" value="apply">Apply settings</button></div></form>';doc.body.append(settingsDialog);
      const getSettings=()=>doc.defaultView.VoltProSimulator?.state?.documentSettings||{gridSpacing:20,units:"mm",snapToGrid:true,showGrid:true};
      const paintSettings=()=>{const s=getSettings();const input=doc.getElementById("vpDocumentGridSpacing"),units=doc.getElementById("vpDocumentGridUnits"),select=doc.getElementById("vpDocumentUnits");if(input)input.value=String(s.gridSpacing||20);if(units)units.textContent=s.units||"mm";if(select)select.value=s.units||"mm";for(const [id,on]of[["vpSnapToGrid",s.snapToGrid!==false],["vpShowDrawingGrid",s.showGrid!==false]]){const b=doc.getElementById(id);if(b){b.setAttribute("aria-checked",String(on));b.classList.toggle("is-on",on)}}};
      const setSettings=patch=>doc.defaultView.VoltProSimulator?.setDocumentSettings?.(patch);
      settings.querySelector("#vpDocumentGridSpacing").onchange=e=>setSettings({gridSpacing:Number(e.target.value)||20});
      settings.querySelector("#vpSnapToGrid").onclick=()=>setSettings({snapToGrid:getSettings().snapToGrid===false});
      settings.querySelector("#vpShowDrawingGrid").onclick=()=>setSettings({showGrid:getSettings().showGrid===false});
      settings.querySelector("#vpMoreDocumentSettings").onclick=()=>{paintSettings();settingsDialog.showModal()};
      doc.getElementById("vpApplyDocumentSettings").onclick=()=>setSettings({units:doc.getElementById("vpDocumentUnits").value});
      doc.addEventListener("voltpro-document-settings-change",paintSettings);doc.addEventListener("voltpro-project-loaded",paintSettings);paintSettings();
      const liveOptions = doc.querySelector(".live-view-options");
      if (liveOptions) results.append(liveOptions);
      dock.append(heading, tabs, properties, results); inspector.append(dock);paintSettings();
      tabs.addEventListener("click", event => {
        const key = event.target.closest("[data-dock-tab]")?.dataset.dockTab;
        if (!key) return;
        tabs.querySelectorAll("[data-dock-tab]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.dockTab === key)));
        dock.querySelectorAll("[data-dock-panel]").forEach(section => section.hidden = section.dataset.dockPanel !== key);
      });
    }
    const aiDesigner = doc.getElementById("vpCircuitDesigner");
    const dockPanel = doc.getElementById("inspectorPanel");
    if (aiDesigner && dockPanel) dockPanel.append(aiDesigner);
    if (bottom) {
      bottom.querySelectorAll("a[data-vp-route]").forEach(link => { link.title = link.getAttribute("aria-label") || link.textContent.trim(); });
    }
    doc.querySelectorAll("#vpSiteHeader a").forEach(link => { link.target = "_top"; });
    if (!doc.__vpWorkspaceNavigationBound) {
      doc.__vpWorkspaceNavigationBound = true;
      doc.addEventListener("click", event => {
        const link = event.target.closest?.("#vpSiteHeader a[data-vp-route], .vp-view-tabs a[data-view='breadboard']");
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = link.matches(".vp-view-tabs a[data-view='breadboard']") ? "/breadboard" : canonicalPath(new URL(link.href).pathname);
        if (!tools.some(tool => tool.path === target)) return;
        event.preventDefault();
        activate(target);
      });
    }
    const theme = document.documentElement.dataset.vpTheme || "dark";
    doc.documentElement.dataset.vpTheme = theme;
    doc.body.classList.toggle("light", theme === "light");
  }

  function canonicalPath(path) {
    let local = path.startsWith(rootPrefix) ? path.slice(rootPrefix.length) : path;
    local = local.replace(/\/$/, "") || "/";
    if (local === "/engineering") return "/tools";
    if (local === "/voltpro-plc") return "/plc";
    if (local.toLowerCase() === "/voltpro-electcad") return "/electcad";
    return local;
  }
  function ensurePanel(tool) {
    if (panels.has(tool.path)) return panels.get(tool.path);
    const panel = document.createElement("section");
    panel.className = "vp-workspace-panel";
    panel.setAttribute("aria-label", tool.title);
    const frame = document.createElement("iframe");
    frame.className = "vp-workspace-frame";
    frame.title = tool.title;
    frame.loading = "lazy";
    frame.referrerPolicy = "same-origin";
    frame.src = rootPrefix + tool.src;
    panel.append(frame);
    root.replaceChildren(...[...root.children].filter(node => !node.classList.contains("vp-workspace-loading")), panel);
    panels.set(tool.path, panel);
    frame.addEventListener("load", () => {
      try {
        frame.contentDocument.documentElement.dataset.vpTheme = document.documentElement.dataset.vpTheme || "dark";
        if (tool.path === "/simulator" && document.documentElement.dataset.vpWorkspace === "simulator") integrateSimulator(panel);
      } catch {}
    });
    return panel;
  }
  function activate(path, push = true) {
    const key = canonicalPath(path);
    const tool = tools.find(item => item.path === key) || tools[0];
    if (tool.path !== "/simulator") restoreSharedHeader();
    const panel = ensurePanel(tool);
    for (const [route, element] of panels) {
      const active = route === tool.path;
      element.dataset.active = String(active);
      element.setAttribute("aria-hidden", String(!active));
    }
    if (push && canonicalPath(location.pathname) !== tool.path) {
      history.pushState({ voltproWorkspace: tool.path }, "", rootPrefix + tool.path);
    }
    document.documentElement.dataset.vpWorkspace = tool.path.slice(1);
    document.documentElement.classList.toggle("vp-electcad-maximized", tool.path === "/electcad");
    document.documentElement.classList.toggle("vp-simulator-template", tool.path === "/simulator");
    if (tool.path === "/simulator") integrateSimulator(panel);
    const electCadNotice = document.querySelector("#vpDevelopmentBanner .vp-production-notice");
    const electCadStatus = document.querySelector("#vpDevelopmentBanner .vp-banner-status-link");
    const bannerCopy = document.querySelector("#vpDevelopmentBanner .vp-development-banner-copy");
    if (tool.path === "/electcad" && bannerCopy) {
      if (!electCadNotice) {
        const notice = document.createElement("span");
        notice.className = "vp-production-notice";
        notice.textContent = "VoltPro is in active development. DRC rules and symbol libraries are pending verified standards ingestion and licensed catalog integration. Do not use for final production documentation.";
        bannerCopy.append(notice);
      }
      if (!electCadStatus) {
        const status = document.createElement("a");
        status.className = "vp-banner-status-link";
        status.href = rootPrefix + "/status";
        status.textContent = "Suite status ↗";
        bannerCopy.append(status);
      }
    } else {
      electCadNotice?.remove();
      electCadStatus?.remove();
    }
    document.dispatchEvent(new CustomEvent("voltpro:workspace-change", { detail: { path: tool.path, title: tool.title } }));
    document.querySelectorAll("#vpBottomNavigation a[data-vp-route]").forEach(link => {
      if (canonicalPath(new URL(link.href).pathname) === tool.path) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  document.addEventListener("click", event => {
    const link = event.target.closest("#vpBottomNavigation a[data-vp-route], #vpSiteHeader nav a[data-vp-route]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = canonicalPath(new URL(link.href).pathname);
    if (!tools.some(tool => tool.path === target)) return;
    event.preventDefault();
    activate(target);
  });
  document.getElementById("vpThemeToggle")?.addEventListener("click", () => {
    queueMicrotask(() => {
      const frame = panels.get("/simulator")?.querySelector("iframe");
      try { frame?.contentDocument?.body?.classList.toggle("light", document.documentElement.dataset.vpTheme === "light"); } catch {}
    });
  });
  window.addEventListener("popstate", () => activate(location.pathname, false));
  activate(location.pathname, false);
})();
