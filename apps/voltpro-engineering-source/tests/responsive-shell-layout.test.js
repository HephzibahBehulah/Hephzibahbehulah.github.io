import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/ui/toolbar-layout.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../simulator.html", import.meta.url), "utf8");
const shell = readFileSync(new URL("../workspace-shell.js", import.meta.url), "utf8");

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
  assert.match(page, /toolbar-layout\.css\?v=20261028b/);
  assert.match(shell, /simulator\.html\?vp_embed=1&v=20261028b/);
});
