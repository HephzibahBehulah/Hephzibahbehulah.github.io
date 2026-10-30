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

