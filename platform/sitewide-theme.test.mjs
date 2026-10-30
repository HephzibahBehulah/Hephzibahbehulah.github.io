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
