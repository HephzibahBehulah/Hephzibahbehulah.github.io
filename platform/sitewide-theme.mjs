import fs from 'node:fs';
import path from 'node:path';

const LINK = '<link rel="stylesheet" href="/_hb/sitewide-osint-theme.css?v=1" data-hb-sitewide-theme>';

export function injectSitewideTheme(root) {
  const pages = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) pages.push(file);
    }
  }
  collect(root);
  let injected = 0;
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    if (html.includes('data-hb-sitewide-theme')) continue;
    if (!/<head(?:\s[^>]*)?>/i.test(html) || !/<\/head\s*>/i.test(html)) continue;
    const updated = html.replace(/<\/head\s*>/i, LINK + '</head>');
    if (updated === html) throw new Error('Could not apply the global theme to ' + path.relative(root, file));
    fs.writeFileSync(file, updated);
    injected++;
  }
  if (injected === 0 && pages.length === 0) throw new Error('No built HTML pages were found for the global theme.');
  const themed = pages.filter(file => fs.readFileSync(file, 'utf8').includes('data-hb-sitewide-theme'));
  if (themed.length === 0) throw new Error('The global theme was not applied to any built HTML page.');
  return {pages:pages.length, themed:themed.length, injected};
}
