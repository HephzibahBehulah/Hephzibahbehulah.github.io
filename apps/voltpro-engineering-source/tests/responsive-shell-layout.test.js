import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/ui/toolbar-layout.css", import.meta.url), "utf8");
const shellCss = readFileSync(new URL("../workspace-shell.css", import.meta.url), "utf8");
const toolbar = readFileSync(new URL("../src/ui/toolbar-layout.js", import.meta.url), "utf8");
const menus = readFileSync(new URL("../platform/toolbar-menus.js", import.meta.url), "utf8");
const page = readFileSync(new URL("../simulator.html", import.meta.url), "utf8");
const shell = readFileSync(new URL("../workspace-shell.js", import.meta.url), "utf8");
const shellHtml = readFileSync(new URL("../workspace-shell.html", import.meta.url), "utf8");

test("Simulator header groups shared controls instead of letting them drift into the menu row", () => {
  assert.match(css, /\.vp-sim-header-utilities\s*\{[^}]*display:flex!important/s);
  assert.match(css, /\.vp-sim-header-utilities\s*\{[^}]*order:6!important/s);
  assert.match(css, /\.vp-toolbar-menus\s*\{[^}]*min-width:0!important/s);
  assert.match(css, /@media\s*\(min-width:901px\)\s*and\s*\(max-width:1100px\)/);
  assert.match(css, /@media\s*\(max-width:900px\)/);
});

test("Simulator canvas, component library and inspector have non-overlapping responsive grid cells", () => {
  assert.match(css, /\.workspace\.vp-managed-panels>\.vp-canvas-frame\s*\{[^}]*position:relative!important/s);
  assert.match(css, /\.workspace\.vp-managed-panels>#palette\s*\{[^}]*grid-column:2!important;grid-row:2!important/s);
  assert.match(css, /\.workspace\.vp-managed-panels>#inspectorPanel\s*\{[^}]*grid-column:2!important;grid-row:3!important/s);
  assert.match(css, /\.workspace\.vp-managed-panels\.vp-left-closed>#palette\s*\{\s*display:none!important/s);
  assert.match(css, /\.workspace\.vp-managed-panels\.vp-right-closed>#inspectorPanel\s*\{\s*display:none!important/s);
});

test("embedded Simulator and responsive stylesheet use new cache keys", () => {
  assert.match(page, /toolbar-layout\.css\?v=20261029-dropdown2/);
  assert.match(shell, /simulator\.html\?vp_embed=1/);
});


test("VoltPro Simulator keeps a single non-scrolling menu row with its own mobile menu button", () => {
  assert.match(shellCss, /flex-flow:row nowrap/);
  assert.match(shellCss, /\.vp-toolbar-menus\[data-compact="true"\][\s\S]*?summary::before/);
  assert.match(shellCss, /\.vp-mobile-menu-toggle/);
  assert.match(shellCss, /vp-mobile-menu-mode\.vp-mobile-menus-open/);
  assert.match(shell, /aria-label", "VoltPro Simulator"/);
  assert.match(shell, /subtitle\.textContent = "Simulator"/);
});

test("Simulator dropdowns open as overlays and close after pointer leaves", () => {
  assert.match(toolbar, /box\.addEventListener\('pointerleave',scheduleMenuClose\)/);
  assert.match(toolbar, /positionMenu/);
  assert.match(toolbar, /hoverMenus=window\.matchMedia/);
  assert.match(toolbar, /pointerleave.*scheduleMenuClose/);
  assert.match(menus, /popover\.contains\(event\.target\).*event\.target\.closest\("\[data-vp-menu\]"\)/);
  assert.match(shellCss, /\.vp-toolbar-dropdown\s*\{[\s\S]*?position:fixed!important/);
});

test("workspace shell cache keys are bumped for the new Simulator header", () => {
  assert.match(shellHtml, /workspace-shell\.css\?v=20261028-menu1/);
  assert.match(shellHtml, /workspace-shell\.js\?v=20261028e/);
});
 
test("embedded Electrical uses exactly three grid rows so the canvas and drawers keep full height", () => {
  const electricalCss = readFileSync(new URL("../electrical-canvas.css", import.meta.url), "utf8");
  const electricalHtml = readFileSync(new URL("../electrical-canvas.html", import.meta.url), "utf8");
  assert.match(electricalCss, /html\.vp-electrical-embed body\{grid-template-rows:minmax\(48px,auto\) minmax\(0,1fr\) 28px\}/);
  assert.match(electricalCss, /html\.vp-electrical-embed \.cad-toolbar\{grid-row:1/);
  assert.match(electricalCss, /html\.vp-electrical-embed \.cad-layout\{grid-row:2/);
  assert.match(electricalCss, /html\.vp-electrical-embed \.cad-footer\{grid-row:3/);
  assert.match(electricalCss, /@media\(max-width:850px\)\{html\.vp-electrical-embed body\{grid-template-rows:minmax\(44px,auto\) minmax\(0,1fr\) 26px\}/);
  assert.match(electricalHtml, /electrical-canvas\.css\?v=20261031-responsive2/);
  assert.match(electricalHtml, /data-panel="library" aria-label="Installation objects" aria-expanded="true"/);
  assert.match(electricalCss, /\.cad-footer span\{white-space:nowrap;flex:0 0 auto\}/);
});

test("Electrical responsive controls keep the canvas usable, sync on resize, and toggle drawing details", async () => {
  const electricalCss = readFileSync(new URL("../electrical-canvas.css", import.meta.url), "utf8");
  const electricalJs = readFileSync(new URL("../electrical-canvas.js", import.meta.url), "utf8");
  const {installResponsiveElectricalControls} = await import("../electrical-responsive-ui.mjs");
  assert.match(electricalJs,/installResponsiveElectricalControls\(\{ document, window, togglePanel \}\)/);
  const makeButton = dataset => ({dataset, attributes:{}, handlers:{}, addEventListener(type, handler){this.handlers[type]=handler;}, setAttribute(name,value){this.attributes[name]=value;}, click(){this.handlers.click({currentTarget:this});}});
  const library = makeButton({panel:"library"});
  const closeLibrary = makeButton({closePanel:"library"});
  const titleToggle = makeButton({});
  const titleBlock = {dataset:{}};
  const titleFields = {hidden:false};
  const body = {dataset:{libraryOpen:"true"}};
  const media = {matches:true,handlers:{},addEventListener(type,handler){this.handlers[type]=handler;},set(matches){this.matches=matches;this.handlers.change({matches});}};
  const document = {body,querySelectorAll(selector){if(selector==="[data-panel]")return[library];if(selector==="[data-close-panel]")return[closeLibrary];if(selector==='[data-panel="library"]')return[library];return[];},querySelector(selector){return selector===".title-block"?titleBlock:titleFields;},getElementById(){return titleToggle;}};
  const togglePanel = (name,open=body.dataset[name+"Open"]!=="true")=>{body.dataset[name+"Open"]=String(open);document.querySelectorAll(`[data-panel="${name}"]`).forEach(button=>button.setAttribute("aria-expanded",String(open)));};
  installResponsiveElectricalControls({document,window:{matchMedia:()=>media},togglePanel});
  assert.equal(body.dataset.libraryOpen,"false");
  assert.equal(library.attributes["aria-expanded"],"false");
  assert.equal(titleFields.hidden,true);
  library.click();
  assert.equal(body.dataset.libraryOpen,"true");
  assert.equal(library.attributes["aria-expanded"],"true");
  closeLibrary.click();
  assert.equal(body.dataset.libraryOpen,"false");
  titleToggle.click();
  assert.equal(titleBlock.dataset.expanded,"true");
  assert.equal(titleFields.hidden,false);
  assert.equal(titleToggle.attributes["aria-expanded"],"true");
  titleToggle.click();
  assert.equal(titleFields.hidden,true);
  media.set(false);
  assert.equal(body.dataset.libraryOpen,"true");
  assert.equal(titleFields.hidden,false);
  media.set(true);
  assert.equal(body.dataset.libraryOpen,"false");
  assert.equal(titleFields.hidden,true);
  assert.match(electricalCss, /@media\(max-width:850px\)[\s\S]*?\.building-cad \.title-block-fields\{display:none\}/);
  assert.match(electricalCss, /\.building-cad \.title-block\[data-expanded="true"\] \.title-block-fields\{display:grid/);
  assert.match(electricalCss, /@media print\{[\s\S]*?\.building-cad #toggleTitleBlock\{display:none!important\}[\s\S]*?\.building-cad \.title-block-fields\{display:grid!important/);
  assert.match(electricalCss, /\.building-cad \.title-block\{right:8px;top:8px;bottom:auto/);
});

