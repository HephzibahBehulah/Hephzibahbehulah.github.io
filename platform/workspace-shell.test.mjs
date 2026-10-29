import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const nav = read("apps/voltpro-engineering-source/src/ui/site-shell.js");
const platformScript = read("platform/platform.js");
const shell = read("apps/voltpro-engineering-source/workspace-shell.js");
const shellHtml = read("apps/voltpro-engineering-source/workspace-shell.html");
const workspaceShellCss = read("apps/voltpro-engineering-source/workspace-shell.css");
const assistantTheme = read("apps/voltpro-engineering-source/voltpro-hb-theme.css");
const canvas = read("apps/voltpro-engineering-source/electrical-canvas.html");
const ai = read("apps/voltpro-engineering-source/voltpro-assistant.js");
const academy = read("apps/voltpro-engineering-source/index.html");

test("global bottom navigation keeps the required workspace order", () => {
  const block = nav.match(/for\(const \[icon,label,path\]of \[(.*?)\]\)\{const a=link/s)?.[1] || "";
  const labels = [...block.matchAll(/\['[^']*','([^']+)','[^']+'\]/g)].map(match => match[1]);
  assert.deepEqual(labels, ["Simulator", "PLC", "ElectCAD", "Engineering Tools", "Breadboard", "Oscilloscope", "Electrical"]);
});

test("main portfolio return link is same-tab and part of the persistent shared header", () => {
  assert.match(nav, /link\('← Main Site','https:\/\/hephzibahbehulah\.com\/'\)/);
  assert.match(nav, /brandGroup\.append\(brand,mainSite\)/);
  assert.doesNotMatch(nav.match(/const mainSite=.*?const nav=/)?.[0] || "", /target|data-vp-route/);
});

test("workspace switches isolate Simulator and PLC iframe lifecycles and update history client-side", () => {
  assert.match(shell, /const panels = new Map\(\)/);
  assert.match(shell, /function disposeIsolatedWorkspace\(path\)/);
  assert.match(shell, /if \(path !== "\/simulator" && path !== "\/plc"\) return/);
  assert.match(shell, /panel\.remove\(\);\n    panels\.delete\(path\);/);
  assert.match(shell, /frame\.src = rootPrefix \+ tool\.src/);
  const frameSetup = shell.slice(shell.indexOf("function ensurePanel"), shell.indexOf("function activate"));
  assert.ok(frameSetup.indexOf('frame.addEventListener("load"') < frameSetup.indexOf("frame.src = rootPrefix + tool.src"));
  assert.match(shell, /history\.pushState/);
  assert.match(shell, /element\.dataset\.active = String\(active\)/);
  for (const path of ["/simulator", "/plc", "/electcad", "/tools", "/breadboard", "/electrical"]) assert.ok(shell.includes('path: "' + path + '"'));
});

test("Simulator embed applies its template before first paint and resets shared chrome on entry", () => {
  const simulator = read("apps/voltpro-engineering-source/simulator.html");
  assert.match(simulator, /new URLSearchParams\(location\.search\).*vp_embed.*vp-template-simulator/);
  assert.match(shell, /frame\.loading = tool\.path === "\/simulator" \? "eager" : "lazy";/);
  assert.match(shell, /restoreSharedHeader\(\);\n    if \(activePath !== tool\.path\) disposeIsolatedWorkspace\(activePath\);\n    const panel = ensurePanel\(tool\);/);
});

test("Oscilloscope hides injected site chrome and leaving Breadboard closes its command menus", () => {
  assert.ok(workspaceShellCss.includes('html[data-vp-workspace="oscilloscope"] .hb-platform-bar'));
  assert.ok(workspaceShellCss.includes('html[data-vp-workspace="oscilloscope"] .hb-platform-footer'));
  assert.ok(shell.includes('doc.querySelectorAll(".breadboard-menubar details[open]").forEach(menu => { menu.open = false; });'));
  assert.ok(shell.includes('if (document.documentElement.dataset.vpWorkspace === "breadboard" && key !== "/breadboard") closeBreadboardCommandMenus();'));
});

test("bottom workspace links are intercepted and routed to their declared destination", () => {
  assert.ok(shell.includes('const link = event.target.closest("#vpBottomNavigation a[data-vp-route], #vpSiteHeader nav a[data-vp-route]");'));
  assert.ok(shell.includes("event.preventDefault();\n    activate(target);"));
});

test("ElectCAD uses a professional three-column scrollable CAD workspace", () => {
  const app = read("apps/voltpro-electcad/App.tsx");
  const appCss = read("apps/voltpro-electcad/styles.css");
  const siteCss = read("apps/voltpro-engineering-source/src/ui/site-shell.css");
  assert.match(shell, /classList\.toggle\("vp-electcad-maximized", tool\.path === "\/electcad"\)/);
  assert.match(nav, /if\(isElectCADRoute\)\{document\.documentElement\.classList\.add\('vp-electcad-maximized'\).*?return;\}const header=/);
  assert.match(platformScript, /else if\(!isElectCADWorkspace\)document\.body\.prepend\(header\)/);
  assert.match(platformScript, /if\(!isElectCADWorkspace&&!document\.querySelector\('\.os-footer,\.hb-footer-brand'\)\)document\.body\.append\(footer\)/);
  assert.match(siteCss, /vp-electcad-maximized #vpSiteHeader\{display:none!important\}/);
  assert.match(siteCss, /vp-electcad-maximized #vpWorkspace\{position:fixed!important;inset:0 0 80px!important/);
  assert.match(siteCss, /vp-electcad-maximized #vpDevelopmentBanner\{display:none!important\}/);

  assert.match(siteCss, /vp-bottom-dev-note/);
  assert.match(siteCss, /vp-electcad-maximized #vpBottomNavigation\{position:fixed;inset:auto 0 0/);
  assert.match(siteCss, /vp-electcad-maximized #vpDevelopmentBanner\{position:fixed;inset:auto 0 50px/);
  assert.match(siteCss, /vp-electcad-maximized #vpWorkspace \.vp-workspace-panel\[data-active=true\]\{position:absolute!important;inset:0!important;width:100%!important/);
  assert.match(siteCss, /vp-electcad-maximized #vpWorkspace \.vp-workspace-frame\{display:block!important;width:100%!important;height:100%!important/);
  assert.match(appCss, /app-shell\{display:grid;grid-template-rows:50px minmax\(0,1fr\);grid-template-columns:50px minmax\(0,1fr\) 280px/);
  assert.doesNotMatch(app, /global-bottom-bar/);
  assert.doesNotMatch(appCss, /global-bottom-bar/);
  assert.match(appCss, /html\.vp-electcad-embed \.topbar\{grid-column:1\/-1;grid-row:1;height:50px/);
  assert.match(appCss, /html\.vp-electcad-embed \.menu-toolbar-row\{display:contents/);
  assert.match(appCss, /html\.vp-electcad-embed \.icon-rail\{grid-column:1;grid-row:2/);
  assert.match(appCss, /html\.vp-electcad-embed \.left-sidebar\{width:250px;min-width:250px/);
  assert.match(appCss, /html\.vp-electcad-embed \.right-sidebar\{width:280px;min-width:280px/);
  assert.match(appCss, /html\.vp-electcad-embed \.workspace\{display:contents/);
  assert.match(appCss, /html\.vp-electcad-embed \.canvas-area\{grid-column:2;grid-row:2/);
  assert.match(appCss, /html\.vp-electcad-embed \.right-sidebar\{grid-column:3;grid-row:2;width:280px/);
  assert.match(appCss, /html\.vp-electcad-embed \.canvas-wrap\{position:relative;display:block;flex:1 1 0;min-width:0;min-height:0;overflow:auto/);
  assert.match(appCss, /html\.vp-electcad-embed \.canvas-rulers\{position:absolute;z-index:4;inset:0 0 109px 0/);
  assert.match(appCss, /\.menu-pop\{top:39px;left:0;min-width:205px;max-height:75vh;overflow:auto\}/);
  assert.match(appCss, /html\.vp-electcad-embed \.menu-pop\{z-index:9999\}/);
  assert.match(app, /id="app-container" className=\{`app-shell \$\{rightOpen\?\'\'\:\'right-collapsed\'\}`\}/);
  assert.match(app, /className="icon-rail" aria-label="Workspace panels"/);
  assert.match(app, /className="right-panel-tabs" role="tablist" aria-label="Right workspace panels"/);
  assert.match(app, /rightPanel==='properties'/);
  assert.match(app, /rightPanel==='results'/);
  assert.match(app, /className="results-view"/);
  assert.doesNotMatch(app, /className="bottom-dock"/);
  assert.match(app, /setRightPanel\('results'\)/);
  assert.match(app, /className="edge-reveal edge-right"/);
  assert.match(appCss, /\.app-shell\.right-collapsed\{grid-template-columns:50px minmax\(0,1fr\) 28px\}/);
  assert.match(appCss, /\.edge-reveal\.edge-right\{display:flex!important/);
  assert.match(appCss, /\.canvas-rulers\{inset:0 0 0 0\}/);
  assert.match(app, /className="electcad-main-site"[\s\S]*className="hb-brand"[\s\S]*Hephzibah Behulah[\s\S]*VoltPro <span>ElectCAD<\/span>[\s\S]*className="project-dropdown"/);
  assert.match(siteCss, /#vpBottomNavigation\{position:fixed/);
  assert.match(app, /new Worker\(new URL\('\.\/src\/dc-solver\.worker\.ts',import\.meta\.url\)/);
  assert.match(app, /worker\.terminate\(\)/);
  assert.match(appCss, /\.hb-brand strong\{display:inline!important/);

  assert.match(app, /title="Component Library" aria-label="Component Library"/);
  assert.match(app, /className="title-company-mark"[\s\S]*HEPHZIBAH BEHULAH[\s\S]*className="title-copyright"/);
  assert.match(app, /const printAllSheets=\(\)=>\{setPrintDocument\(true\)/);
  assert.match(app, /className="print-document" aria-label="Printable multi-sheet drawing set"/);
  assert.match(appCss, /@page\{size:A3 landscape;margin:8mm\}/);
  assert.match(appCss, /\.print-sheet:last-child\{break-after:auto;page-break-after:auto\}/);
  assert.match(app, /className="paper-ruler paper-ruler-top"/);
  assert.match(app, /className="paper-ruler paper-ruler-bottom"/);
  assert.match(app, /className="paper-ruler paper-ruler-left"/);
  assert.match(app, /className="paper-ruler paper-ruler-right"/);
  assert.match(app, /const worldWidth=Math\.max\(Math\.ceil\(viewportSize\.width\*3\)/);
  assert.match(app, /scrollLeft=p\.scrollLeft-\(e\.clientX-p\.clientX\)/);
  assert.match(app, /setCanvasScroll\(\{x:e\.currentTarget\.scrollLeft,y:e\.currentTarget\.scrollTop\}\)/);
  assert.match(app, /spreadsheetRowLabel\(firstRow\+i\)/);
  assert.match(app, /e\.ctrlKey\|\|e\.metaKey\).*changeCanvasZoom/);
  assert.match(app, /className="sheet-tabs" role="tablist"/);
  assert.match(app, /onDoubleClick=.*renameSheetById/);
  assert.match(app, /onContextMenu=.*duplicateSheetById/);
  assert.match(app, /targetSheetId/);
  assert.match(app, /wireCrossings\(wires\)/);
  assert.match(app, /kind==='junction'/);
  assert.match(app, /className="electcad-main-site" href="https:\/\/hephzibahbehulah\.com\/" target="_top"/);
  assert.match(app, /className="icon-btn theme-toggle"/);
  assert.match(app, /About &amp; readiness/);
  for (const label of ["Engineering Systems Lab", "Circuit Examples", "GitHub Repositories"]) assert.ok(app.includes(label));
  for (const movedLink of ["Learning sites / Academy", "Open Workbench", "PLC studies"]) assert.ok(app.includes(movedLink));
});


test("the academy sidebar includes the Electrical Building destination", () => {
  assert.ok(academy.includes('href="/electrical"'));
  assert.ok(academy.includes("VoltPro Electrical Building"));
});

test("Electrical Building uses its dedicated architectural plan editor", () => {
  assert.ok(shell.includes('path: "/electrical", title: "VoltPro Electrical Building", src: "/electrical-canvas.html?vp_embed=1"'));
  assert.match(canvas, /BuildingCAD/);
  assert.match(read("apps/voltpro-engineering-source/electrical-canvas.js"), /validateBuildingDocument/);
  assert.match(read("apps/voltpro-engineering-source/src/ui/account.js"), /schemaVersion===2\|\|item\.data\?\.schemaVersion===3/);
});

test("the public /engineering alias keeps tool iframe URLs at the domain root", () => {
  assert.ok(shell.includes("rootPrefix = location.hostname.startsWith"));
});


test("persistent workspace shell loads the engineering assistant styles", () => {
  assert.ok(shellHtml.includes("voltpro-hb-theme.css?v="));
  assert.ok(assistantTheme.includes("display:none;flex-direction:column"));
});

test("assistant launcher and chat panel clear the fixed bottom workspace navigation", () => {
  assert.ok(assistantTheme.includes("bottom:calc(82px + env(safe-area-inset-bottom))"));
  assert.ok(assistantTheme.includes("bottom:calc(154px + env(safe-area-inset-bottom))"));
});

test("BuildingCAD includes measured grid, rulers, title block and editable properties", () => {
  for (const id of ["topRulerTicks", "leftRulerTicks", "planSurface", "componentLibrary", "title-block", "propertiesForm", "projectName", "documentNumber", "revision", "projectDate", "titleScale", "drafter", "componentTag", "componentRoom", "componentVoltage"]) assert.ok(canvas.includes(id));
  assert.match(canvas, /200 mm \/ square/);
});

test("BuildingCAD menus have live document, edit, draw, validation and layer commands", () => {
  for (const action of ["new", "open", "save", "export", "print", "undo", "redo", "delete", "select", "room", "wire", "validate", "references", "schedule", "fit"]) assert.ok(canvas.includes(`data-command="${action}"`));
  const source = read("apps/voltpro-engineering-source/electrical-canvas.js");
  for (const handler of ["function validate()", "function openProject(", "function undo()", "function redo()", "function addRoom(", "function showSchedule()"]) assert.ok(source.includes(handler));
});

test("PLC command menus are wired to project, editing, draw, validation, simulation, and view handlers", () => {
  const menu = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/CommandMenus.tsx");
  const layout = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/WorkspaceLayout.tsx");
  for (const item of ["File", "Edit", "Draw", "Project", "Simulation", "Tools", "View", "New control project", "Open / import project JSON", "Validate program", "On-delay timer", "Reset scan memory"]) assert.ok(menu.includes(item));
  for (const prop of ["onNew=", "onOpen=", "onSave=", "onCloudSave=", "onExport=", "onUndo=", "onRedo=", "onDraw=", "onValidate=", "onReset=", "onFit=", "onView="]) assert.ok(layout.includes(prop));
  for (const feature of ["plc-run-controls", "Single scan", "onArduino", "onNewSheet", "plc-system-project-slot"]) assert.ok(layout.includes(feature) || menu.includes(feature));
});

test("ElectCAD Tools exposes connectivity, wire numbering, and a non-certifying symbol provenance audit", () => {
  const app = read("apps/voltpro-electcad/App.tsx");
  assert.ok(app.includes("['Run connectivity diagnostics',runDiagnostics]"));
  assert.ok(app.includes("['Wire numbering',autoNumberWires]"));
  assert.ok(app.includes("['Audit symbol source IDs',reviewStandardsProvenance]"));
  assert.match(app, /installation-specific DIN VDE checks are not assessed/);
});

test("ElectCAD places parts in the inspector and wires to terminals or free canvas points", () => {
  const app = read("apps/voltpro-electcad/App.tsx");
  assert.match(app, /setParts\(prev=>\[\.\.\.prev,part\]\);selectForInspector\(part\.id\)/);
  assert.ok(app.includes("onTerminalClick(index)"));
  assert.ok(app.includes("onTerminalClick={index=>tool==='wire'?handleTerminalClick(p,index):selectForInspector(p.id)}"));
  assert.match(app, /r="26" fill="transparent" stroke="none" pointerEvents="all"/);
  assert.match(app, /onPointerDown=\{e=>\{if\(!onTerminalClick\)return;e\.preventDefault\(\);e\.stopPropagation\(\);onTerminalClick\(index\)\}\}/);
  assert.match(app, /WIRE MODE/);
  assert.match(app, /if\(!wireStart\)\{setWireStart\(\{x,y\}\)/);
  assert.ok(app.includes("placeWireSegment(wireStart,{x,y})"));
  assert.match(app, /e\.key==='Enter'&&tool==='wire'&&wireStart/);
  assert.ok(app.includes('Wire path finished · Wire tool remains active'));
});

test("ElectCAD rail buttons open distinct panels and close the flyout when the pointer leaves", () => {
  const app = read("apps/voltpro-electcad/App.tsx");
  const css = read("apps/voltpro-electcad/styles.css");
  for (const panel of ["pages", "components", "search"]) assert.ok(app.includes(`setLeftPanel('${panel}')`));
  assert.match(app, /icon-rail[^\n]*onMouseLeave=\{\(\)=>\{panelCloseTimer\.current=window\.setTimeout\(\(\)=>setLeftOpen\(false\),180\)\}\}/);
  assert.match(css, /left-sidebar\.panel-pages .*library-head/);
  assert.match(css, /left-sidebar\.panel-components .*pages-heading/);
});

test("ElectCAD account controls stay inside the CAD header instead of floating over the inspector", () => {
  assert.match(read("platform/member.js"), /voltpro-electcad/);
  assert.match(read("apps/voltpro-electcad/App.tsx"), /className="account-popover"/);
});

test("legacy ElectCAD URL casing cannot inject the portfolio header or member controls", () => {
  assert.match(platformScript, /isElectCADWorkspace=.*voltpro-electcad.*\/i\.test\(location\.pathname\)/);
  assert.match(read("platform/member.js"), /voltpro-electcad.*\/i\.test\(location\.pathname\)/);
  assert.match(read("platform/router.mjs"), /voltpro-electcad.*\/i\.test\(relative\)/);
  assert.ok(read("platform/build.mjs").includes('href="/electcad"'));
  assert.match(read("apps/voltpro-electcad-source/vite.config.ts"), /hephzibahbehulah\.com\/electcad/);
});

test("ElectCAD File to Help dropdowns escape horizontal menu clipping and stack above the canvas", () => {
  const css = read("apps/voltpro-electcad/styles.css");
  assert.match(css, /menubar\{position:relative;z-index:10002;overflow:visible!important\}/);
  assert.match(css, /menu-pop\{position:absolute;z-index:10004/);
  assert.match(css, /canvas-area\{position:relative;z-index:0\}/);
  assert.match(css, /Dropdowns must escape the header[\s\S]*?\.topbar\{overflow:visible!important\}/);
});

test("Breadboard command menu proxies only to implemented native controls", () => {
  const html = read("apps/voltpro-engineering-source/breadboard.html");
  const proxies = [...html.matchAll(/data-proxy=(?:"([^"]+)"|'([^']+)')/g)].map(match => match[1] || match[2]);
  assert.ok(proxies.length >= 15);
  for (const target of proxies) {
    if (target === "print") continue;
    if (target === "#bbUndo" || target === "#bbRedo") {
      const studio = read("apps/voltpro-engineering-source/src/ui/breadboard-studio.js");
      assert.ok(studio.includes(`id="${target.slice(1)}"`), `Missing dynamic ${target}`);
      continue;
    }
    if (target.startsWith("#")) assert.ok(html.includes(`id="${target.slice(1)}"`), `Missing ${target}`);
    else assert.ok(html.includes(target.replaceAll('\\"', '"')), `Missing ${target}`);
  }
  assert.match(html, /\.breadboard-menubar \[data-proxy\].*?\.click\(\)/s);
});

test("all five editor entry points load the shared charcoal and orange finish", () => {
  const shared = read("apps/voltpro-engineering-source/workspace-engineering-theme.css");
  assert.match(shared, /--vp-workspace-accent:#ff8a24/);
  for (const file of ["apps/voltpro-engineering-source/simulator.html", "apps/voltpro-engineering-source/breadboard.html", "apps/voltpro-engineering-source/electrical-canvas.html"]) assert.ok(read(file).includes("workspace-engineering-theme.css"));
  assert.ok(read("apps/voltpro-engineering-source/apps/voltpro-plc/src/main.tsx").includes("workspace-engineering-theme.css"));
  assert.ok(read("apps/voltpro-electcad/main.tsx").includes("workspace-engineering-theme.css"));
});

test("Adigun switches into architectural wiring context on the electrical route", () => {
  assert.match(ai, /building-electrical/);
  assert.match(ai, /Architectural\/Building Wiring/);
});

test("shared engineering design system reaches main, admin, embedded and standalone tool routes", () => {
  const theme = read("apps/voltpro-engineering-source/workspace-engineering-theme.css");
  const shellCss = read("apps/voltpro-engineering-source/src/ui/site-shell.css");
  const appRoutes = ["index.html", "academy-workbench.html", "engineering.html", "simulator.html", "breadboard.html", "electrical-canvas.html"]
    .map(file => read("apps/voltpro-engineering-source/" + file));
  const plcEntry = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/main.tsx");
  assert.match(theme, /font-family:Inter,"Segoe UI",system-ui,sans-serif/);
  assert.match(theme, /--vp-workspace-accent:#ff8a24/);
  assert.match(theme, /\.vp-site-navigation>summary:hover/);
  assert.match(shellCss, /vp-site-navigation/);
  for (const html of appRoutes) assert.match(html, /workspace-engineering-theme\.css/);
  assert.match(plcEntry, /workspace-engineering-theme\.css/);
  assert.match(shell, /hostname\.startsWith\("admin\."\)/);
  assert.match(shell, /frame\.src = rootPrefix \+ tool\.src/);
});

test("PLC project view switching keeps the same editable project and scan mode", () => {
  const app = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/App.tsx");
  const layout = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/WorkspaceLayout.tsx");
  const menu = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/CommandMenus.tsx");
  const store = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/store.ts");
  const io = read("apps/voltpro-engineering-source/apps/voltpro-plc/src/PLCIOView.tsx");
  assert.match(menu, /p\.onView\('ladder'\)/);
  assert.match(menu, /p\.onView\('fbd'\)/);
  assert.match(menu, /p\.onView\('plc'\)/);
  assert.match(layout, /const setView = \(view: 'ladder' \| 'fbd' \| 'plc'\)/);
  assert.match(layout, /project: \{ \.\.\.s\.project, mode: view \}/);
  assert.match(store, /view:'ladder'\|'fbd'\|'plc';setView/);
  assert.match(layout, /s\.view === 'plc' \? <PLCIOView project=\{s\.project\}/);
  assert.match(io, /same device tags, terminals, wires and scan results/);
});

test("shared Adigun voice input fills the new chat without sending automatically", () => {
  const assistant = read("apps/voltpro-engineering-source/src/ui/assistant-chat.js");
  assert.match(assistant, /class="adigun-voice"/);
  assert.match(assistant, /voice\.onresult=event=>\{input\.value/);
  assert.match(assistant, /voice\.onend=\(\)=>\{button\.disabled=false\}/);
  assert.match(assistant, /Voice input is not available in this browser/);
  assert.match(assistant, /removeLegacyLauncher/);
  assert.match(assistant, /legacyLauncherObserver\.observe/);
});

test("embedded ElectCAD keeps zoom and all five requested top controls reachable", () => {
  const app = read("apps/voltpro-electcad/App.tsx");
  const css = read("apps/voltpro-electcad/styles.css");
  for (const phrase of ["Zoom out", "Zoom in", "My workspace and examples", "Interface language", "About and readiness", "VoltPro account"]) assert.ok(app.includes(phrase));
  assert.match(app, /\{zoom\}%/);
  assert.match(css, /\.menubar \.menu-wrap:nth-child\(n\+6\)\{display:flex!important\}/);
  assert.match(css, /\.top-actions \.header-dropdown\{display:flex!important\}/);
  assert.match(css, /\.toolbar \.zoom-control,html\.vp-electcad-embed \.toolbar \.toolbar-spacer,html\.vp-electcad-embed \.toolbar \.primary-btn\{display:flex!important\}/);
  assert.match(css, /grid-template-rows:46px 48px/);
});

test("engineering workspace header stays one row and keeps workspace menus out of layout flow",()=>{
  const experience=read("platform/experience.css");
  assert.match(experience,/\.hb-engineering #vpSiteHeader\{[\s\S]*?display:flex!important;flex-flow:row nowrap!important/);
  assert.match(experience,/\.hb-engineering #vpSiteHeader \.hb-utilities\{display:none!important\}/);
  assert.match(experience,/\.hb-engineering #vpSiteHeader \.vp-site-navigation nav,[\s\S]*?position:absolute!important/);
  assert.match(experience,/\.hb-engineering #vpSiteHeader \.vp-shell-controls\{[\s\S]*?margin:0!important/);
  assert.match(experience,/\.hb-engineering #vpSiteHeader \.hb-vp-tools\{[\s\S]*?margin:0 0 0 auto!important/);
  assert.match(experience,/\.hb-engineering #vpSiteHeader \.hb-member-actions\{flex-flow:row nowrap!important/);
});

test("fixed engineering header and readiness banner reserve their viewport space",()=>{
  const experience=read("platform/experience.css");
  assert.match(experience,/html\.vp-unified-site body\.hb-engineering\{[\s\S]*?--vp-header-height:60px!important;[\s\S]*?padding-top:calc\(var\(--vp-header-height\) \+ var\(--vp-development-banner-height\)\)!important/);
  assert.match(experience,/\.hb-engineering #vpDevelopmentBanner\{top:var\(--vp-header-height\)!important\}/);
});


test("Oscilloscope root project navigation contains exactly seven tools in the requested order",()=>{
 const section=academy.split('Design &amp; simulation</summary>')[1].split('</div></details>')[0];
 assert.deepEqual([...section.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['/simulator','/plc','/electcad','/breadboard','/oscilloscope','/electrical','/tools']);
 assert.match(shell,/path: "\/oscilloscope".*oscilloscope\.html/);
});


test("shared engineering language selector offers all four choices on every requested route", () => {
  const expected = "[['en','English'],['de','Deutsch'],['yo','Yoruba'],['pid','Pidgin English (PNG)']]";
  assert.ok(nav.includes(expected), "shared header must offer all four named choices");
  for (const route of ["/electcad", "/breadboard", "/electrical", "/oscilloscope", "/simulator"]) {
    assert.ok(shell.includes('path: "' + route + '"'), "missing shared route " + route);
  }
  assert.doesNotMatch(shell, /option.textContent = option.value.toUpperCase/);
});


test("oscilloscope initialization has no handler for removed image control", () => {
  const html = read("apps/voltpro-engineering-source/oscilloscope.html");
  const app = read("apps/voltpro-engineering-source/oscilloscope/app.mjs");
  assert.ok(!html.includes('id="image"'), "PNG export control stays out of the header");
  assert.ok(!app.includes("$('#image').onclick"), "startup must not bind to the removed PNG control");
  assert.ok(app.includes("Export waveform PNG"), "PNG export remains available from the File menu");
});
