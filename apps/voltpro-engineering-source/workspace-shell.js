(() => {
  "use strict";
  const tools = [
    { path: "/simulator", title: "VoltPro Simulator", src: "/simulator.html?vp_embed=1" },
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

  function restoreSharedHeader() {
    if (!sharedHeader || sharedHeader.parentElement === document.body) return;
    const banner = document.getElementById("vpDevelopmentBanner");
    document.body.insertBefore(sharedHeader, banner || headerPlaceholder?.nextSibling || document.body.firstChild);
    headerPlaceholder?.remove();
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
    if (toolbar.parentElement !== top) top.append(toolbar);
    if (sharedHeader.ownerDocument !== doc || sharedHeader.parentElement !== top) top.append(doc.adoptNode(sharedHeader));
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
