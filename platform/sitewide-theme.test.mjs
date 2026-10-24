import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {injectSitewideTheme} from './sitewide-theme.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the charcoal and orange theme is injected into nested pages once', () => {
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
    }
  } finally {
    fs.rmSync(fixture, {recursive:true, force:true});
  }
});

test('shared theme defines consistent OSINT charcoal surfaces and orange navigation states', () => {
  const css = fs.readFileSync(path.join(root, 'css/sitewide-osint-theme.css'), 'utf8');
  assert.match(css, /--bg:#0b0d10!important/);
  assert.match(css, /--panel:#11151a!important/);
  assert.match(css, /--accent:#ff8a3d!important/);
  assert.match(css, /\.nav-item/);
  assert.match(css, /:focus-visible/);
  assert.ok(css.includes('html[data-hb-theme]'));
  assert.ok(css.includes('body.hb-unified'));
  assert.ok(css.includes('button[type="submit"]'));
  assert.ok(css.includes('html[data-hb-theme] body button[type="submit"]'));
  assert.match(css, /--hb-text:#e6edf3!important/);
  assert.match(css, /color-scheme:dark!important/);
});
