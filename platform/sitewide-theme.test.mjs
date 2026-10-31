import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {injectSitewideTheme} from './sitewide-theme.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the shared brand theme is injected into nested pages once', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-theme-'));
  try {
    fs.mkdirSync(path.join(fixture, '_apps/engineering'), {recursive:true});
    fs.writeFileSync(path.join(fixture, 'index.html'), '<html><head><title>Main</title></head><body></body></html>');
    fs.writeFileSync(path.join(fixture, '_apps/engineering/tool.html'), '<html><head></head><body></body></html>');
    fs.writeFileSync(path.join(fixture, 'fragment.html'), '<section>Not a page head</section>');
    assert.deepEqual(injectSitewideTheme(fixture), {pages:3, themed:2, injected:2});
    assert.deepEqual(injectSitewideTheme(fixture), {pages:3, themed:2, injected:0});
    for (const file of ['index.html', '_apps/engineering/tool.html']) {
      const html = fs.readFileSync(path.join(fixture, file), 'utf8');
      assert.equal((html.match(/data-hb-sitewide-theme/g) || []).length, 1);
      assert.ok(html.indexOf('sitewide-osint-theme.css') < html.indexOf('</head>'));
      assert.ok(html.includes('sitewide-osint-theme.css?v=2'));
    }
  } finally {
    fs.rmSync(fixture, {recursive:true, force:true});
  }
});

test('shared brand theme matches the product template and supports both colour modes', () => {
  const css = fs.readFileSync(path.join(root, 'packages/shared-ui/css/sitewide-osint-theme.css'), 'utf8');
  const chrome = fs.readFileSync(path.join(root, 'platform/experience.css'), 'utf8');
  assert.match(css, /--bg:#0a1118/);
  assert.match(css, /--panel:#111c26/);
  assert.match(css, /--accent:#48d8d0/);
  assert.match(css, /html\[data-hb-theme="light"\]/);
  assert.match(css, /--bg:#f2f5f6/);
  assert.match(css, /--accent:#087e83/);
  assert.doesNotMatch(css, /#ff8a3d/);
  assert.match(css, /\.nav-item/);
  assert.match(css, /:focus-visible/);
  assert.ok(css.includes('html[data-hb-theme="dark"]'));
  assert.ok(css.includes('body.hb-unified'));
  assert.ok(css.includes('button[type="submit"]'));
  assert.ok(css.includes('html[data-hb-theme] body.hb-unified button[type="submit"]'));
  assert.match(css, /--hb-text:#eef4f5/);
  assert.match(css, /color-scheme:dark/);
  assert.match(css, /color-scheme:light/);
  assert.match(chrome, /--hb-surface:#111c26/);
  assert.match(chrome, /--bg:#0a1118/);
  assert.match(chrome, /--hb-glow:#48d8d0/);
  assert.match(chrome, /--bg:#f2f5f6/);
  assert.match(chrome, /--accent:#087e83/);
});

test('private command center and workbench use parent and product wordmarks with valid workspace links', () => {
  const control = fs.readFileSync(path.join(root, 'apps/admin/admin.html'), 'utf8');
  const tools = fs.readFileSync(path.join(root, 'apps/admin/admin-tools.html'), 'utf8');
  const cyber = fs.readFileSync(path.join(root, 'apps/cyber-os/index.html'), 'utf8');
  for (const html of [control, tools, cyber]) {
    assert.match(html, /class="hb-company-wordmark">HEPHZIBAH<br>BEHULAH/);
    assert.match(html, /class="hb-product-wordmark">ADIGUN/);
  }
  assert.match(control, /href="\/admin\/" aria-label="HEPHZIBAH BEHULAH, ADIGUN Control"/);
  assert.match(tools, /href="\/admin\/cyber-os\/"[^>]*>⌘ ADIGUN CYBER OS/);
  assert.match(tools, /href="\/admin\/">ADIGUN Control/);
  assert.doesNotMatch(tools, /adigun-contol/);
});

test('private applications menu exposes every protected workspace under the admin host', () => {
  const platform = fs.readFileSync(path.join(root, 'platform/platform.js'), 'utf8');
  for (const [name, pathName] of [['Simulator','simulator'],['PLC','plc'],['ElectCAD','electcad'],['Breadboard','breadboard'],['Oscilloscope','oscilloscope'],['Electrical / BuildingCAD','electrical']]) {
    assert.ok(platform.includes("['" + name + "','" + pathName + "']"), name + ' must appear in the protected application menu');
  }
  assert.ok(platform.includes("link('Public website','https://'+domain+'/')"), 'public website must have a portal link');
  assert.ok(platform.includes("'/engineering/'"), 'engineering overview must have a portal link');
  assert.match(platform, /sidebar\.querySelector\('\.os-brand'\)\?\.after\(section\)/, 'the unified applications menu must mount on every private workspace page');
});

test('ADIGUN command center and Tool Lab directly link all VoltPro workspaces', () => {
  for (const file of ['apps/admin/admin.html', 'apps/admin/admin-tools.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /data-nav-group="workbench"[\s\S]*?VoltPro Engineering overview/);
    for (const route of ['simulator', 'plc', 'electcad', 'breadboard', 'oscilloscope', 'electrical']) {
      assert.ok(html.includes(`href="/engineering/${route}"`), `${file} must link the ${route} workspace`);
    }
  }
});

test('Cyber OS carries the parent wordmark and its own product wordmark in the shared theme', () => {
  const html = fs.readFileSync(path.join(root, 'apps/cyber-os/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'platform/experience.css'), 'utf8');
  const engineeringCss = fs.readFileSync(path.join(root, 'apps/voltpro-engineering-source/src/ui/site-shell.css'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'apps/cyber-os/adigun-cyber-os.webmanifest'), 'utf8'));
  const logo = fs.readFileSync(path.join(root, 'apps/cyber-os/assets/adigun-cyber-os.svg'), 'utf8');
  assert.match(html, /HEPHZIBAH BEHULAH/);
  assert.match(html, /ADIGUN/);
  assert.match(html, /Cyber OS/);
  assert.match(html, /a product of HEPHZIBAH BEHULAH/i);
  assert.match(html, /name="theme-color" content="#0a1118"/);
  assert.match(html, /rel="manifest" href="\/cyber-os\/adigun-cyber-os\.webmanifest"/);
  assert.match(html, /rel="icon" type="image\/svg\+xml" href="\/cyber-os\/assets\/adigun-cyber-os\.svg"/);
  assert.equal(manifest.name, 'ADIGUN Cyber OS | HEPHZIBAH BEHULAH');
  assert.equal(manifest.icons[0].src, '/cyber-os/assets/adigun-cyber-os.svg');
  assert.match(logo, /<title id="title">ADIGUN Cyber OS<\/title>/);
  assert.match(css, /\.os-brand\.hb-product-lockup/);
  assert.match(css, /\.hb-company-wordmark/);
  assert.match(css, /\.hb-product-wordmark/);
  assert.match(css, /html\[data-hb-theme=light\] \.hb-product-wordmark/);
  assert.match(engineeringCss, /#vpSiteHeader \.vp-product-wordmark[^}]*color:#48d8d0/);
  assert.doesNotMatch(engineeringCss, /#vpSiteHeader \.vp-product-wordmark[^}]*color:#ff9b43/);
});

