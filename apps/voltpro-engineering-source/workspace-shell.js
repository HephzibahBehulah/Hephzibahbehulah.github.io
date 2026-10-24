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
  const rootPrefix = /^\/engineering(?:\/|$)/.test(location.pathname) ? "/engineering" : "";
  const root = document.getElementById("vpWorkspace");
  const panels = new Map();

  function canonicalPath(path) {
    const local = path.startsWith(rootPrefix) ? path.slice(rootPrefix.length) : path;
    return local.replace(/\/$/, "") || "/";
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
      try { frame.contentDocument.documentElement.dataset.vpTheme = document.documentElement.dataset.vpTheme || "dark"; } catch {}
    });
    return panel;
  }
  function activate(path, push = true) {
    const key = canonicalPath(path);
    const tool = tools.find(item => item.path === key) || tools[0];
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
  window.addEventListener("popstate", () => activate(location.pathname, false));
  activate(location.pathname, false);
})();
